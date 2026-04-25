import { Project } from '@/payload-types'

type PayloadListResponse<T> = {
  docs: T[]
  page: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type FetchPortofoliosParams = {
  locale: string
  page: number
  searchTerm: string
  limit?: number
}

export async function fetchPortofolios( {
  locale,
  page,
  searchTerm,
  limit = 9,
}: FetchPortofoliosParams ): Promise<PayloadListResponse<Project>> {
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
    params.append( 'where[or][1][description][like]', normalizedSearchTerm )
    params.append( 'where[or][2][content][like]', normalizedSearchTerm )
  }

  const response = await fetch( `/api/projects?${params.toString()}` )

  if ( !response.ok ) {
    throw new Error( 'Failed to fetch projects' )
  }

  const data = ( await response.json() ) as PayloadListResponse<Project>

  return data
}