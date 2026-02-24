import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware( routing )

export default function proxy( req: NextRequest ) {
  // Run i18n middleware first
  const intlResponse = intlMiddleware( req )

  return intlResponse
}

export const config = {
  matcher : '/((?!api|trpc|_next|_vercel|.*\\..*|sitemap\\.xml|robots\\.txt).*)',
}
