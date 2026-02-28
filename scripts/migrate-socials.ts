import fs from 'fs'
import qs from 'qs'

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

  console.log('--- Migrating Social Links ---')

  try {
    const query = qs.stringify({
      populate: {
        socials: {
          populate: '*'
        }
      },
      locale: 'en'
    })
    
    const siteRes = await fetchStrapi(`site?${query}`)
    const strapiSocials = siteRes.data?.attributes?.socials || []

    const payloadSocials: any[] = []

    for (const item of strapiSocials) {
      if (item.platform && item.url) {
        payloadSocials.push({
          platform: item.platform,
          url: item.url
        })
      }
    }

    if (payloadSocials.length > 0) {
      // Fetch existing site to merge with to avoid overwriting name if it exists, but global updates typically merge or overwrite
      // Wait, updateGlobal overwrites existing fields if not provided?
      // "When you update a Global, only the properties you pass will be updated" - Payload docs
      
      await payload.updateGlobal({
        slug: 'site',
        data: {
          socialPlatformLinks: payloadSocials
        }
      })
      console.log(` ✓ Migrated Social Links: `, payloadSocials)
    } else {
      console.log('No social links found in Strapi.')
    }

  } catch (err: any) {
     console.error(`Failed to migrate socials:`, err.message) 
  }

  console.log('Migration Complete!')
  process.exit(0)
}

run()
