import { Media } from '@/payload-types'

const isVideo = ( imageObj: Media | string | null | undefined ) => {
  if (!imageObj || typeof imageObj === 'string') return false
  return /^video/.test( imageObj?.mimeType || '' )
}

export default isVideo
