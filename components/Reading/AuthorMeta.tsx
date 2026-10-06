'use client'
import { useLocale, useTranslations } from 'next-intl'
import { AUTHOR_NAME, getReadingTime } from './reading'
import AuthorAvatar from './AuthorAvatar'

interface Props {
  content?: string | null
  date: string
}

// Medium-style byline: avatar, author, reading time and date
const AuthorMeta = ( { content, date }: Props ) => {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="flex items-center gap-3 mt-8">
      <AuthorAvatar />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm md:text-base font-medium">{AUTHOR_NAME}</span>
        <span className="text-sm text-black/65 dark:text-white/55">
          {t( 'article.min_read', { count : getReadingTime( content ) } )}
          <span className="mx-2">·</span>
          {new Date( date ).toLocaleDateString( locale, {
            month : 'short',
            day   : 'numeric',
            year  : 'numeric',
          } )}
        </span>
      </div>
    </div>
  )
}

export default AuthorMeta
