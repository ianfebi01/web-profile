'use client';
import Image from 'next/image'
import imageUrl from '@/utils/imageUrl'
import Markdown from '@/components/Parsers/Markdown'
import imageLoader from '@/lib/constans/image-loader'
import SkeletonDetail from '../Portofolio/SkeletonDetail'
import AuthorMeta from '@/components/Reading/AuthorMeta'
import ShareActions from '@/components/Reading/ShareActions'
import ArticleRecommendCard from '@/components/Cards/ArticleRecommendCard'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Article, Tag } from '@/payload-types'

interface Props {
  data: Article | null
  recommendedArticles?: Article[]
  isFetching?: boolean
}

const Detail = ( { data, recommendedArticles = [], isFetching }: Props ) => {
  const t = useTranslations()
  const tags = ( data?.tags ?? [] ).filter( ( tag ): tag is Tag => typeof tag === 'object' )

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

          <AuthorMeta content={data.content}
            date={data.createdAt}
          />

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
              <ShareActions title={data.title} />
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

      {!isFetching && recommendedArticles.length > 0 && (
        <aside className="w-full border-t border-black/10 dark:border-white/10">
          <div className="max-w-[728px] mx-auto px-6 py-16 text-black dark:text-white">
            <h2 className="mt-0 mb-10 text-xl md:text-2xl font-bold tracking-tight">
              {t( 'article.recommended' )}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
              {recommendedArticles.map( ( article ) => (
                <ArticleRecommendCard key={article.id}
                  data={article}
                />
              ) )}
            </div>
            <Link
              href="/article"
              className="inline-flex mt-12 px-5 py-2.5 rounded-full text-sm font-medium no-underline border border-black/25 hover:border-black dark:border-white/25 dark:hover:border-white transition-colors duration-200"
            >
              {t( 'article.see_all' )}
            </Link>
          </div>
        </aside>
      )}
    </section>
  )
}

export default Detail
