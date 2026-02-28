import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getHomePage( lang: string ) {
  const payload = await getPayload({ config: configPromise })
  const homePage = await payload.findGlobal({
    slug: 'home-page',
    locale: lang as 'en' | 'id',
    depth: 2,
  })
  return homePage
}
