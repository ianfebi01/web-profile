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

  console.log('--- Migrating Nav Menu ---')

  const locales = ['en', 'id']
  for (const locale of locales) {
    try {
      const query = qs.stringify({
        populate : {
          mainNavMenu : {
            populate : {
              navItems : {
                populate : '*'
              },
              navItem : {
                populate : '*'
              }
            }
          },
        },
        locale
      })
      const siteRes = await fetchStrapi(`site?${query}`)
      const strapiMenu = siteRes.data?.attributes?.mainNavMenu || []

      const payloadNavItems: any[] = []

      for (const item of strapiMenu) {
        // Resolve page for navItem
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
                    name: sub.name,
                    page: subPageId,
                    url: sub.url,
                    newTab: sub.newTab,
                    pageAnchor: sub.pageAnchor,
                    description: sub.description
                })
            }
        }

        payloadNavItems.push({
          categoryName: item.categoryName || '',
          navItem: item.navItem ? {
             name: item.navItem?.name || '',
             page: pageId,
             url: item.navItem?.url || '',
             newTab: item.navItem?.newTab || false,
             pageAnchor: item.navItem?.pageAnchor || '',
             description: item.navItem?.description || ''
          } : undefined,
          navItems: navItemsLevel2
        })
      }

      await payload.updateGlobal({
        slug: 'main-menu',
        locale: locale as any,
        data: {
          navItems: payloadNavItems
        }
      })
      console.log(` ✓ Migrated MainMenu for ${locale}`)
    } catch (err: any) {
       console.error(`Failed to migrate nav for ${locale}:`, err.message) 
    }
  }

  console.log('Migration Complete!')
  process.exit(0)
}

run()
