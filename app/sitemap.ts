import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@/app/payload.config'
import { isPayloadReady } from '@/lib/is-payload-ready'
import { localeUrl, locales } from '@/lib/seo/config'
import { LocalizedPaths, languageAlternates } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'

type Collection = 'pages' | 'articles' | 'projects'

const VALID_SLUG = /^[؀-ۿa-z0-9-]+$/
// Home page documents (e.g. `home`, `home-id`) are served at the locale root
const HOME_SLUG = /^home(-[a-z]{2})?$/

/** One entry per locale, each carrying hreflang alternates to its siblings */
const entriesFor = (
  paths: LocalizedPaths,
  extra: Omit<MetadataRoute.Sitemap[number], 'url'> = {}
): MetadataRoute.Sitemap => {
  const languages = languageAlternates( paths )

  return locales
    .filter( ( locale ) => typeof paths[locale] === 'string' )
    .map( ( locale ) => ( {
      url        : localeUrl( locale, paths[locale] as string ),
      alternates : { languages },
      ...extra,
    } ) )
}

const samePath = ( path: string ): LocalizedPaths => Object.fromEntries( locales.map( ( l ) => [l, path] ) )

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    ...entriesFor( samePath( '' ), { changeFrequency : 'monthly', priority : 1 } ),
    ...entriesFor( samePath( '/article' ), { changeFrequency : 'weekly', priority : 0.8 } ),
    ...entriesFor( samePath( '/portofolio' ), { changeFrequency : 'monthly', priority : 0.8 } ),
  ]

  if ( !isPayloadReady() ) {
    return staticRoutes
  }

  const payload = await getPayload( { config : configPromise } )

  const fetchCollection = async ( collection: Collection, prefix: string, priority: number ) => {
    // `locale: 'all'` returns every localized slug so each URL can list its translations
    const res = await payload.find( {
      collection,
      depth  : 0,
      limit  : 1000,
      locale : 'all',
    } )

    return res.docs.flatMap( ( doc ) => {
      const rawSlug = ( doc as unknown as { slug?: string | Record<string, string> } ).slug
      const slugs: Record<string, string | undefined> =
        typeof rawSlug === 'string'
          ? Object.fromEntries( locales.map( ( l ) => [l, rawSlug] ) )
          : rawSlug || {}

      const paths: LocalizedPaths = {}
      for ( const locale of locales ) {
        const slug = slugs[locale]
        if ( !slug || HOME_SLUG.test( slug ) || !VALID_SLUG.test( slug ) ) continue
        paths[locale] = `${prefix}/${slug}`
      }

      return entriesFor( paths, {
        lastModified    : new Date( doc.updatedAt as string ),
        changeFrequency : 'monthly',
        priority,
      } )
    } )
  }

  const dynamicRoutes = (
    await Promise.all( [
      fetchCollection( 'pages', '', 0.6 ),
      fetchCollection( 'articles', '/article', 0.7 ),
      fetchCollection( 'projects', '/portofolio', 0.6 ),
    ] )
  ).flat()

  return [...staticRoutes, ...dynamicRoutes]
}
