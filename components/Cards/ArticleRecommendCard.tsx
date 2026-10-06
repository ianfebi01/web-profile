'use client'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import imageUrl from '@/utils/imageUrl'
import imageLoader from '@/lib/constans/image-loader'
import { getPlainText } from '@/utils/parseMd'
import { useLocale, useTranslations } from 'next-intl'
import { Article } from '@/payload-types'
import { AUTHOR_NAME, getReadingTime } from '@/components/Reading/reading'
import AuthorAvatar from '@/components/Reading/AuthorAvatar'
import formatDate from '@/utils/format-date'

interface Props {
  data: Article
}

// Medium-style "Recommended" card: thumbnail on top, then byline, title, excerpt and meta
const ArticleRecommendCard = ( { data }: Props ) => {
  const t = useTranslations()
  const locale = useLocale()

  const thumbnail = imageUrl( data.heroImage )

  return (
    <article className="h-full">
      <Link
        data-name="proj"
        data-text="Read"
        href={`/article/${data.slug}`}
        aria-label={`${t( 'read_more' )} ${data.title}`}
        className="group flex flex-col gap-3 h-full no-underline text-black dark:text-white"
      >
        <div className="relative w-full aspect-video overflow-hidden bg-light-secondary dark:bg-dark-secondary">
          {!!thumbnail && (
            <Image
              src={thumbnail}
              alt={`${data.title} Picture`}
              fill
              sizes="(max-width: 640px) 100vw, 340px"
              className="object-cover object-center"
              loading="lazy"
              placeholder={imageLoader}
            />
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <AuthorAvatar size="sm" />
          <span className="text-[13px] font-medium">{AUTHOR_NAME}</span>
        </div>

        <h3 className="m-0 font-bold tracking-tight leading-snug text-xl line-clamp-2 group-hover:underline underline-offset-4 decoration-1">
          {data.title}
        </h3>
        <p className="m-0 font-serif text-sm sm:text-base leading-normal line-clamp-2 text-black/65 dark:text-white/60">
          {getPlainText( data.introText || data.content || '' )}
        </p>

        <div className="flex items-center gap-2 mt-auto pt-2 text-[13px] text-black/65 dark:text-white/55">
          <span>
            {formatDate( data.createdAt, locale, {
              month : 'short',
              day   : 'numeric',
              year  : 'numeric',
            } )}
          </span>
          <span>·</span>
          <span>{t( 'article.min_read', { count : getReadingTime( data.content ) } )}</span>
        </div>
      </Link>
    </article>
  )
}

export default ArticleRecommendCard
