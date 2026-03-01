import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    rules : [
      {
        userAgent : '*',
        disallow  : isProduction ? [] : ['/'],
        allow     : isProduction ? ['/'] : [],
      },
    ],
    sitemap : `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  }
}
