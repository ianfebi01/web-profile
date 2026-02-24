import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export default function proxy(req: NextRequest) {
  // Run i18n middleware first
  const intlResponse = intlMiddleware(req)

  return intlResponse
}

export const config = {
  // matcher : '/((?!api|trpc|_next|_vercel|.*\\..*|sitemap\\.xml|robots\\.txt).*)',

  matcher: [
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
