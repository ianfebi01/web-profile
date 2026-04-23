import { Media } from '@/payload-types'

export type ImageObj =
  | Media
  | string
  | null
  | undefined

const imageUrl = (
  imageObj: ImageObj,
): string | undefined => {
  if ( !imageObj ) return undefined

  if ( typeof imageObj === 'string' ) {
    return ( imageObj.startsWith( 'http' ) || imageObj.startsWith( '/' ) ) ? imageObj : undefined
  }

  // Payload Media object — prefer cloudinary URL, fall back to local url
  return imageObj.cloudinary?.secure_url || imageObj.url || undefined
}

export default imageUrl
