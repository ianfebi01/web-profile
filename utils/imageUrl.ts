import { Media } from '@/payload-types'

export type ImageObj =
  | Media
  | string
  | null
  | undefined

const imageUrl = (
  imageObj: ImageObj,
  _imageSize: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' | 'original' = 'original'
): string | undefined => {
  if (!imageObj) return undefined

  // If it's already a string (ID or URL), return it
  if (typeof imageObj === 'string') return imageObj

  // Payload Media object — check url, then cloudinary.secure_url
  return imageObj.url || imageObj.cloudinary?.secure_url || undefined
}

export default imageUrl
