'use client';
import Image from 'next/image'
import imageUrl from '@/utils/imageUrl'
import Markdown from '@/components/Parsers/Markdown'
import imageLoader from '@/lib/constans/image-loader'
import SkeletonDetail from '../Portofolio/SkeletonDetail'
import { useLocale, useTranslations } from 'next-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faLink, faShareFromSquare } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Article, Tag } from '@/payload-types'

interface Props {
  data: Article | null
  isFetching?: boolean
}

const AUTHOR_NAME = 'Ian Febi Sastrataruna'
const WORDS_PER_MINUTE = 200

const getReadingTime = ( content?: string | null ) => {
  const words = content?.trim().split( /\s+/ ).length ?? 0

  return Math.max( 1, Math.round( words / WORDS_PER_MINUTE ) )
}

const Detail = ( { data, isFetching }: Props ) => {
  const t = useTranslations()
  const locale = useLocale()
  const [copied, setCopied] = useState( false )

  const tags = ( data?.tags ?? [] ).filter( ( tag ): tag is Tag => typeof tag === 'object' )

  const copyLink = async () => {
    await navigator.clipboard.writeText( window.location.href )
    setCopied( true )
    toast.success( t( 'article.link_copied' ) )
    setTimeout( () => setCopied( false ), 2000 )
  }

  const share = async () => {
    if ( !navigator.share ) return copyLink()

    try {
      await navigator.share( { title : data?.title, text : data?.introText ?? undefined, url : window.location.href } )
    } catch {
      // The user dismissed the share sheet
    }
  }

  const actionClass =
    'p-2 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors duration-200 cursor-pointer'

  return (
    <section
      id="article"
      className="w-full flex flex-col items-center bg-white dark:bg-dark grow"
    >
      {isFetching || !data ? (
        <SkeletonDetail />
      ) : (
        <article className="w-full max-w-[728px] px-6 mt-28 mb-16 text-black dark:text-white">
          <h1 className="m-0 font-bold tracking-tight leading-[1.15] text-[32px] md:text-[42px]">
            {data.title}
          </h1>

          {/* Author */}
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
                {t( 'article.min_read', { count : getReadingTime( data.content ) } )}
                <span className="mx-2">·</span>
                {new Date( data.createdAt ).toLocaleDateString( locale, {
                  month : 'short',
                  day   : 'numeric',
                  year  : 'numeric',
                } )}
              </span>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between gap-4 mt-8 py-1 border-y border-black/10 dark:border-white/10">
            <div className="flex flex-wrap gap-2">
              {tags.slice( 0, 3 ).map( ( tag ) => (
                <span
                  key={tag.id}
                  className="text-xs px-3 py-1 rounded-full bg-light-secondary dark:bg-dark-secondary text-black/70 dark:text-white/70"
                >
                  {tag.title}
                </span>
              ) )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={copyLink}
                aria-label={t( 'article.copy_link' )}
                className={actionClass}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faLink}
                  className="size-4"
                />
              </button>
              <button
                type="button"
                onClick={share}
                aria-label={t( 'article.share' )}
                className={actionClass}
              >
                <FontAwesomeIcon icon={faShareFromSquare}
                  className="size-4"
                />
              </button>
            </div>
          </div>

          {!!data.heroImage && (
            <figure className="relative w-full aspect-video mt-10 m-0 overflow-hidden bg-light-secondary dark:bg-dark-secondary">
              <Image
                className="object-cover object-center"
                src={imageUrl( data.heroImage ) || ''}
                fill
                sizes="(max-width: 728px) 100vw, 680px"
                alt={`${data.title} Image`}
                priority
                placeholder={imageLoader}
              />
            </figure>
          )}

          {!!data.content && (
            <div className="article-body mt-10">
              <Markdown content={data.content} />
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12">
              {tags.map( ( tag ) => (
                <span
                  key={tag.id}
                  className="text-sm px-4 py-2 rounded-full bg-light-secondary dark:bg-dark-secondary"
                >
                  {tag.title}
                </span>
              ) )}
            </div>
          )}
        </article>
      )}
    </section>
  )
}

export default Detail
