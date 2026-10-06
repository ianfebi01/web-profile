import { routing } from '@/i18n/routing'

export const SITE_URL = ( process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000' ).replace( /\/$/, '' )
export const SITE_NAME = 'Ian Febi Sastrataruna'
export const AUTHOR_NAME = 'Ian Febi Sastrataruna'
export const AUTHOR_JOB_TITLE = 'Software Engineer'
export const TWITTER_HANDLE = '@ianfebi01'
export const DEFAULT_OG_IMAGE = '/me.png'
export const SAME_AS = [
  'https://www.instagram.com/ianfebi01/',
  'https://www.linkedin.com/in/ian-febi-sastrataruna-895598149/',
  'https://github.com/ianfebi01',
]

export const OG_LOCALES: Record<string, string> = {
  en : 'en_US',
  id : 'id_ID',
}

export const locales = routing.locales
export const defaultLocale = routing.defaultLocale

/** Absolute URL for a locale-relative path, e.g. ('en', '/article/foo') */
export const localeUrl = ( locale: string, path = '' ) => {
  const clean = path && !path.startsWith( '/' ) ? `/${path}` : path

  return `${SITE_URL}/${locale}${clean === '/' ? '' : clean}`
}

export const absoluteUrl = ( url?: string | null ) => {
  if ( !url ) return undefined
  if ( /^https?:\/\//.test( url ) ) return url

  return `${SITE_URL}${url.startsWith( '/' ) ? '' : '/'}${url}`
}
