import Detail from '@/components/Pages/Portofolio/Detail'
import {
  getAllPortfolioSlugs,
  getDetail,
  getLatestPortofolios,
} from '@/lib/api/portofolioQueryFn'
import { ApiPortofolioPortofolio } from '@/types/generated/contentTypes'
import imageUrl from '@/utils/imageUrl'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import { Metadata } from 'next'
import { Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

type Props = {
  params: Promise<{
    locale: Locale
    slug: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { locale } = await params
  setRequestLocale( locale )

  const response = await getDetail( params.slug )

  const data = response?.attributes
  const title = data?.title
  const desc = `Potofolio for project called ${data?.title}`
  const canonicalURL = `${process.env.NEXT_PUBLIC_BASE_URL}/${params.locale}/portofolio/${params.slug}`

  return {
    title,
    description : desc,
    openGraph   : {
      title,
      description : desc,
      url         : canonicalURL,
      siteName    : title,
      images      : [{ url : imageUrl( data?.featureImage.data, 'thumbnail' ) || '' }],
      type        : 'article',
      authors     : ['Ian Febi Sastrataruna'],
    },
    twitter : {
      card        : 'summary', // 'summary' for small card
      site        : '@ianfebi01', // Replace with your Twitter username
      title,
      description : desc,
      images      : [
        {
          url : imageUrl( data?.featureImage.data, 'thumbnail' ) || '',
        },
      ],
    },
  }
}

export async function generateStaticParams() {
  const slugs = await getAllPortfolioSlugs() // Fetch slugs from Strapi

  return (
    slugs?.map( ( slug: ApiPortofolioPortofolio ) => ( {
      slug : slug.attributes.slug,
    } ) ) || []
  )
}

export default async function PortofolioPage(
  props: {
    params: Promise<{ slug: string }>
  }
) {
  const params = await props.params;
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery( {
    queryKey : ['portofolio', 'detail', params.slug],
    queryFn  : (): Promise<ApiPortofolioPortofolio | null> =>
      getDetail( params.slug ),
  } )

  await queryClient.prefetchQuery( {
    queryKey : ['latest-portofolios', params.slug],
    queryFn  : (): Promise<ApiPortofolioPortofolio[] | null> =>
      getLatestPortofolios( params.slug ),
  } )

  const dehydratedState = dehydrate( queryClient )

  return (
    <main className="grow-[1] flex flex-col">
      <HydrationBoundary state={dehydratedState}>
        <Detail slug={params.slug} />
      </HydrationBoundary>
    </main>
  )
}
