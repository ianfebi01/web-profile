import { PluginUploadFile } from '@/types/generated/contentTypes'

const imageUrl = (
  imageObj: any,
  imageSize: 'thumbnail' | 'small' | 'medium' | 'large' | 'xlarge' | 'original' = 'original'
): string | undefined => {
  if (!imageObj) return undefined

  // Extract Payload vs. Strapi structure
  const isPayload = typeof imageObj.url === 'string'
  const attributes = isPayload ? imageObj : imageObj?.attributes

  if (!attributes) return undefined

  if (
    attributes.mimeType === 'image/svg+xml' ||
    attributes.mime === 'image/svg+xml' ||
    /^video/.test(attributes.mimeType || attributes.mime)
  ) {
    return `${attributes.url}`
  }

  let scaledImage: { url?: string } = attributes

  const formats = isPayload ? attributes.sizes : attributes.formats

  if (formats) {
    switch (imageSize) {
      case 'thumbnail':
        scaledImage = formats.thumbnail || attributes
        break
      case 'small':
        scaledImage = formats.small || attributes
        break
      case 'medium':
        scaledImage = formats.medium || attributes
        break
      case 'large':
        scaledImage = formats.large || attributes
        break
      case 'xlarge':
        scaledImage = formats.xlarge || attributes
        break
    }
  }

  const { url } = scaledImage
  return url ? `${url}` : undefined
}

export default imageUrl
