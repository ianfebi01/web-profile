'use client'
import React from 'react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import imageUrl from '@/utils/imageUrl'
import { Article } from '@/payload-types'
import imageLoader from '@/lib/constans/image-loader'
import { getPlainText } from '@/utils/parseMd'
import { useLocale, useTranslations } from 'next-intl'

interface Props {
  data: Article | any
}

const ArticleCard: React.FC<Props> = ( { data } ) => {
  const t = useTranslations()
  const locale = useLocale()

  const formatDate = ( dateString: string ) => {
    const options: Intl.DateTimeFormatOptions = {
      year  : 'numeric',
      month : 'long',
      day   : 'numeric',
    }

    return new Date( dateString ).toLocaleDateString( locale, options )
  }

  return (
    <article
      className={cn(
        'bg-dark-secondary text-white flex flex-col gap-4 w-[calc(100%-0.5rem)] relative rounded-lg overflow-hidden',
        'h-full sm:basis-[calc(50%-1.5rem)] lg:basis-[calc(33.3%-1.5rem)]'
      )}
    >
      {!!imageUrl( data.heroImage, 'original' ) && (
        <div
          className={cn(
            'w-full shrink-0 overflow-hidden relative',
            'aspect-video'
          )}
        >
          <Image
            src={imageUrl( data.heroImage, 'original' ) || ''}
            alt={`${data.title} Picture`}
            className="object-cover object-top w-full h-full"
            loading="lazy"
            fill
            sizes="auto"
            placeholder={imageLoader}
          />
        </div>
      )}

      <div className="relative flex flex-col h-full px-4 pb-6">
        <span className="mb-2 text-xs lg:text-sm line-clamp-1 text-greydark">
          {formatDate( data.date || data.createdAt )}
        </span>
        <h3 className="pt-0 text-xl xxl:text-3xl xxl:leading-[2rem] font-extra-bold lg:mb-6">
          {data.title}
        </h3>
        <div className="mb-4 lg:mb-8 xxl:text-xl">
          <p className="m-0 line-clamp-3">{getPlainText( data.introText || data.content || '' )}</p>
        </div>
        <div className="grow"></div>
        <Link
          href={`/article/${data.slug}`}
          className={cn( 'button button-primary' )}
          aria-label={`Read more ${data.title} article`}
        >
          <span>{t( 'read_more' )}</span>
        </Link>
      </div>
    </article>
  )
}

export default ArticleCard

