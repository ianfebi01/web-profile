import type { Payload } from 'payload'

type OpenverseImage = {
  id: string
  url: string
  title: string | null
  filetype: string | null
}

const searchOpenverse = async ( query: string ): Promise<OpenverseImage[]> => {
  // Openverse needs no API key. cc0/pdm = public domain, so no attribution is required.
  const url = new URL( 'https://api.openverse.org/v1/images/' )
  url.searchParams.set( 'q', query )
  url.searchParams.set( 'license', 'cc0,pdm' )
  url.searchParams.set( 'category', 'photograph' )
  url.searchParams.set( 'aspect_ratio', 'wide' )
  url.searchParams.set( 'size', 'large' )
  url.searchParams.set( 'mature', 'false' )
  url.searchParams.set( 'page_size', '10' )

  const res = await fetch( url, { headers : { 'User-Agent' : 'web-profile-article-bot' } } )
  if ( !res.ok ) throw new Error( `Openverse search failed: ${res.status}` )

  return ( ( await res.json() ) as { results: OpenverseImage[] } ).results
}

/**
 * Finds a free (public domain) photo for the query, uploads it to the Media
 * collection and returns its id, or null when nothing usable was found.
 */
export const uploadCoverImage = async ( payload: Payload, query: string ): Promise<string | null> => {
  let results = await searchOpenverse( query )
  // Specific queries often have no public domain matches; retry with the first keyword only
  if ( !results.length && query.includes( ' ' ) ) results = await searchOpenverse( query.split( ' ' )[0] )

  for ( const image of results ) {
    // Some image hosts reject requests without a browser-like User-Agent
    const res = await fetch( image.url, {
      headers : { 'User-Agent' : 'Mozilla/5.0 (compatible; web-profile-article-bot)' },
    } ).catch( () => null )
    const mimetype = res?.headers.get( 'content-type' )?.split( ';' )[0] ?? ''
    if ( !res?.ok || !mimetype.startsWith( 'image/' ) ) continue

    const data = Buffer.from( await res.arrayBuffer() )
    const media = await payload.create( {
      collection : 'media',
      data       : { alt : image.title || query },
      file       : {
        data,
        mimetype,
        name : `article-cover-${image.id}.${image.filetype || mimetype.split( '/' )[1]}`,
        size : data.length,
      },
    } )

    return media.id
  }

  return null
}
