import fs from 'fs'

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
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`)
  return res.json()
}

async function run() {
  // Dynamic import so env vars are loaded first
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../app/payload.config')
  
  const payload = await getPayload({ config: configPromise })

  console.log('--- Migrating Experiences ---')
  try {
    const expRes = await fetchStrapi('experiences?populate=*&pagination[pageSize]=100')
    console.log(`Found ${expRes.data?.length || 0} experiences`)
    
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
      } catch (e: any) {
        console.error(`  ✗ Error: ${exp.attributes.role} at ${exp.attributes.companyName}:`, e.message)
      }
    }
  } catch (e: any) {
    console.error('Failed to migrate experiences:', e.message)
  }

  console.log('Experience migration complete!')
  process.exit(0)
}

run()
