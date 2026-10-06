'use client'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import imageUrl from '@/utils/imageUrl'
import imageLoader from '@/lib/constans/image-loader'
import { getPlainText } from '@/utils/parseMd'
import { useLocale, useTranslations } from 'next-intl'
import { Article, Tag } from '@/payload-types'
import { AUTHOR_NAME, getReadingTime } from '@/components/Reading/reading'
import AuthorAvatar from '@/components/Reading/AuthorAvatar'

interface Props {
  data: Article
}

// Medium-style feed row: byline, title, excerpt and meta on the left, thumbnail on the right
const ArticleListItem = ( { data }: Props ) => {
  const t = useTranslations()
  const locale = useLocale()

  const tag = ( data.tags ?? [] ).find( ( item ): item is Tag => typeof item === 'object' )
  const thumbnail = imageUrl( data.heroImage )

  return (
    <article className="py-8 first:pt-0">
      <Link
        data-name="proj"
        data-text="Read"
        href={`/article/${data.slug}`}
        aria-label={`${t( 'read_more' )} ${data.title}`}
        className="group flex flex-col gap-3 no-underline text-black dark:text-white"
      >
        <div className="flex items-center gap-2">
          <AuthorAvatar size="sm" />
          <span className="text-[13px] font-medium">{AUTHOR_NAME}</span>
        </div>

        <div className="flex items-start gap-6 sm:gap-12">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <h2 className="m-0 font-bold tracking-tight leading-snug text-lg sm:text-[22px] line-clamp-3 group-hover:underline underline-offset-4 decoration-1">
              {data.title}
            </h2>
            <p className="m-0 font-serif text-sm sm:text-base leading-normal line-clamp-2 text-black/65 dark:text-white/60">
              {getPlainText( data.introText || data.content || '' )}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[13px] text-black/65 dark:text-white/55">
              <span>
                {new Date( data.createdAt ).toLocaleDateString( locale, {
                  month : 'short',
                  day   : 'numeric',
                  year  : 'numeric',
                } )}
              </span>
              <span>·</span>
              <span>{t( 'article.min_read', { count : getReadingTime( data.content ) } )}</span>
              {!!tag && (
                <span className="hidden sm:inline ml-2 px-2.5 py-0.5 rounded-full bg-light-secondary dark:bg-dark-secondary text-black/70 dark:text-white/70">
                  {tag.title}
                </span>
              )}
            </div>
          </div>

          {!!thumbnail && (
            <div className="relative shrink-0 w-20 sm:w-40 aspect-square sm:aspect-[3/2] overflow-hidden bg-light-secondary dark:bg-dark-secondary">
              <Image
                src={thumbnail}
                alt={`${data.title} Picture`}
                fill
                sizes="(max-width: 640px) 80px, 160px"
                className="object-cover object-center"
                loading="lazy"
                placeholder={imageLoader}
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

export default ArticleListItem
