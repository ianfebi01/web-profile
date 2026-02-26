import { getPayload } from 'payload'
import configPromise from '../app/payload.config'
import fs from 'fs'
import path from 'path'
import os from 'os'

const envFile = fs.readFileSync('.env.local', 'utf-8')
const STRAPI_URL = envFile.split('\n').find(l => l.startsWith('NEXT_PUBLIC_STRAPI_API_URL='))?.split('=')[1].trim()
const STRAPI_TOKEN = envFile.split('\n').find(l => l.startsWith('NEXT_PUBLIC_STRAPI_API_TOKEN='))?.split('=')[1].trim()

async function fetchStrapi(endpoint: string) {
  const url = `${STRAPI_URL}/api/${endpoint}`
  console.log(`[Strapi] Fetching ${url}...`)
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
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
  const payload = await getPayload({ config: configPromise })
  
  const mediaMap = new Map<number, any>()
  const tagsMap = new Map<number, any>()
  const skillsMap = new Map<number, any>()

  async function uploadMedia(strapiMedia: any) {
    if (!strapiMedia) return null
    if (mediaMap.has(strapiMedia.id)) return mediaMap.get(strapiMedia.id)

    const { url, name, alternativeText } = strapiMedia.attributes
    try {
      const filePath = await downloadMedia(url, name)
      const media = await payload.create({
        collection: 'media',
        data: { alt: alternativeText || name },
        filePath,
      })
      mediaMap.set(strapiMedia.id, media.id)
      return media.id
    } catch (e) {
      console.error(`=> Failed to upload media ${name}:`, e)
      return null
    }
  }

  // 1. Tags
  console.log('--- Migrating Tags ---')
  try {
    const tagsRes = await fetchStrapi('tags?populate=*')
    for (const t of tagsRes.data) {
      try {
        const doc = await payload.create({
          collection: 'tags',
          data: { title: t.attributes.title, slug: t.attributes.slug },
        })
        tagsMap.set(t.id, doc.id)
      } catch(e) { console.error('Error tag', t.attributes.title) }
    }
  } catch(e) { console.log('Skipping Tags', e) }

  // 2. Skills
  console.log('--- Migrating Skills ---')
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
            image: imageId
          },
        })
        skillsMap.set(s.id, doc.id)
      } catch(e) { console.error('Error skill', s.attributes.name) }
    }
  } catch(e) { console.log('Skipping Skills', e) }

  // 3. Projects
  console.log('--- Migrating Projects ---')
  try {
    const projectsRes = await fetchStrapi('portofolios?populate=*')
    for (const p of projectsRes.data) {
      try {
        const featureImage = await uploadMedia(p.attributes.featureImage?.data)
        const gallery = []
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
            thumbnail: featureImage,
            gallery,
            url: p.attributes.url,
            skills: pSkills
          }
        })
      } catch(e) { console.error('Error project', p.attributes.title, e) }
    }
  } catch(e) { console.log('Skipping Projects', e) }

  // 4. Articles
  console.log('--- Migrating Articles ---')
  try {
    const articlesRes = await fetchStrapi('articles?populate=*')
    for (const a of articlesRes.data) {
      try {
        const heroImage = await uploadMedia(a.attributes.image?.data || a.attributes.heroImage?.data || a.attributes.hero?.data)
        const pTags = a.attributes.tags?.data?.map((t: any) => tagsMap.get(t.id)).filter(Boolean) || []

        await payload.create({
          collection: 'articles',
          data: {
            title: a.attributes.title,
            slug: a.attributes.slug,
            introText: a.attributes.description || a.attributes.introText,
            content: a.attributes.content,
            heroImage,
            tags: pTags
          }
        })
      } catch(e) { console.error('Error article', a.attributes.title, e) }
    }
  } catch(e) { console.log('Skipping Articles', e) }

  // 5. Profile
  console.log('--- Migrating Profile ---')
  try {
     const profRes = await fetchStrapi('profile?populate=*')
     if (profRes.data) {
       const bannerImage = await uploadMedia(profRes.data.attributes.bannerImage?.data)
       await payload.updateGlobal({
         slug: 'profile',
         data: {
           name: profRes.data.attributes.name || 'Admin',
           bio: profRes.data.attributes.bio || '',
           bannerImage: bannerImage || 1, // Require banner image, 1 as fallback config
           socialPlatformLinks: profRes.data.attributes.socialPlatformLinks?.map((s:any) => ({ platform: s.platform, url: s.url })) || []
         }
       })
     }
  } catch(e: any) { console.log('Skipping Profile:', e.message) }
  
  // 6. Site
  console.log('--- Migrating Site ---')
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
           logo,
           favicon,
           socialPlatformLinks: siteRes.data.attributes.socialPlatformLinks?.map((s:any) => ({ platform: s.platform, url: s.url })) || []
         }
       })
     }
  } catch(e: any) { console.log('Skipping Site:', e.message) }

  // 7. HomePage
  console.log('--- Migrating HomePage ---')
  try {
     const hpRes = await fetchStrapi('home-page?populate=deep')
     if (hpRes.data) {
       const hero = hpRes.data.attributes.hero || {}
       const bgImage = await uploadMedia(hero.backgroundImage?.data || hero.image?.data)
       await payload.updateGlobal({
         slug: 'home-page',
         data: {
           title: hpRes.data.attributes.title || 'Home',
           heroSection: {
             heading: hero.title || hpRes.data.attributes.title || 'Home',
             subheading: hero.subtitle || hpRes.data.attributes.description || '',
             backgroundImage: bgImage || null
           }
         }
       })
     }
  } catch(e: any) { console.log('Skipping HomePage:', e.message) }

  console.log('Migration Complete!')
  process.exit(0)
}

run()
