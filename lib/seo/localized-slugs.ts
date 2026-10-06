import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { locales } from './config'

type Collection = 'pages' | 'articles' | 'projects'

/**
 * Slugs are localized, so the same document lives at a different URL per
 * locale. Returns { en: 'slug-en', id: 'slug-id' } for hreflang alternates.
 */
export const getLocalizedSlugs = unstable_cache(
  async ( collection: Collection, id: string ): Promise<Record<string, string | undefined>> => {
    try {
      const payload = await getPayload( { config : configPromise } )
      const doc = await payload.findByID( {
        collection,
        id,
        locale : 'all',
        depth  : 0,
      } )
      const slug = ( doc as unknown as { slug?: Record<string, string> | string } ).slug

      if ( typeof slug === 'string' ) return Object.fromEntries( locales.map( ( l ) => [l, slug] ) )

      return Object.fromEntries( locales.map( ( l ) => [l, slug?.[l] || undefined] ) )
    } catch {
      return {}
    }
  },
  ['localized-slugs'],
  { tags : ['pages', 'articles', 'projects'] }
)

/** Turns { en: 'foo' } into { en: '/article/foo' } */
export const slugsToPaths = ( slugs: Record<string, string | undefined>, prefix = '' ) =>
  Object.fromEntries(
    Object.entries( slugs ).map( ( [l, slug] ) => [l, slug ? `${prefix}/${slug}` : undefined] )
  )
