import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getSiteData( lang: string ) {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const [siteData, menuData] = await Promise.all([
      payload.findGlobal({
        slug: 'site',
        locale: lang as 'en' | 'id',
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'main-menu',
        locale: lang as 'en' | 'id',
        depth: 2,
      })
    ])
    
    // Polyfill `{ data: siteData }` response structure for existing layout.tsx usage
    // Merge mainNavMenu from main-menu global into siteData so Navbar receives it
    return { 
      data: {
        ...siteData,
        mainNavMenu: (menuData as any)?.navItems || [],
      } 
    }
  } catch (error) {
    console.error('Failed to fetch site data:', error)
    return { data: null }
  }
}

