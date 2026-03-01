import Detail from '@/components/Pages/Portofolio/Detail'
import {
  getAllPortfolioSlugs,
  getDetail,
  getLatestPortofolios,
} from '@/lib/api/portofolioQueryFn'
import { Project } from '@/payload-types'
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

  const data = await getDetail( params.slug, params.locale )

  const title = data?.title
  const desc = `Portfolio for project called ${data?.title}`
  const canonicalURL = `${process.env.NEXT_PUBLIC_BASE_URL}/${params.locale}/portofolio/${params.slug}`

  return {
    title,
    description : desc,
    openGraph   : {
      title,
      description : desc,
      url         : canonicalURL,
      siteName    : title,
      images      : data?.thumbnail
        ? [{ url : imageUrl( data.thumbnail, 'thumbnail' ) || '' }]
        : [],
      type        : 'article',
      authors     : ['Ian Febi Sastrataruna'],
    },
    twitter : {
      card        : 'summary',
      site        : '@ianfebi01',
      title,
      description : desc,
      images      : data?.thumbnail
        ? [{ url : imageUrl( data.thumbnail, 'thumbnail' ) || '' }]
        : [],
    },
  }
}

export async function generateStaticParams() {
  const projects = await getAllPortfolioSlugs()

  return (
    projects?.map( ( project: Project ) => ( {
      slug : project.slug,
    } ) ) || []
  )
}

export default async function PortofolioPage(
  props: {
    params: Promise<{ locale: string; slug: string }>
  }
) {
  const params = await props.params;

  const data = await getDetail( params.slug, params.locale )
  const latestPortofolios = await getLatestPortofolios( params.slug, params.locale )

  return (
    <main className="grow-[1] flex flex-col">
      <Detail data={data} latestPortofolios={latestPortofolios} />
    </main>
  )
}
