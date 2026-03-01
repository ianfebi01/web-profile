/**
 * Full re-migration script: wipe all Payload data, then re-import
 * everything from Strapi (EN + ID locales) with images.
 *
 *   npx tsx scripts/remigrate-all.ts
 */
import fs from 'fs'
import path from 'path'
import os from 'os'
import qs from 'qs'

// ---------- ENV ----------
const envFile = fs.readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

// ---------- STRAPI HELPERS ----------
async function fetchStrapi(endpoint: string) {
  const url = `${STRAPI_URL}/api/${endpoint}`
  console.log(`[Strapi] Fetching ${url}`)
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`)
  return res.json()
}

async function downloadMedia(url: string, name: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}`)
  const buffer = await res.arrayBuffer()
  const filePath = path.join(os.tmpdir(), name)
  fs.writeFileSync(filePath, new Uint8Array(buffer))
  return filePath
}

// ---------- MARKDOWN → LEXICAL HELPERS ----------
function parseTextWithModes(text: string) {
  const children: any[] = []
  const regex = /(\*\*.*?\*\*)/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      children.push({ mode: 'normal', text: text.substring(lastIndex, match.index), type: 'text', style: '', detail: 0, format: 0, version: 1 })
    }
    children.push({ mode: 'normal', text: match[0].slice(2, -2), type: 'text', style: '', detail: 0, format: 1, version: 1 })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    children.push({ mode: 'normal', text: text.substring(lastIndex), type: 'text', style: '', detail: 0, format: 0, version: 1 })
  }
  return children.length ? children : [{ mode: 'normal', text: '', type: 'text', style: '', detail: 0, format: 0, version: 1 }]
}

function convertMarkdownToLexical(markdown: string) {
  if (!markdown || typeof markdown !== 'string') return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [] } }
  const lines = markdown.split('\n').map(l => l.trim())
  const rootChildren: any[] = []
  let currentList: any = null
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('## ')) {
      if (currentList) { rootChildren.push(currentList); currentList = null }
      rootChildren.push({ type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: parseTextWithModes(line.replace(/^##\s*/, '')) })
    } else if (line.startsWith('### ')) {
      if (currentList) { rootChildren.push(currentList); currentList = null }
      rootChildren.push({ type: 'heading', tag: 'h3', format: '', indent: 0, version: 1, direction: 'ltr', children: parseTextWithModes(line.replace(/^###\s*/, '')) })
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!currentList) {
        currentList = { type: 'list', listType: 'bullet', tag: 'ul', start: 1, format: '', indent: 0, version: 1, direction: 'ltr', children: [] }
      }
      currentList.children.push({ type: 'listitem', value: currentList.children.length + 1, format: '', indent: 0, version: 1, direction: 'ltr', children: parseTextWithModes(line.replace(/^[*|-]\s*/, '')) })
    } else {
      if (currentList) { rootChildren.push(currentList); currentList = null }
      rootChildren.push({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children: parseTextWithModes(line) })
    }
  }
  if (currentList) rootChildren.push(currentList)
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: rootChildren } }
}

// ---------- MAIN ----------
async function run() {
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../app/payload.config')
  const payload = await getPayload({ config: configPromise })

  // Shared maps to avoid duplicate uploads / link references
  const mediaMap = new Map<number, string>()   // strapiId → payloadId
  const tagsMap  = new Map<number, string>()
  const skillsMap = new Map<number, string>()

  async function uploadMedia(strapiMedia: any): Promise<string | null> {
    if (!strapiMedia) return null
    if (mediaMap.has(strapiMedia.id)) return mediaMap.get(strapiMedia.id)!

    const { url, name, alternativeText } = strapiMedia.attributes
    try {
      const filePath = await downloadMedia(url, name)
      const media = await payload.create({
        collection: 'media',
        data: { alt: alternativeText || name },
        filePath,
      })
      mediaMap.set(strapiMedia.id, media.id as string)
      return media.id as string
    } catch (e: any) {
      console.error(`  ✗ Failed to upload media ${name}:`, e.message)
      return null
    }
  }

  // ─────────────────────────────────────────────
  // STEP 0 — Wipe existing Payload data
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 0: Wiping existing data ===')

  const collections = ['pages', 'projects', 'articles', 'experiences', 'skills', 'tags', 'media'] as const
  for (const col of collections) {
    try {
      const existing = await payload.find({ collection: col, limit: 1000, locale: 'all' })
      for (const doc of existing.docs) {
        await payload.delete({ collection: col, id: doc.id })
      }
      console.log(`  ✓ Cleared ${existing.docs.length} docs from "${col}"`)
    } catch (e: any) {
      console.error(`  ✗ Error clearing ${col}:`, e.message)
    }
  }

  // Reset globals (set to empty / default values)
  try {
    await payload.updateGlobal({ slug: 'site', data: { name: '', description: '', socialPlatformLinks: [] } as any })
    await payload.updateGlobal({ slug: 'profile', data: { name: '', bio: '', socialPlatformLinks: [] } as any })
    await payload.updateGlobal({ slug: 'main-menu', data: { navItems: [] } as any })
    console.log('  ✓ Reset globals (site, profile, main-menu)')
  } catch(e: any) { console.error('  ✗ Error resetting globals:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 1 — Tags (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 1: Migrating Tags ===')
  try {
    const tagsRes = await fetchStrapi('tags?populate=*')
    for (const t of tagsRes.data) {
      try {
        const doc = await payload.create({
          collection: 'tags',
          data: { title: t.attributes.title, slug: t.attributes.slug },
        })
        tagsMap.set(t.id, doc.id as string)
        console.log(`  ✓ ${t.attributes.title}`)
      } catch (e: any) { console.error(`  ✗ Tag "${t.attributes.title}":`, e.message) }
    }
  } catch (e: any) { console.error('Skipping Tags:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 2 — Skills (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 2: Migrating Skills ===')
  try {
    const skillsRes = await fetchStrapi('skills?populate=*')
    for (const s of skillsRes.data) {
      try {
        const imageId = await uploadMedia(s.attributes.image?.data)
        const doc = await payload.create({
          collection: 'skills',
          data: {
            name: s.attributes.name,
            description: s.attributes.description,
            image: imageId as any,
          },
        })
        skillsMap.set(s.id, doc.id as string)
        console.log(`  ✓ ${s.attributes.name}`)
      } catch (e: any) { console.error(`  ✗ Skill "${s.attributes.name}":`, e.message) }
    }
  } catch (e: any) { console.error('Skipping Skills:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 3 — Projects (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 3: Migrating Projects (EN) ===')
  try {
    const projectsRes = await fetchStrapi('portofolios?populate=*')
    for (const p of projectsRes.data) {
      try {
        const featureImage = await uploadMedia(p.attributes.featureImage?.data)
        const gallery: any[] = []
        if (p.attributes.gallery?.data) {
          for (const g of p.attributes.gallery.data) {
            const mId = await uploadMedia(g)
            if (mId) gallery.push({ image: mId })
          }
        }
        const pSkills = p.attributes.skills?.data?.map((sk: any) => skillsMap.get(sk.id)).filter(Boolean) || []

        await payload.create({
          collection: 'projects',
          data: {
            title: p.attributes.title,
            slug: p.attributes.slug,
            description: p.attributes.description,
            content: p.attributes.content,
            thumbnail: featureImage as any,
            gallery,
            url: p.attributes.url,
            skills: pSkills,
          },
        })
        console.log(`  ✓ ${p.attributes.title}`)
      } catch (e: any) { console.error(`  ✗ Project "${p.attributes.title}":`, e.message) }
    }
  } catch (e: any) { console.error('Skipping Projects:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 4 — Articles (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 4: Migrating Articles (EN) ===')
  try {
    const articlesRes = await fetchStrapi('articles?populate=*')
    for (const a of articlesRes.data) {
      try {
        const heroImage = await uploadMedia(a.attributes.featureImage?.data)
        const pTags = a.attributes.tags?.data?.map((t: any) => tagsMap.get(t.id)).filter(Boolean) || []

        await payload.create({
          collection: 'articles',
          data: {
            title: a.attributes.title,
            slug: a.attributes.slug,
            introText: a.attributes.description || a.attributes.introText,
            content: a.attributes.content,
            heroImage: heroImage as any,
            tags: pTags,
          },
        })
        console.log(`  ✓ ${a.attributes.title}`)
      } catch (e: any) { console.error(`  ✗ Article "${a.attributes.title}":`, e.message) }
    }
  } catch (e: any) { console.error('Skipping Articles:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 5 — Experiences (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 5: Migrating Experiences (EN) ===')
  try {
    const expRes = await fetchStrapi('experiences?populate=*&pagination[pageSize]=100')
    for (const exp of expRes.data) {
      try {
        await payload.create({
          collection: 'experiences',
          data: {
            companyName: exp.attributes.companyName,
            role: exp.attributes.role,
            startDate: exp.attributes.startDate,
            endDate: exp.attributes.endDate || null,
            description: exp.attributes.description || '',
          },
        })
        console.log(`  ✓ ${exp.attributes.role} at ${exp.attributes.companyName}`)
      } catch (e: any) { console.error(`  ✗ Experience:`, e.message) }
    }
  } catch (e: any) { console.error('Skipping Experiences:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 6 — Pages (EN) with blocks + banner
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 6: Migrating Pages (EN) ===')
  try {
    const pagesListRes = await fetchStrapi('pages?populate=*')
    for (const p of pagesListRes.data) {
      console.log(`  Migrating page: ${p.attributes.slug}`)
      try {
        const fullPageRes = await fetchStrapi(
          `pages?filters[slug][$eq]=${p.attributes.slug}&locale=${p.attributes.locale || 'en'}&populate[content][populate]=*&populate[banner][populate]=*`
        )
        if (!fullPageRes.data?.length) continue
        const fullPage = fullPageRes.data[0]

        // --- Banner ---
        const strapiBanner = fullPage.attributes.banner || []
        const payloadBanners: any[] = []
        for (const block of strapiBanner) {
          if (block.__component === 'banner-components.banner-standard') {
            const bgId = await uploadMedia(block.backgroundImage?.data)
            payloadBanners.push({
              blockType: 'banner-components.banner-standard',
              heading: block.heading,
              description: block.description,
              background: bgId,
              buttons: block.buttons?.map((b: any) => ({
                name: b.name || '', url: b.url || '', newTab: b.newTab || false, style: b.style || 'primary',
              })) || [],
            })
          } else if (block.__component === 'banner-components.profile-banner') {
            payloadBanners.push({ blockType: 'banner-components.profile-banner', title: 'Profile Banner' })
          }
        }

        // --- Content blocks ---
        const payloadBlocks = await migrateBlocks(fullPage.attributes.content || [], uploadMedia)

        await payload.create({
          collection: 'pages',
          data: {
            title: p.attributes.title,
            slug: p.attributes.slug,
            banner: payloadBanners as any,
            blocks: payloadBlocks as any,
          },
        })
        console.log(`  ✓ ${p.attributes.title}`)
      } catch (err: any) { console.error(`  ✗ Page "${p.attributes.slug}":`, err.message) }
    }
  } catch (e: any) { console.error('Skipping Pages:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 7 — Profile (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 7: Migrating Profile (EN) ===')
  try {
    // Fetch profile data from the home page's banner block (deep populate doesn't work)
    const homePageRes = await fetchStrapi('pages?filters[slug][$eq]=home&locale=en&populate[banner][populate]=*')
    if (homePageRes.data?.length > 0) {
      const bannerBlocks = homePageRes.data[0].attributes.banner || []
      const profileBlock = bannerBlocks.find((b: any) => b.__component === 'banner-components.profile-banner')
      if (profileBlock) {
        const bannerImage = await uploadMedia(profileBlock.bannerImage?.data)
        const avatar = await uploadMedia(profileBlock.avatar?.data)
        
        // Fetch socials from site global
        const socialsQuery = qs.stringify({ populate: { socials: { populate: '*' } } })
        const siteRes = await fetchStrapi(`site?${socialsQuery}`)
        const socials = siteRes.data?.attributes?.socials || []
        
        await payload.updateGlobal({
          slug: 'profile',
          data: {
            name: profileBlock.name || 'Admin',
            bio: profileBlock.bio || '',
            bannerImage: bannerImage as any,
            avatar: avatar as any,
            socialPlatformLinks: socials
              .filter((s: any) => s.platform && s.url)
              .map((s: any) => ({ platform: s.platform, url: s.url })),
          },
        })
        console.log('  ✓ Profile updated (name, bio, bannerImage, avatar)')
      } else {
        console.log('  ! No profile-banner block found in home page')
      }
    } else {
      console.log('  ! Home page not found in Strapi')
    }
  } catch (e: any) { console.error('Skipping Profile:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 8 — Site (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 8: Migrating Site (EN) ===')
  try {
    const siteRes = await fetchStrapi('site?populate=*')
    if (siteRes.data) {
      const logo = await uploadMedia(siteRes.data.attributes.logo?.data)
      const favicon = await uploadMedia(siteRes.data.attributes.favicon?.data)
      await payload.updateGlobal({
        slug: 'site',
        data: {
          name: siteRes.data.attributes.name || 'Site',
          description: siteRes.data.attributes.description,
          logo: logo as any,
          favicon: favicon as any,
          socialPlatformLinks: siteRes.data.attributes.socialPlatformLinks?.map((s: any) => ({
            platform: s.platform,
            url: s.url,
          })) || [],
        },
      })
      console.log('  ✓ Site updated')
    }
  } catch (e: any) { console.error('Skipping Site:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 9 — Social Links (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 9: Migrating Social Links ===')
  try {
    const query = qs.stringify({ populate: { socials: { populate: '*' } }, locale: 'en' })
    const siteRes = await fetchStrapi(`site?${query}`)
    const strapiSocials = siteRes.data?.attributes?.socials || []
    const payloadSocials = strapiSocials
      .filter((i: any) => i.platform && i.url)
      .map((i: any) => ({ platform: i.platform, url: i.url }))
    if (payloadSocials.length > 0) {
      await payload.updateGlobal({ slug: 'site', data: { socialPlatformLinks: payloadSocials } })
      console.log(`  ✓ Migrated ${payloadSocials.length} social links`)
    }
  } catch (e: any) { console.error('Skipping Socials:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 10 — Nav Menu (EN + ID)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 10: Migrating Nav Menu (EN + ID) ===')
  for (const locale of ['en', 'id']) {
    try {
      const query = qs.stringify({
        populate: { mainNavMenu: { populate: { navItems: { populate: '*' }, navItem: { populate: '*' } } } },
        locale,
      })
      const siteRes = await fetchStrapi(`site?${query}`)
      const strapiMenu = siteRes.data?.attributes?.mainNavMenu || []

      const payloadNavItems: any[] = []
      for (const item of strapiMenu) {
        let pageId = null
        if (item.navItem?.page?.data?.attributes?.slug) {
          const slug = item.navItem.page.data.attributes.slug
          const pages = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, locale: 'all' })
          if (pages.docs.length > 0) pageId = pages.docs[0].id
        }

        const navItemsLevel2 = []
        if (item.navItems) {
          for (const sub of item.navItems) {
            let subPageId = null
            if (sub.page?.data?.attributes?.slug) {
              const subSlug = sub.page.data.attributes.slug
              const pages = await payload.find({ collection: 'pages', where: { slug: { equals: subSlug } }, locale: 'all' })
              if (pages.docs.length > 0) subPageId = pages.docs[0].id
            }
            navItemsLevel2.push({
              name: sub.name, page: subPageId, url: sub.url,
              newTab: sub.newTab, pageAnchor: sub.pageAnchor, description: sub.description,
            })
          }
        }
        payloadNavItems.push({
          categoryName: item.categoryName || '',
          navItem: item.navItem ? {
            name: item.navItem?.name || '', page: pageId, url: item.navItem?.url || '',
            newTab: item.navItem?.newTab || false, pageAnchor: item.navItem?.pageAnchor || '',
            description: item.navItem?.description || '',
          } : undefined,
          navItems: navItemsLevel2,
        })
      }
      await payload.updateGlobal({ slug: 'main-menu', locale: locale as any, data: { navItems: payloadNavItems } })
      console.log(`  ✓ Nav menu (${locale})`)
    } catch (e: any) { console.error(`  ✗ Nav (${locale}):`, e.message) }
  }

  // ─────────────────────────────────────────────
  // STEP 11 — HomePage (EN)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 11: Migrating HomePage ===')
  try {
    const hpRes = await fetchStrapi('home-page?populate=*')
    if (hpRes.data) {
      const homeSlug = hpRes.data.attributes.page?.data?.attributes?.slug
      if (homeSlug) {
        const pages = await payload.find({ collection: 'pages', where: { slug: { equals: homeSlug } } })
        if (pages.docs.length > 0) {
          await payload.updateGlobal({
            slug: 'home-page',
            data: { title: hpRes.data.attributes.title || 'Home', page: pages.docs[0].id },
          })
          console.log(`  ✓ HomePage → page "${homeSlug}"`)
        } else {
          console.log(`  ! Page "${homeSlug}" not found, skipping HomePage link`)
        }
      } else {
        console.log('  ! No page slug found in home-page response')
      }
    }
  } catch (e: any) { console.error('Skipping HomePage:', e.message) }

  // ─────────────────────────────────────────────
  // STEP 12 — ID locale: Articles
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 12: Migrating Articles (ID) ===')
  try {
    const articlesRes = await fetchStrapi('articles?locale=id&populate=localizations')
    for (const a of articlesRes.data) {
      try {
        const enRef = a.attributes.localizations?.data?.[0]
        if (!enRef) continue
        const enSlug = enRef.attributes.slug
        const existing = await payload.find({ collection: 'articles', where: { slug: { equals: enSlug } }, locale: 'en' })
        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'articles', id: existing.docs[0].id, locale: 'id',
            data: {
              title: a.attributes.title, slug: a.attributes.slug,
              introText: a.attributes.description || a.attributes.introText,
              content: a.attributes.content,
            },
          })
          console.log(`  ✓ ${a.attributes.title}`)
        }
      } catch (e: any) { console.error(`  ✗ Article (id):`, e.message) }
    }
  } catch (e: any) { console.error('Skipping Articles (id):', e.message) }

  // ─────────────────────────────────────────────
  // STEP 13 — ID locale: Projects
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 13: Migrating Projects (ID) ===')
  try {
    const projectsRes = await fetchStrapi('portofolios?locale=id&populate=localizations')
    for (const p of projectsRes.data) {
      try {
        const enRef = p.attributes.localizations?.data?.[0]
        if (!enRef) continue
        const enSlug = enRef.attributes.slug
        const existing = await payload.find({ collection: 'projects', where: { slug: { equals: enSlug } }, locale: 'en' })
        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'projects', id: existing.docs[0].id, locale: 'id',
            data: {
              title: p.attributes.title, slug: p.attributes.slug,
              description: p.attributes.description, content: p.attributes.content,
            },
          })
          console.log(`  ✓ ${p.attributes.title}`)
        }
      } catch (e: any) { console.error(`  ✗ Project (id):`, e.message) }
    }
  } catch (e: any) { console.error('Skipping Projects (id):', e.message) }

  // ─────────────────────────────────────────────
  // STEP 14 — ID locale: Experiences
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 14: Migrating Experiences (ID) ===')
  try {
    const expRes = await fetchStrapi('experiences?locale=id&populate=localizations')
    for (const exp of expRes.data) {
      try {
        const existing = await payload.find({
          collection: 'experiences',
          where: { companyName: { equals: exp.attributes.companyName }, startDate: { equals: exp.attributes.startDate } },
          locale: 'en',
        })
        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'experiences', id: existing.docs[0].id, locale: 'id',
            data: {
              companyName: exp.attributes.companyName,
              role: exp.attributes.role,
              description: exp.attributes.description || '',
            },
          })
          console.log(`  ✓ ${exp.attributes.role}`)
        }
      } catch (e: any) { console.error(`  ✗ Exp (id):`, e.message) }
    }
  } catch (e: any) { console.error('Skipping Experiences (id):', e.message) }

  // ─────────────────────────────────────────────
  // STEP 15 — ID locale: Pages (with blocks)
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 15: Migrating Pages (ID) ===')
  try {
    const pagesListRes = await fetchStrapi('pages?locale=id&populate=localizations')
    for (const p of pagesListRes.data) {
      console.log(`  Migrating page (id): ${p.attributes.slug}`)
      const enRef = p.attributes.localizations?.data?.[0]
      if (!enRef) { console.log(`    No en ref, skipping`); continue }
      const enSlug = enRef.attributes.slug

      try {
        const fullPageRes = await fetchStrapi(
          `pages?filters[slug][$eq]=${p.attributes.slug}&locale=id&populate[content][populate]=*&populate[banner][populate]=*`
        )
        if (!fullPageRes.data?.length) continue
        const fullPage = fullPageRes.data[0]

        // Banner
        const strapiBanner = fullPage.attributes.banner || []
        const payloadBanners: any[] = []
        for (const block of strapiBanner) {
          if (block.__component === 'banner-components.banner-standard') {
            // Reuse already-uploaded media where possible
            let bgId = null
            if (block.backgroundImage?.data) {
              bgId = await uploadMedia(block.backgroundImage.data)
            }
            payloadBanners.push({
              blockType: 'banner-components.banner-standard',
              heading: block.heading, description: block.description, background: bgId,
              buttons: block.buttons?.map((b: any) => ({
                name: b.name || '', url: b.url || '', newTab: b.newTab || false, style: b.style || 'primary',
              })) || [],
            })
          } else if (block.__component === 'banner-components.profile-banner') {
            payloadBanners.push({ blockType: 'banner-components.profile-banner', title: 'Profile Banner' })
          }
        }

        // Content blocks
        const payloadBlocks = await migrateBlocks(fullPage.attributes.content || [], uploadMedia)

        const existingPages = await payload.find({ collection: 'pages', where: { slug: { equals: enSlug } }, locale: 'en' })
        if (existingPages.docs.length > 0) {
          await payload.update({
            collection: 'pages', id: existingPages.docs[0].id, locale: 'id',
            data: {
              title: p.attributes.title, slug: p.attributes.slug,
              banner: payloadBanners as any, blocks: payloadBlocks as any,
            },
          })
          console.log(`  ✓ ${p.attributes.title}`)
        }
      } catch (err: any) { console.error(`  ✗ Page (id) "${p.attributes.slug}":`, err.message) }
    }
  } catch (e: any) { console.error('Skipping Pages (id):', e.message) }

  // ─────────────────────────────────────────────
  // STEP 16 — ID locale: Profile + HomePage
  // ─────────────────────────────────────────────
  console.log('\n=== STEP 16: Migrating Profile + HomePage (ID) ===')
  try {
    const profRes = await fetchStrapi('profile?locale=id')
    if (profRes.data) {
      await payload.updateGlobal({
        slug: 'profile', locale: 'id',
        data: {
          name: profRes.data.attributes.name || 'Admin',
          bio: profRes.data.attributes.bio || '',
          socialPlatformLinks: profRes.data.attributes.socialPlatformLinks?.map((s: any) => ({
            platform: s.platform, url: s.url,
          })) || [],
        },
      })
      console.log('  ✓ Profile (id)')
    }
  } catch (e: any) { console.error('Skipping Profile (id):', e.message) }

  try {
    const hpRes = await fetchStrapi('home-page?locale=id')
    if (hpRes.data) {
      await payload.updateGlobal({
        slug: 'home-page', locale: 'id',
        data: { title: hpRes.data.attributes.title || 'Home' },
      })
      console.log('  ✓ HomePage (id)')
    }
  } catch (e: any) { console.error('Skipping HomePage (id):', e.message) }

  console.log('\n✅ Full re-migration complete!')
  process.exit(0)
}

// ---------- BLOCK MIGRATION HELPER ----------
async function migrateBlocks(
  strapiBlocks: any[],
  uploadMedia: (m: any) => Promise<string | null>
): Promise<any[]> {
  const payloadBlocks: any[] = []
  for (const block of strapiBlocks) {
    try {
      switch (block.__component) {
        case 'content-components.body-copy':
          payloadBlocks.push({ blockType: 'content-components.body-copy', content: convertMarkdownToLexical(block.content || '') })
          break
        case 'content-components.text-left-image-right':
          payloadBlocks.push({
            blockType: 'content-components.text-left-image-right',
            image: await uploadMedia(block.image?.data),
            fullWidthBgImage: block.fullWidthBgImage || false,
            reverse: block.reverse || false,
            fullWidth: block.fullWidth || false,
            bodyCopy: convertMarkdownToLexical(block.bodyCopy || ''),
            biggerColumn: block.biggerColumn || 'image',
            scaling: block.scaling || 'cover',
            buttons: block.buttons?.map((b: any) => ({
              name: b.name || '', url: b.url || '', newTab: b.newTab || false, style: b.style || 'primary',
            })) || [],
          })
          break
        case 'content-components.simple-cards':
          payloadBlocks.push({
            blockType: 'content-components.simple-cards',
            title: block.title || '',
            cards: await Promise.all(
              (block.cards || []).map(async (c: any) => ({
                title: c.title || '',
                description: c.description || '',
                image: await uploadMedia(c.image?.data),
              }))
            ),
          })
          break
        case 'content-components.small-banner':
          payloadBlocks.push({
            blockType: 'content-components.small-banner',
            backgroundImage: await uploadMedia(block.backgroundImage?.data),
            buttons: block.buttons?.map((b: any) => ({
              name: b.name || '', url: b.url || '', newTab: b.newTab || false, style: b.style || 'primary',
            })) || [],
          })
          break
        case 'content-components.divider':
          payloadBlocks.push({ blockType: 'content-components.divider', title: block.title || '' })
          break
        case 'content-components.accordian':
          payloadBlocks.push({
            blockType: 'content-components.accordian',
            items: (block.items || []).map((i: any) => ({ heading: i.heading || '', content: i.content || '' })),
          })
          break
        case 'content-components.quote':
          payloadBlocks.push({ blockType: 'content-components.quote', quote: block.quote || '' })
          break
        case 'content-components.featured-portofolios':
          payloadBlocks.push({ blockType: 'content-components.featured-portofolios', title: block.title || '' })
          break
        case 'content-components.featured-experiences':
          payloadBlocks.push({ blockType: 'content-components.featured-experiences', title: block.title || '' })
          break
        case 'content-components.icon-texts':
          payloadBlocks.push({
            blockType: 'content-components.icon-texts',
            icons: await Promise.all(
              (block.icons || []).map(async (i: any) => ({
                image: await uploadMedia(i.image?.data),
                bodyCopy: i.bodyCopy || '',
                link: i.link || '',
                linkNewTab: i.linkNewTab || false,
              }))
            ),
          })
          break
        case 'content-components.article-search':
          payloadBlocks.push({ blockType: 'content-components.article-search', title: block.title || '' })
          break
        case 'content-components.portofolio-search':
          payloadBlocks.push({ blockType: 'content-components.portofolio-search', title: block.title || '' })
          break
      }
    } catch (err: any) {
      console.error(`  ✗ Block ${block.__component}:`, err.message)
    }
  }
  return payloadBlocks
}

run()
