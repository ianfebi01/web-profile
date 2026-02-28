import fs from 'fs'
import path from 'path'
import os from 'os'

// Load env vars from .env.local BEFORE anything else
const envContent = fs.readFileSync('.env.local', 'utf-8')
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    process.env[match[1].trim()] = match[2].trim()
  }
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

async function fetchStrapi(endpoint: string) {
  const url = `${STRAPI_URL}/api/${endpoint}`
  console.log(`[Strapi] Fetching ${url}...`)
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
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
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../app/payload.config')
  
  const payload = await getPayload({ config: configPromise })

  const mediaMap = new Map<string, string>()

  async function uploadMedia(strapiMedia: any): Promise<string | null> {
    if (!strapiMedia) return null
    const data = strapiMedia.data?.attributes || strapiMedia.attributes || strapiMedia
    if (!data?.url) return null
    
    const key = data.url
    if (mediaMap.has(key)) return mediaMap.get(key)!

    const { url, name, alternativeText } = data
    try {
      const filePath = await downloadMedia(url, name)
      const media = await payload.create({
        collection: 'media',
        data: { alt: alternativeText || name },
        filePath,
      })
      mediaMap.set(key, media.id)
      console.log(`  ✓ Uploaded media: ${name}`)
      return media.id
    } catch (e: any) {
      console.error(`  ✗ Failed to upload media ${name}:`, e.message)
      return null
    }
  }

  console.log('--- Fetching landing page from Strapi ---')
  const pageUrl = 'pages?filters%5Bslug%5D=landing-page-development-for-your-bussiness&populate%5Bbanner%5D%5Bpopulate%5D=*&populate%5Bcontent%5D%5Bpopulate%5D=*'
  const pageRes = await fetchStrapi(pageUrl)
  
  if (!pageRes.data?.[0]) {
    console.error('Page not found in Strapi!')
    process.exit(1)
  }

  const strapiPage = pageRes.data[0].attributes
  console.log(`Found page: ${strapiPage.title}`)

  // Process banner blocks
  const bannerBlocks: any[] = []
  for (const block of (strapiPage.banner || [])) {
    if (block.__component === 'banner-components.banner-standard') {
      const backgroundId = await uploadMedia(block.background)
      const buttons = (block.buttons || []).map((b: any) => ({
        name: b.name,
        url: b.url,
        newTab: b.newTab || false,
        style: b.style || 'primary',
      }))
      bannerBlocks.push({
        blockType: 'banner-components.banner-standard',
        heading: block.heading,
        description: block.description,
        background: backgroundId,
        buttons,
      })
      console.log(`  ✓ Banner: ${block.heading}`)
    } else if (block.__component === 'banner-components.profile-banner') {
      bannerBlocks.push({
        blockType: 'banner-components.profile-banner',
        title: 'Profile Banner',
      })
      console.log('  ✓ Banner: Profile Banner')
    }
  }

  // Process content blocks
  const contentBlocks: any[] = []
  for (const block of (strapiPage.content || [])) {
    switch (block.__component) {
      case 'content-components.text-left-image-right': {
        const imageId = await uploadMedia(block.image)
        const buttons = (block.buttons || []).map((b: any) => ({
          name: b.name,
          url: b.url,
          newTab: b.newTab || false,
          style: b.style || 'primary',
        }))
        contentBlocks.push({
          blockType: 'content-components.text-left-image-right',
          image: imageId,
          fullWidthBgImage: block.fullWidthBgImage || false,
          reverse: block.reverse || false,
          fullWidth: block.fullWidth || false,
          bodyCopy: block.bodyCopy,
          biggerColumn: block.biggerColumn,
          scaling: block.scaling || 'cover',
          buttons,
        })
        console.log('  ✓ Content: Text Left Image Right')
        break
      }
      case 'content-components.simple-cards': {
        const cards = (block.cards || []).map((c: any) => ({
          title: c.title,
          description: c.description,
        }))
        contentBlocks.push({
          blockType: 'content-components.simple-cards',
          title: block.sectionSettings?.heading || block.title,
          cards,
        })
        console.log('  ✓ Content: Simple Cards')
        break
      }
      case 'content-components.body-copy': {
        contentBlocks.push({
          blockType: 'content-components.body-copy',
          content: block.content,
        })
        console.log('  ✓ Content: Body Copy')
        break
      }
      case 'content-components.featured-portofolios': {
        contentBlocks.push({
          blockType: 'content-components.featured-portofolios',
          title: 'Featured Portfolios',
        })
        console.log('  ✓ Content: Featured Portfolios')
        break
      }
      case 'content-components.featured-experiences': {
        contentBlocks.push({
          blockType: 'content-components.featured-experiences',
          title: 'Featured Experiences',
        })
        console.log('  ✓ Content: Featured Experiences')
        break
      }
      case 'content-components.article-search': {
        contentBlocks.push({
          blockType: 'content-components.article-search',
          title: 'Article Search',
        })
        console.log('  ✓ Content: Article Search')
        break
      }
      default:
        console.log(`  ⚠ Skipping unknown block: ${block.__component}`)
    }
  }

  // Find or create the page in Payload
  console.log('\n--- Updating Payload page ---')
  const existingPages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'landing-page-development-for-your-bussiness' } },
  })

  if (existingPages.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: existingPages.docs[0].id,
      data: {
        title: strapiPage.title,
        banner: bannerBlocks,
        blocks: contentBlocks,
      },
    })
    console.log(`✓ Updated existing page: ${strapiPage.title}`)
  } else {
    await payload.create({
      collection: 'pages',
      data: {
        title: strapiPage.title,
        slug: 'landing-page-development-for-your-bussiness',
        banner: bannerBlocks,
        blocks: contentBlocks,
      },
    })
    console.log(`✓ Created new page: ${strapiPage.title}`)
  }

  console.log('\nLanding page seeding complete!')
  process.exit(0)
}

run()
