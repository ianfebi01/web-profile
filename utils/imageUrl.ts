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

  // If it's a full URL string (http/https), return it
  if (typeof imageObj === 'string') {
    if (imageObj.startsWith('http://') || imageObj.startsWith('https://') || imageObj.startsWith('/')) {
      return imageObj
    }
    // Raw ID string — not a valid image URL
    return undefined
  }

  // Payload Media object — prefer cloudinary URL, fall back to local url
  return imageObj.cloudinary?.secure_url || imageObj.url || undefined
}

export default imageUrl
