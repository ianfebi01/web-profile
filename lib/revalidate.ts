import { revalidatePath, revalidateTag } from 'next/cache'

const LOCALES = ['en', 'id'] as const

type Locale = ( typeof LOCALES )[number]

type RevalidateOptions = {
  tags?: string[]
  locales?: string[]
  paths?: string[]
  includeSitemap?: boolean
}

export const resolveLocales = ( locale?: string ): Locale[] => {
  if ( !locale ) return [...LOCALES]
  if ( LOCALES.includes( locale as Locale ) ) return [locale as Locale]
  
  return [...LOCALES]
}

export const readLocalizedSlug = ( slug: unknown, locale?: string ): string | null => {
  if ( typeof slug === 'string' ) return slug
  if ( slug && typeof slug === 'object' && locale ) {
    const localizedSlug = ( slug as Record<string, unknown> )[locale]
    
    return typeof localizedSlug === 'string' ? localizedSlug : null
  }
  
  return null
}

export const revalidateContent = ( {
  tags = [],
  locales = [...LOCALES],
  paths = [],
  includeSitemap = true,
}: RevalidateOptions = {} ) => {
  for ( const tag of tags ) {
    // Tag-based invalidation for unstable_cache/data-cache lookups
    revalidateTag( tag, 'max' )
  }

  const uniquePaths = new Set<string>()
  for ( const locale of locales ) {
    uniquePaths.add( `/${locale}` )
  }
  for ( const path of paths ) {
    if ( path.startsWith( '/' ) ) uniquePaths.add( path )
  }

  for ( const path of Array.from( uniquePaths ) ) {
    revalidatePath( path )
  }

  // Keep generated sitemap fresh after content mutations.
  if ( includeSitemap ) {
    revalidatePath( '/sitemap.xml' )
  }
}
