import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware( routing )

const canonicalHost = ( () => {
  try {
    return new URL( process.env.NEXT_PUBLIC_BASE_URL || '' ).host
  } catch {
    return ''
  }
} )()

const stripWww = ( host: string ) => host.replace( /^www\./, '' )

export default function proxy( req: NextRequest ) {
  // Serve the site from a single host: `febbbi.com` and `www.febbbi.com` both
  // resolve here, but canonical/hreflang tags use NEXT_PUBLIC_BASE_URL, so the
  // other variant is permanently redirected to avoid duplicate content.
  const host = req.headers.get( 'x-forwarded-host' ) || req.headers.get( 'host' ) || ''
  if ( canonicalHost && host !== canonicalHost && stripWww( host ) === stripWww( canonicalHost ) ) {
    const url = new URL( req.nextUrl.pathname + req.nextUrl.search, `https://${canonicalHost}` )

    return NextResponse.redirect( url, 308 )
  }

  // Run i18n middleware first
  const intlResponse = intlMiddleware( req )

  return intlResponse
}

export const config = {
  // matcher : '/((?!api|trpc|_next|_vercel|.*\\..*|sitemap\\.xml|robots\\.txt).*)',

  matcher : [
    // Match all pathnames except for
    // - /admin (Payload admin panel)
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - all root files inside /public (e.g. /favicon.ico)`
    '/((?!admin|api|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames within `/users`, `/articles`, etc.
    // Ensure that the matcher catches all locales
    '/',
    '/(id|en)/:path*'
  ]
}
