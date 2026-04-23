import { Article } from '@/payload-types'

type PayloadListResponse<T> = {
  docs: T[]
  page: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type FetchArticlesParams = {
  locale: string
  page: number
  searchTerm: string
  limit?: number
}

export async function fetchArticles( {
  locale,
  page,
  searchTerm,
  limit = 9,
}: FetchArticlesParams ): Promise<PayloadListResponse<Article>> {
  const params = new URLSearchParams( {
    locale,
    depth : '2',
    sort  : '-createdAt',
    limit : String( limit ),
    page  : String( page ),
  } )

  const normalizedSearchTerm = searchTerm.trim()

  if ( normalizedSearchTerm ) {
    params.append( 'where[or][0][title][like]', normalizedSearchTerm )
    params.append( 'where[or][1][introText][like]', normalizedSearchTerm )
    params.append( 'where[or][2][content][like]', normalizedSearchTerm )
  }

  const response = await fetch( `/api/articles?${params.toString()}` )

  if ( !response.ok ) {
    throw new Error( 'Failed to fetch articles' )
  }

  const data = ( await response.json() ) as PayloadListResponse<Article>

  return data
}