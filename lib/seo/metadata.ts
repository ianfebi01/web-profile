import type { Metadata } from 'next'
import {
  DEFAULT_OG_IMAGE,
  OG_LOCALES,
  SITE_NAME,
  TWITTER_HANDLE,
  absoluteUrl,
  defaultLocale,
  localeUrl,
  locales,
} from './config'

export type LocalizedPaths = Partial<Record<string, string | null | undefined>>

type BuildMetadataArgs = {
  locale: string
  /**
   * Path of this page for each locale (without the locale prefix). Pass a
   * string when the path is the same for every locale. Locales without a
   * path are left out of the hreflang alternates.
   */
  paths: string | LocalizedPaths
  title?: string | null
  description?: string | null
  image?: string | null
  imageAlt?: string | null
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  keywords?: string | string[] | null
  canonical?: string | null
  noIndex?: boolean
}

const MAX_DESCRIPTION = 160

export const clampDescription = ( text?: string | null ) => {
  if ( !text ) return undefined
  // Drop inline markdown markers (`code`, **bold**, # headings) that leak in from CMS text
  const plain = text.replace( /[`*#>]+/g, '' ).replace( /\s+/g, ' ' ).trim()
  if ( plain.length <= MAX_DESCRIPTION ) return plain

  return `${plain.slice( 0, MAX_DESCRIPTION - 1 ).replace( /\s+\S*$/, '' )}…`
}

/** Appends the site name unless the title already carries it */
export const withSiteName = ( title?: string | null ) => {
  if ( !title ) return SITE_NAME
  if ( title.includes( SITE_NAME ) || /\|\s*Ian Febi/i.test( title ) ) return title

  return `${title} | ${SITE_NAME}`
}

export const resolvePaths = ( paths: string | LocalizedPaths ): LocalizedPaths =>
  typeof paths === 'string'
    ? Object.fromEntries( locales.map( ( l ) => [l, paths] ) )
    : paths

/** hreflang map for Next metadata / sitemap alternates */
export const languageAlternates = ( paths: string | LocalizedPaths ) => {
  const resolved = resolvePaths( paths )
  const languages: Record<string, string> = {}

  for ( const l of locales ) {
    const path = resolved[l]
    if ( typeof path === 'string' ) languages[l] = localeUrl( l, path )
  }
  if ( languages[defaultLocale] ) languages['x-default'] = languages[defaultLocale]

  return languages
}

export const buildMetadata = ( {
  locale,
  paths,
  title,
  description,
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
  keywords,
  canonical,
  noIndex,
}: BuildMetadataArgs ): Metadata => {
  const resolved = resolvePaths( paths )
  const url = canonical || localeUrl( locale, resolved[locale] ?? '' )
  const fullTitle = withSiteName( title )
  const desc = clampDescription( description )
  const ogImage = absoluteUrl( image ) || absoluteUrl( DEFAULT_OG_IMAGE )
  const images = ogImage ? [{ url : ogImage, alt : imageAlt || title || SITE_NAME }] : undefined
  const alternateLocale = locales
    .filter( ( l ) => l !== locale && typeof resolved[l] === 'string' )
    .map( ( l ) => OG_LOCALES[l] )

  return {
    title       : { absolute : fullTitle },
    description : desc,
    keywords    : keywords || undefined,
    alternates  : {
      canonical : url,
      languages : languageAlternates( resolved ),
    },
    openGraph : {
      url,
      title       : fullTitle,
      description : desc,
      siteName    : SITE_NAME,
      locale      : OG_LOCALES[locale],
      alternateLocale,
      images,
      ...( type === 'article'
        ? { type : 'article', publishedTime, modifiedTime, authors : [localeUrl( locale )], tags }
        : { type } ),
    },
    twitter : {
      card        : 'summary_large_image',
      site        : TWITTER_HANDLE,
      creator     : TWITTER_HANDLE,
      title       : fullTitle,
      description : desc,
      images      : ogImage ? [ogImage] : undefined,
    },
    robots : noIndex ? { index : false, follow : true } : undefined,
  }
}
