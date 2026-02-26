import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getPageBySlug( slug: string, lang: string ) {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      }
    },
    depth: 2,
  })
  return pages
}
