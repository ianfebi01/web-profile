import {
  AUTHOR_JOB_TITLE,
  AUTHOR_NAME,
  DEFAULT_OG_IMAGE,
  SAME_AS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  localeUrl,
} from './config'

/**
 * schema.org builders. Entities are linked with stable `@id`s so search
 * engines merge them into one knowledge graph across pages.
 */

export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`

type Thing = Record<string, unknown>

const LANGUAGES: Record<string, string> = { en : 'en-US', id : 'id-ID' }
export const inLanguage = ( locale: string ) => LANGUAGES[locale] || locale

export const personSchema = ( {
  description,
  image,
  sameAs = [],
}: { description?: string | null; image?: string | null; sameAs?: string[] } = {} ): Thing => ( {
  '@type'     : 'Person',
  '@id'       : PERSON_ID,
  name        : AUTHOR_NAME,
  url         : SITE_URL,
  image       : absoluteUrl( image ) || absoluteUrl( DEFAULT_OG_IMAGE ),
  jobTitle    : AUTHOR_JOB_TITLE,
  description : description || undefined,
  sameAs      : [...new Set( [...SAME_AS, ...sameAs] )],
  knowsAbout  : ['Web Development', 'Front-end Development', 'React', 'Next.js', 'Vue.js', 'Nuxt', 'TypeScript'],
} )

export const websiteSchema = ( description?: string ): Thing => ( {
  '@type'    : 'WebSite',
  '@id'      : WEBSITE_ID,
  url        : SITE_URL,
  name       : SITE_NAME,
  description,
  inLanguage : Object.values( LANGUAGES ),
  publisher  : { '@id' : PERSON_ID },
  author     : { '@id' : PERSON_ID },
} )

export type Crumb = { name: string; path: string }

export const breadcrumbSchema = ( locale: string, crumbs: Crumb[] ): Thing => ( {
  '@type'         : 'BreadcrumbList',
  itemListElement : crumbs.map( ( crumb, index ) => ( {
    '@type'  : 'ListItem',
    position : index + 1,
    name     : crumb.name,
    item     : localeUrl( locale, crumb.path ),
  } ) ),
} )

export const webPageSchema = ( {
  locale,
  path,
  name,
  description,
  type = 'WebPage',
  extra = {},
}: {
  locale: string
  path: string
  name: string
  description?: string | null
  type?: 'WebPage' | 'CollectionPage' | 'ProfilePage' | 'AboutPage'
  extra?: Thing
} ): Thing => ( {
  '@type'     : type,
  '@id'       : `${localeUrl( locale, path )}#webpage`,
  url         : localeUrl( locale, path ),
  name,
  description : description || undefined,
  inLanguage  : inLanguage( locale ),
  isPartOf    : { '@id' : WEBSITE_ID },
  ...extra,
} )

export const articleSchema = ( {
  locale,
  path,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  keywords,
  wordCount,
}: {
  locale: string
  path: string
  headline: string
  description?: string | null
  image?: string | null
  datePublished: string
  dateModified: string
  keywords?: string[]
  wordCount?: number
} ): Thing => {
  const url = localeUrl( locale, path )

  return {
    '@type'          : 'BlogPosting',
    '@id'            : `${url}#article`,
    mainEntityOfPage : { '@type' : 'WebPage', '@id' : url },
    url,
    headline         : headline.slice( 0, 110 ),
    description      : description || undefined,
    image            : absoluteUrl( image ) ? [absoluteUrl( image )] : undefined,
    datePublished,
    dateModified,
    inLanguage       : inLanguage( locale ),
    keywords         : keywords?.length ? keywords.join( ', ' ) : undefined,
    wordCount,
    author           : { '@id' : PERSON_ID, '@type' : 'Person', name : AUTHOR_NAME, url : SITE_URL },
    publisher        : { '@id' : PERSON_ID },
    isPartOf         : { '@id' : WEBSITE_ID },
  }
}

export const projectSchema = ( {
  locale,
  path,
  name,
  description,
  image,
  images = [],
  dateCreated,
  dateModified,
  keywords,
  sameAs,
}: {
  locale: string
  path: string
  name: string
  description?: string | null
  image?: string | null
  images?: ( string | undefined )[]
  dateCreated: string
  dateModified: string
  keywords?: string[]
  sameAs?: string | null
} ): Thing => {
  const url = localeUrl( locale, path )
  const allImages = [image, ...images].map( absoluteUrl ).filter( Boolean )

  return {
    '@type'          : 'CreativeWork',
    '@id'            : `${url}#project`,
    mainEntityOfPage : { '@type' : 'WebPage', '@id' : url },
    url,
    name,
    headline         : name,
    description      : description || undefined,
    image            : allImages.length ? [...new Set( allImages )] : undefined,
    dateCreated,
    dateModified,
    inLanguage       : inLanguage( locale ),
    keywords         : keywords?.length ? keywords.join( ', ' ) : undefined,
    sameAs           : sameAs || undefined,
    creator          : { '@id' : PERSON_ID },
    author           : { '@id' : PERSON_ID },
    isPartOf         : { '@id' : WEBSITE_ID },
  }
}

/** Wraps nodes in a single @graph document */
export const graph = ( ...nodes: ( Thing | null | undefined | false )[] ) => ( {
  '@context' : 'https://schema.org',
  '@graph'   : nodes.filter( Boolean ),
} )
