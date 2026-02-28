import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

async function fetchStrapi(endpoint: string) {
  const url = `${STRAPI_URL}/api/${endpoint}`
  console.log(`[Strapi] Fetching ${url} ...`)
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`)
  return res.json()
}

async function run() {
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../app/payload.config')
  const payload = await getPayload({ config: configPromise })

  console.log('--- Migrating Articles (id) ---')
  const articlesRes = await fetchStrapi('articles?locale=id&populate=localizations')
  for (const a of articlesRes.data) {
    try {
      const enRef = a.attributes.localizations?.data?.[0]
      if (!enRef) continue
      const enSlug = enRef.attributes.slug
      const existing = await payload.find({ collection: 'articles', where: { slug: { equals: enSlug } }, locale: 'en' })
      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'articles',
          id: existing.docs[0].id,
          locale: 'id',
          data: {
            title: a.attributes.title,
            slug: a.attributes.slug,
            introText: a.attributes.description || a.attributes.introText,
            content: a.attributes.content,
          }
        })
        console.log(` ✓ Updated article: ${a.attributes.title}`)
      }
    } catch(e) { console.error('Error article', a.attributes.title) }
  }

  console.log('--- Migrating Projects (id) ---')
  const projectsRes = await fetchStrapi('portofolios?locale=id&populate=localizations')
  for (const p of projectsRes.data) {
    try {
      const enRef = p.attributes.localizations?.data?.[0]
      if (!enRef) continue
      const enSlug = enRef.attributes.slug
      const existing = await payload.find({ collection: 'projects', where: { slug: { equals: enSlug } }, locale: 'en' })
      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'projects',
          id: existing.docs[0].id,
          locale: 'id',
          data: {
            title: p.attributes.title,
            slug: p.attributes.slug,
            description: p.attributes.description,
            content: p.attributes.content,
          }
        })
        console.log(` ✓ Updated project: ${p.attributes.title}`)
      }
    } catch(e) { console.error('Error project', p.attributes.title) }
  }

  console.log('--- Migrating Experiences (id) ---')
  const expRes = await fetchStrapi('experiences?locale=id&populate=localizations')
  for (const exp of expRes.data) {
    try {
      // Find matching experience in EN by matching start date and company name (since no slug)
      const existing = await payload.find({ 
        collection: 'experiences', 
        where: { 
          companyName: { equals: exp.attributes.companyName },
          startDate: { equals: exp.attributes.startDate }
        }, 
        locale: 'en' 
      })
      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'experiences',
          id: existing.docs[0].id,
          locale: 'id',
          data: {
            companyName: exp.attributes.companyName,
            role: exp.attributes.role,
            description: exp.attributes.description || '',
          }
        })
        console.log(` ✓ Updated experience: ${exp.attributes.role}`)
      }
    } catch(e) { console.error('Error exp', exp.attributes.role) }
  }

  console.log('--- Migrating Profile (id) ---')
  try {
     const profRes = await fetchStrapi('profile?locale=id')
     if (profRes.data) {
       await payload.updateGlobal({
         slug: 'profile',
         locale: 'id',
         data: {
           name: profRes.data.attributes.name || 'Admin',
           bio: profRes.data.attributes.bio || '',
           socialPlatformLinks: profRes.data.attributes.socialPlatformLinks?.map((s:any) => ({ platform: s.platform, url: s.url })) || []
         }
       })
       console.log(' ✓ Updated Profile')
     }
  } catch(e: any) { console.log('Skipping Profile:', e.message) }
  
  console.log('--- Migrating HomePage (id) ---')
  try {
     const hpRes = await fetchStrapi('home-page?locale=id')
     if (hpRes.data) {
       await payload.updateGlobal({
         slug: 'home-page',
         locale: 'id',
         data: {
           title: hpRes.data.attributes.title || 'Home',
         }
       })
       console.log(' ✓ Updated HomePage')
     }
  } catch(e: any) { console.log('Skipping HomePage:', e.message) }

  console.log('Done migrating ID locale!')
  process.exit(0)
}

run()
