import Detail from '@/components/Pages/Article/Detail'
import { getAllArticleSlugs, getDetail } from '@/lib/api/articleQueryFn'
import { Article } from '@/payload-types'
import { FALLBACK_SEO } from '@/utils/constants'
import imageUrl from '@/utils/imageUrl'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import { Metadata } from 'next'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getDetail( params.slug, params.locale )

  const title = data?.title || FALLBACK_SEO.title
  const desc = `Article: ${data?.title}` || FALLBACK_SEO.description
  const canonicalURL = `${process.env.NEXT_PUBLIC_BASE_URL}/${params.locale}/article/${params.slug}`

  return {
    title       : title || undefined,
    description : desc || undefined,
    openGraph   : {
      url         : canonicalURL,
      title       : title || undefined,
      description : desc || undefined,
      siteName    : 'Ian Febi Sastrataruna',
      type        : 'article',
      images      : data?.heroImage
        ? [{ url : imageUrl( data.heroImage, 'thumbnail' ) || '' }]
        : [],
      authors : ['Ian Febi Sastrataruna'],
    },
    twitter : {
      card        : 'summary',
      site        : '@ianfebi01',
      title       : title || undefined,
      description : desc || '',
    },
  }
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
  const data = await getDetail( params.slug, params.locale );

  return (
    <main className="grow-[1] flex flex-col">
      <Detail data={data} />
    </main>
  )
}
