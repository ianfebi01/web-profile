'use client'

import type { ImageLoaderProps } from 'next/image'

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/

/**
 * Let Cloudinary resize/compress images on its CDN instead of running sharp on our VPS
 * (the built-in `/_next/image` optimizer was crashing the container and returning 502s).
 */
export default function cloudinaryLoader( { src, width, quality }: ImageLoaderProps ): string {
  const match = src.match( CLOUDINARY_UPLOAD )

  if ( !match ) {
    // Local assets (/Logo.svg, ...) and other hosts are served as-is
    const separator = src.includes( '?' ) ? '&' : '?'

    return `${src}${separator}w=${width}`
  }

  const transforms = [
    'f_auto',
    'c_limit',
    `w_${width}`,
    quality ? `q_${quality}` : 'q_auto',
  ].join( ',' )

  return `${match[1]}${transforms}/${match[2]}`
}
