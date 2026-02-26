import { getPayload } from 'payload'
import configPromise from '../app/payload.config'
import fs from 'fs'
import path from 'path'
import os from 'os'


const envFile = fs.readFileSync('.env.local', 'utf-8')
const STRAPI_URL = envFile.split('\n').find(l => l.startsWith('NEXT_PUBLIC_STRAPI_API_URL='))?.split('=')[1].trim()
const STRAPI_TOKEN = envFile.split('\n').find(l => l.startsWith('NEXT_PUBLIC_STRAPI_API_TOKEN='))?.split('=')[1].trim()

async function downloadMedia(url: string, name: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}`)
  const buffer = await res.arrayBuffer()
  const filePath = path.join(os.tmpdir(), name)
  fs.writeFileSync(filePath, new Uint8Array(buffer))
  return filePath
}

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

async function run() {
  const payload = await getPayload({ config: configPromise })

  async function uploadMedia(strapiMedia: any) {
    if (!strapiMedia) return null
    const { url, name, alternativeText } = strapiMedia.attributes
    try {
      const filePath = await downloadMedia(url, name)
      const media = await payload.create({
        collection: 'media',
        data: { alt: alternativeText || name },
        filePath,
      })
      return media.id
    } catch (e) {
      console.error(`=> Failed to upload media ${name}:`, e)
      return null
    }
  }

  console.log('--- Migrating Pages ---')
  try {
    const pagesListRes = await fetchStrapi('pages?populate=*')
    
    for (const p of pagesListRes.data) {
      console.log(`Migrating page: ${p.attributes.slug}`)
      
      try {
        // Use the existing utility to fetch the fully populated page
        const fullPageRes = await fetchStrapi(`pages?filters[slug][$eq]=${p.attributes.slug}&locale=${p.attributes.locale || 'en'}&populate[content][populate]=*`)
        
        if (!fullPageRes.data || fullPageRes.data.length === 0) {
            console.log(`No full data found for ${p.attributes.slug}, skipping blocks...`)
            continue
        }
        
        const fullPage = fullPageRes.data[0]
        const strapiBlocks = fullPage.attributes.content || []
        const payloadBlocks = []
        
        for (const block of strapiBlocks) {
            try {
                switch(block.__component) {
                    case 'content-components.body-copy':
                        payloadBlocks.push({
                            blockType: 'content-components.body-copy',
                            content: block.content || '',
                        })
                        break;
                    case 'content-components.text-left-image-right':
                        payloadBlocks.push({
                            blockType: 'content-components.text-left-image-right',
                            image: await uploadMedia(block.image?.data) as any,
                            fullWidthBgImage: block.fullWidthBgImage || false,
                            reverse: block.reverse || false,
                            fullWidth: block.fullWidth || false,
                            bodyCopy: block.bodyCopy || '',
                            biggerColumn: block.biggerColumn || 'image',
                            scaling: block.scaling || 'cover',
                            buttons: block.buttons?.map((b: any) => ({
                                name: b.name || '',
                                url: b.url || '',
                                newTab: b.newTab || false,
                                style: b.style || 'primary'
                            })) || []
                        })
                        break;
                    case 'content-components.simple-cards':
                        payloadBlocks.push({
                            blockType: 'content-components.simple-cards',
                            title: block.title || '',
                            cards: await Promise.all((block.cards || []).map(async (c: any) => ({
                                title: c.title || '',
                                description: c.description || '',
                                image: await uploadMedia(c.image?.data) as any
                            })))
                        })
                        break;
                    case 'content-components.small-banner':
                        payloadBlocks.push({
                            blockType: 'content-components.small-banner',
                            backgroundImage: await uploadMedia(block.backgroundImage?.data) as any,
                            buttons: block.buttons?.map((b: any) => ({
                                name: b.name || '',
                                url: b.url || '',
                                newTab: b.newTab || false,
                                style: b.style || 'primary'
                            })) || []
                        })
                        break;
                    case 'content-components.divider':
                        payloadBlocks.push({
                            blockType: 'content-components.divider',
                            title: block.title || ''
                        })
                        break;
                    case 'content-components.accordian':
                        payloadBlocks.push({
                            blockType: 'content-components.accordian',
                            items: (block.items || []).map((i: any) => ({
                                heading: i.heading || '',
                                content: i.content || ''
                            }))
                        })
                        break;
                    case 'content-components.quote':
                        payloadBlocks.push({
                            blockType: 'content-components.quote',
                            quote: block.quote || ''
                        })
                        break;
                    case 'content-components.featured-portofolios':
                        payloadBlocks.push({
                            blockType: 'content-components.featured-portofolios',
                            title: block.title || ''
                        })
                        break;
                    case 'content-components.featured-experiences':
                        payloadBlocks.push({
                            blockType: 'content-components.featured-experiences',
                            title: block.title || ''
                        })
                        break;
                    case 'content-components.icon-texts':
                        payloadBlocks.push({
                            blockType: 'content-components.icon-texts',
                            icons: await Promise.all((block.icons || []).map(async (i: any) => ({
                                image: await uploadMedia(i.image?.data) as any,
                                bodyCopy: i.bodyCopy || '',
                                link: i.link || '',
                                linkNewTab: i.linkNewTab || false
                            })))
                        })
                        break;
                    case 'content-components.article-search':
                        payloadBlocks.push({
                            blockType: 'content-components.article-search',
                            title: block.title || ''
                        })
                        break;
                    case 'content-components.portofolio-search':
                        payloadBlocks.push({
                            blockType: 'content-components.portofolio-search',
                            title: block.title || ''
                        })
                        break;
                }
            } catch (err: any) {
                console.error(`Error migrating block ${block.__component}:`, err.message)
            }
        }
        
        // Find existing page
        const existingPages = await payload.find({
            collection: 'pages',
            where: {
                slug: {
                    equals: p.attributes.slug
                }
            }
        })
        
        if (existingPages.docs.length > 0) {
            console.log(`Updating existing page: ${p.attributes.slug}`)
            await payload.update({
                collection: 'pages',
                id: existingPages.docs[0].id,
                data: {
                    title: p.attributes.title,
                    blocks: payloadBlocks as any
                }
            })
        } else {
            console.log(`Creating new page: ${p.attributes.slug}`)
            await payload.create({
                collection: 'pages',
                data: {
                    title: p.attributes.title,
                    slug: p.attributes.slug,
                    blocks: payloadBlocks as any
                }
            })
        }
        
      } catch (err: any) {
         console.error(`Failed to migrate page ${p.attributes.slug}:`, err.message) 
      }
    }
  } catch(e) { console.log('Skipping Pages', e) }

  console.log('Migration Complete!')
  process.exit(0)
}

run()
