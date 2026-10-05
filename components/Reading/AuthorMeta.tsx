'use client'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  content?: string | null
  date: string
}

const AUTHOR_NAME = 'Ian Febi Sastrataruna'
const WORDS_PER_MINUTE = 200

const getReadingTime = ( content?: string | null ) => {
  const words = content?.trim().split( /\s+/ ).length ?? 0

  return Math.max( 1, Math.round( words / WORDS_PER_MINUTE ) )
}

// Medium-style byline: avatar, author, reading time and date
const AuthorMeta = ( { content, date }: Props ) => {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="flex items-center gap-3 mt-8">
      <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-light-secondary dark:bg-dark-secondary">
        <Image
          src="/me.png"
          alt={AUTHOR_NAME}
          fill
          sizes="44px"
          className="object-cover object-top"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm md:text-base font-medium">{AUTHOR_NAME}</span>
        <span className="text-sm text-black/55 dark:text-white/55">
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
