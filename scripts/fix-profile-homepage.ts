/**
 * Quick fix: update Profile global with bannerImage + avatar from Strapi,
 * and link HomePage global to the correct page.
 *
 *   npx tsx scripts/fix-profile-homepage.ts
 */
import fs from 'fs'
import path from 'path'
import os from 'os'
import qs from 'qs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

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

async function run() {
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../app/payload.config')
  const payload = await getPayload({ config: configPromise })

  async function uploadMedia(strapiMedia: any): Promise<string | null> {
    if (!strapiMedia) return null
    const { url, name, alternativeText } = strapiMedia.attributes
    try {
      const filePath = await downloadMedia(url, name)
      const media = await payload.create({
        collection: 'media',
        data: { alt: alternativeText || name },
        filePath,
      })
      return media.id as string
    } catch (e: any) {
      console.error(`  ✗ Failed to upload media ${name}:`, e.message)
      return null
    }
  }

  // --- Fix Profile ---
  console.log('\n=== Fixing Profile ===')
  try {
    const homePageRes = await fetchStrapi('pages?filters[slug][$eq]=home&locale=en&populate[banner][populate]=*')
    if (homePageRes.data?.length > 0) {
      const bannerBlocks = homePageRes.data[0].attributes.banner || []
      const profileBlock = bannerBlocks.find((b: any) => b.__component === 'banner-components.profile-banner')
      if (profileBlock) {
        console.log('  Found profile block:', profileBlock.name)
        const bannerImage = await uploadMedia(profileBlock.bannerImage?.data)
        const avatar = await uploadMedia(profileBlock.avatar?.data)
        console.log('  bannerImage:', bannerImage ? '✓' : '✗')
        console.log('  avatar:', avatar ? '✓' : '✗')

        // Fetch socials
        const socialsQuery = qs.stringify({ populate: { socials: { populate: '*' } } })
        const siteRes = await fetchStrapi(`site?${socialsQuery}`)
        const socials = (siteRes.data?.attributes?.socials || [])
          .filter((s: any) => s.platform && s.url)
          .map((s: any) => ({ platform: s.platform, url: s.url }))

        await payload.updateGlobal({
          slug: 'profile',
          data: {
            name: profileBlock.name || 'Admin',
            bio: profileBlock.bio || '',
            bannerImage: bannerImage as any,
            avatar: avatar as any,
            socialPlatformLinks: socials,
          },
        })
        console.log('  ✓ Profile updated!')
      } else {
        console.log('  ! No profile-banner block found')
      }
    }
  } catch (e: any) { console.error('Error fixing profile:', e.message) }

  // --- Fix HomePage ---
  console.log('\n=== Fixing HomePage ===')
  try {
    const hpRes = await fetchStrapi('home-page?populate=*')
    if (hpRes.data) {
      const homeSlug = hpRes.data.attributes.page?.data?.attributes?.slug
      console.log('  Home page slug from Strapi:', homeSlug)
      if (homeSlug) {
        const pages = await payload.find({ collection: 'pages', where: { slug: { equals: homeSlug } } })
        if (pages.docs.length > 0) {
          await payload.updateGlobal({
            slug: 'home-page',
            data: { title: hpRes.data.attributes.title || 'Home', page: pages.docs[0].id },
          })
          console.log(`  ✓ HomePage → page "${homeSlug}" (id: ${pages.docs[0].id})`)
        } else {
          console.log(`  ! Page "${homeSlug}" not found in Payload`)
        }
      }
    }
  } catch (e: any) { console.error('Error fixing homepage:', e.message) }

  console.log('\n✅ Done!')
  process.exit(0)
}

run()
