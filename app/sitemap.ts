import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@/app/payload.config'

type TLocale = {
  code: string
  url: string
}

type TResponse = {
  slug: string
  updatedAt: string
}

export const locales: TLocale[] = [
  {
    code : 'en',
    url  : `${process.env.NEXT_PUBLIC_BASE_URL}/en`,
  },
  {
    code : 'id',
    url  : `${process.env.NEXT_PUBLIC_BASE_URL}/id`,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes: MetadataRoute.Sitemap = []
  const payload = await getPayload({ config: configPromise })

  const fetchCollection = async (collection: 'pages' | 'articles' | 'projects', sitePath: string) => {
    const res = await payload.find({
      collection,
      depth: 0,
      limit: 1000,
    })

    return res.docs.map(doc => ({
      slug: doc.slug as string,
      updatedAt: doc.updatedAt as string,
      sitePath,
    }))
  }

  const allContent = [
    ...(await fetchCollection('pages', '')),
    ...(await fetchCollection('articles', 'article')),
    ...(await fetchCollection('projects', 'portofolio')),
  ]

  for (const locale of locales) {
    allContent.forEach((entry) => {
      const { slug, updatedAt, sitePath } = entry

      if (slug === 'home') return

      if (!(typeof slug === 'string' && /^[؀-ۿ|a-z|0-9|-]+$/.test(slug))) {
        // Skip invalid slugs
        return
      }

      const path = `/${sitePath}/${slug}`.replace(/\/\//g, '/')
      const url = `${locale.url}${path}`

      dynamicRoutes.push({
        url,
        lastModified: new Date(updatedAt),
      })
    })
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url : `${process.env.NEXT_PUBLIC_BASE_URL}/en` },
    { url : `${process.env.NEXT_PUBLIC_BASE_URL}/id` },
    { url : `${process.env.NEXT_PUBLIC_BASE_URL}/en/article` },
    { url : `${process.env.NEXT_PUBLIC_BASE_URL}/id/portofolio` },
  ]

  return [...staticRoutes, ...dynamicRoutes]
}
