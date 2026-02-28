import fs from 'fs'
import path from 'path'
import os from 'os'

const envFile = fs.readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

async function fetchStrapi(endpoint: string) {
  const url = `${STRAPI_URL}/api/${endpoint}`
  console.log(`[Strapi] Fetching ${url}...`)
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`)
  return res.json()
}

async function run() {
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../app/payload.config')
  const payload = await getPayload({ config: configPromise })

  console.log('--- Migrating Pages (id) ---')
  try {
    const pagesListRes = await fetchStrapi('pages?locale=id&populate=localizations')
    
    for (const p of pagesListRes.data) {
      console.log(`Migrating page: ${p.attributes.slug}`)
      
      const enRef = p.attributes.localizations?.data?.[0]
      if (!enRef) {
          console.log(`No en localization found for ${p.attributes.slug}, skipping...`)
          continue
      }
      const enSlug = enRef.attributes.slug

      try {
        const fullPageRes = await fetchStrapi(`pages?filters[slug][$eq]=${p.attributes.slug}&locale=id&populate[content][populate]=*&populate[banner][populate]=*`)
        
        if (!fullPageRes.data || fullPageRes.data.length === 0) {
            console.log(`No full data found for ${p.attributes.slug}, skipping blocks...`)
            continue
        }
        
        const fullPage = fullPageRes.data[0]
        
        // --- Parse Banner array ---
        const strapiBanner = fullPage.attributes.banner || []
        const payloadBanners: any[] = []
        for (const block of strapiBanner) {
            if (block.__component === 'banner-components.banner-standard') {
                let backgroundId = null
                if (block.backgroundImage?.data) {
                    const existingMedia = await payload.find({ collection: 'media', limit: 1, where: { alt: { equals: block.backgroundImage.data.attributes.name } } })
                    backgroundId = existingMedia.docs.length > 0 ? existingMedia.docs[0].id : null
                }
                payloadBanners.push({
                    blockType: 'banner-components.banner-standard',
                    heading: block.heading,
                    description: block.description,
                    background: backgroundId,
                    buttons: block.buttons?.map((b: any) => ({
                        name: b.name || '', url: b.url || '', newTab: b.newTab || false, style: b.style || 'primary'
                    })) || []
                })
            } else if (block.__component === 'banner-components.profile-banner') {
                payloadBanners.push({
                    blockType: 'banner-components.profile-banner', title: 'Profile Banner'
                })
            }
        }

        // --- Parse Content array ---
        const strapiBlocks = fullPage.attributes.content || []
        const payloadBlocks: any[] = []
        for (const block of strapiBlocks) {
            let sectionSettings: any = null
            if (block.heading || block.bgColour) {
                // Approximate settings extraction
                sectionSettings = {
                    heading: block.heading,
                    description: block.description,
                    bgColour: block.bgColour?.data?.attributes?.name === 'dark' ? 'dark' : (block.bgColour?.data?.attributes?.name === 'dark-secondary' ? 'dark-secondary' : null),
                }
            }
            try {
                switch(block.__component) {
                    case 'content-components.body-copy':
                        payloadBlocks.push({
                            blockType: 'content-components.body-copy',
                            content: block.content || '',
                            sectionSettings: sectionSettings || { heading: "Get in Touch:", centreText: true, largeHeading: true }
                        })
                        break;
                    case 'content-components.text-left-image-right':
                        let imageId1 = null
                        if (block.image?.data) {
                            const ex = await payload.find({ collection: 'media', limit: 1, where: { alt: { equals: block.image.data.attributes.name } } })
                            imageId1 = ex.docs.length > 0 ? ex.docs[0].id : null
                        }
                        payloadBlocks.push({
                            blockType: 'content-components.text-left-image-right',
                            image: imageId1,
                            fullWidthBgImage: block.fullWidthBgImage || false,
                            reverse: block.reverse || false,
                            fullWidth: block.fullWidth || false,
                            bodyCopy: block.bodyCopy || '',
                            biggerColumn: block.biggerColumn || 'image',
                            scaling: block.scaling || 'cover',
                            buttons: block.buttons?.map((b: any) => ({
                                name: b.name || '', url: b.url || '', newTab: b.newTab || false, style: b.style || 'primary'
                            })) || [],
                            sectionSettings: sectionSettings || { bgColour: 'dark-secondary', heading: "What You Get with Our Landing Pages" }
                        })
                        break;
                    case 'content-components.simple-cards':
                        payloadBlocks.push({
                            blockType: 'content-components.simple-cards',
                            title: block.title || '',
                            cards: (block.cards || []).map((c: any) => ({
                                title: c.title || '',
                                description: c.description || '',
                                image: null 
                            })),
                            sectionSettings: sectionSettings || { heading: "Choose Your Package", centreText: true, largeHeading: true }
                        })
                        break;
                    case 'content-components.featured-portofolios':
                        payloadBlocks.push({ blockType: 'content-components.featured-portofolios', title: block.title || '' })
                        break;
                    case 'content-components.featured-experiences':
                        payloadBlocks.push({ blockType: 'content-components.featured-experiences', title: block.title || '' })
                        break;
                    case 'content-components.article-search':
                        payloadBlocks.push({ blockType: 'content-components.article-search', title: block.title || '' })
                        break;
                    case 'content-components.portofolio-search':
                        payloadBlocks.push({ blockType: 'content-components.portofolio-search', title: block.title || '' })
                        break;
                }
            } catch (err: any) {
                console.error(`Error migrating block ${block.__component}:`, err.message)
            }
        }
        
        // Find existing english page
        const existingPages = await payload.find({
            collection: 'pages',
            where: { slug: { equals: enSlug } },
            locale: 'en'
        })
        
        if (existingPages.docs.length > 0) {
            console.log(`Updating existing payload page with ID content: ${enSlug}`)
            await payload.update({
                collection: 'pages',
                id: existingPages.docs[0].id,
                locale: 'id',
                data: {
                    title: p.attributes.title,
                    slug: p.attributes.slug,
                    banner: payloadBanners as any,
                    blocks: payloadBlocks as any
                }
            })
            console.log(` ✓ Updated page: ${p.attributes.title}`)
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
