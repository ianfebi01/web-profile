import { Article } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@/app/payload.config'
import { unstable_cache } from 'next/cache'

export const getDetail = unstable_cache(
  async ( slug: string | number, locale: string = 'en' ): Promise<Article | null> => {
    const payload = await getPayload( { config : configPromise } )
    const res = await payload.find( {
      collection : 'articles',
      where      : { slug : { equals : slug } },
      locale     : locale as 'en' | 'id',
      depth      : 2,
    } )
    if ( res.docs.length === 0 ) return null
    
    return res.docs[0]
  },
  ['article-detail'],
  { tags : ['articles'] }
)

export const getAllArticleSlugs = unstable_cache(
  async (): Promise<Article[] | null> => {
    try {
      const payload = await getPayload( { config : configPromise } )
      const res = await payload.find( {
        collection : 'articles',
        depth      : 1,
        limit      : 1000,
      } )
      if ( res.docs.length === 0 ) return null
      
      return res.docs
    } catch {
      // Allow CI builds without DB/Payload secrets by skipping SSG params.
      return null
    }
  },
  ['all-article-slugs'],
  { tags : ['articles'] }
)

export const getRecommendedArticles = unstable_cache(
  async ( currentSlug: string, tagIds: string[] = [], locale: string = 'en', limit: number = 4 ): Promise<Article[]> => {
    const payload = await getPayload( { config : configPromise } )

    // Articles that share a tag with the current one come first
    const related = tagIds.length > 0
      ? ( await payload.find( {
        collection : 'articles',
        where      : { and : [{ slug : { not_equals : currentSlug } }, { tags : { in : tagIds } }] },
        locale     : locale as 'en' | 'id',
        depth      : 2,
        limit,
        sort       : '-createdAt',
      } ) ).docs
      : []

    if ( related.length >= limit ) return related

    // Top up with the latest articles
    const excludedIds = related.map( ( article ) => article.id )
    const latest = await payload.find( {
      collection : 'articles',
      where      : {
        and : [
          { slug : { not_equals : currentSlug } },
          ...( excludedIds.length > 0 ? [{ id : { not_in : excludedIds } }] : [] ),
        ],
      },
      locale : locale as 'en' | 'id',
      depth  : 2,
      limit  : limit - related.length,
      sort   : '-createdAt',
    } )

    return [...related, ...latest.docs]
  },
  ['recommended-articles'],
  { tags : ['articles'] }
)
