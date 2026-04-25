import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'

const getHomePageCached = unstable_cache(
  async ( lang: string ) => {
    const payload = await getPayload( { config : configPromise } )
    const homePage = await payload.findGlobal( {
      slug   : 'home-page',
      locale : lang as 'en' | 'id',
      depth  : 3,
    } )
    
    return homePage
  },
  ['home-page-global'],
  { tags : ['home-page', 'pages'] },
)

export async function getHomePage( lang: string ) {
  return getHomePageCached( lang )
}
