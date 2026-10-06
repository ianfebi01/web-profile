type Props = {
  data: Record<string, unknown>
}

// Escape `<` so content can never close the script tag early
const serialize = ( data: Props['data'] ) => JSON.stringify( data ).replace( /</g, '\\u003c' )

const JsonLd = ( { data }: Props ) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html : serialize( data ) }}
  />
)

export default JsonLd
