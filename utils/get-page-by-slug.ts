import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPageBySlugCached = unstable_cache(
  async ( slug: string, lang: string ) => {
    const payload = await getPayload( { config : configPromise } )
    const pages = await payload.find( {
      collection     : 'pages',
      locale         : lang as 'en' | 'id',
      fallbackLocale : false,
      where          : {
        slug : {
          equals : slug,
        },
      },
      depth : 2,
    } )
    
    return pages
  },
  ['page-by-slug'],
  { tags : ['pages'] },
)

export async function getPageBySlug( slug: string, lang: string ) {
  return getPageBySlugCached( slug, lang )
}
