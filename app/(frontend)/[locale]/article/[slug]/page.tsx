import Detail from '@/components/Pages/Article/Detail'
import { getAllArticleSlugs, getDetail, getRecommendedArticles } from '@/lib/api/articleQueryFn'
import { Article, Tag } from '@/payload-types'
import { buildMetadata, clampDescription } from '@/lib/seo/metadata'
import { getLocalizedSlugs, slugsToPaths } from '@/lib/seo/localized-slugs'
import { getPlainText } from '@/utils/parseMd'
import JsonLd from '@/components/Seo/JsonLd'
import { articleSchema, breadcrumbSchema, graph } from '@/lib/seo/structured-data'
import { getTranslations } from 'next-intl/server'
import { FALLBACK_SEO } from '@/utils/constants'
import imageUrl from '@/utils/imageUrl'
import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

const tagNames = ( data: Article ) =>
  ( data.tags ?? [] ).filter( ( tag ): tag is Tag => typeof tag === 'object' ).map( ( tag ) => tag.title )

const articleDescription = ( data: Article ) =>
  clampDescription( data.introText || getPlainText( data.content || '' ) ) || FALLBACK_SEO.description

export async function generateMetadata( props: Props ): Promise<Metadata> {
  const params = await props.params;
  setRequestLocale( params.locale )
  const data = await getDetail( params.slug, params.locale )

  if ( !data ) return { title : FALLBACK_SEO.title, robots : { index : false } }

  const slugs = await getLocalizedSlugs( 'articles', data.id )

  return buildMetadata( {
    locale        : params.locale,
    paths         : slugsToPaths( slugs, '/article' ),
    title         : data.title,
    description   : articleDescription( data ),
    image         : imageUrl( data.heroImage ),
    imageAlt      : data.title,
    type          : 'article',
    publishedTime : data.createdAt,
    modifiedTime  : data.updatedAt,
    tags          : tagNames( data ),
    keywords      : tagNames( data ),
  } )
}

export async function generateStaticParams() {
  const articles = await getAllArticleSlugs()

  return (
    articles?.map( ( article: Article ) => ( {
      slug : article.slug,
    } ) ) || []
  )
}

export default async function ArticlePage(
  props: {
    params: Promise<{ locale: string; slug: string }>
  }
) {
  const params = await props.params;
  setRequestLocale( params.locale )
  const data = await getDetail( params.slug, params.locale );

  if ( !data ) {
    return notFound()
  }

  const tagIds = ( data.tags ?? [] ).map( ( tag ) => ( typeof tag === 'object' ? tag.id : tag ) )
  const recommendedArticles = await getRecommendedArticles( params.slug, tagIds, params.locale )

  const t = await getTranslations( { locale : params.locale, namespace : 'article' } )
  const path = `/article/${params.slug}`
  const jsonLd = graph(
    articleSchema( {
      locale        : params.locale,
      path,
      headline      : data.title,
      description   : articleDescription( data ),
      image         : imageUrl( data.heroImage ),
      datePublished : data.createdAt,
      dateModified  : data.updatedAt,
      keywords      : tagNames( data ),
      wordCount     : data.content?.trim().split( /\s+/ ).length,
    } ),
    breadcrumbSchema( params.locale, [
      { name : 'Home', path : '' },
      { name : t( 'title' ), path : '/article' },
      { name : data.title, path },
    ] ),
  )

  return (
    <div className="grow flex flex-col">
      <JsonLd data={jsonLd} />
      <Detail data={data}
        recommendedArticles={recommendedArticles}
      />
    </div>
  )
}
