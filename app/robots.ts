import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.APP_ENV === 'production'

  return {
    rules : isProduction
      ? [{ userAgent : '*', allow : '/', disallow : ['/admin', '/api/'] }]
      : [{ userAgent : '*', disallow : '/' }],
    sitemap : `${SITE_URL}/sitemap.xml`,
    host    : SITE_URL,
  }
}
