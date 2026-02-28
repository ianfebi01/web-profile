import { getPageBySlug } from '@/utils/get-page-by-slug'
import HeroesAndSections from '@/components/Parsers/HeroesAndSections'
import { notFound } from 'next/navigation'
import { ApiPagePage } from '@/types/generated/contentTypes'
import { getAllPageSlugs } from '@/lib/api/pagesQueryFn'
import imageUrl from '@/utils/imageUrl'
import { FALLBACK_SEO } from '@/utils/constants'
import { Metadata } from 'next'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs() // Fetch slugs from Strapi

  return (
    slugs?.map( ( slug: ApiPagePage ) => ( {
      slug   : slug.attributes.slug,
      locale : slug.attributes.locale,
    } ) ) || []
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const pages = await getPageBySlug( params.slug, params.locale )

  if (pages.docs?.length === 0) return FALLBACK_SEO;
  const page = pages.docs[0];
  const metadata = (page as any)?.meta; // payload-plugin-seo defaults to 'meta'

  const canonicalURL = metadata?.canonicalURL || `${process.env.NEXT_PUBLIC_BASE_URL}/${params.locale}/${params.slug}`;

  return {
    title :
      metadata?.title ||
      page?.title ||
      FALLBACK_SEO.title ||
      null,
    description : metadata?.description || FALLBACK_SEO.description || null,
    keywords    : metadata?.keywords || null,
    openGraph   : {
      url         : canonicalURL || null,
      title       : metadata?.title || page?.title || null,
      description : metadata?.description || null,
      siteName    : 'Ian Febi Sastrataruna', // Replace with your site name
      type        : 'website', // or "article"
      images      : metadata?.image?.url
        ? [{ url : imageUrl( metadata?.image?.url as any, 'medium' ) || '' }]
        : [], // Add Open Graph image
    },
    twitter : {
      card  : 'summary',
      site  : '@ianfebi01',
      title : metadata?.title || page?.title || FALLBACK_SEO.title || null,
      description : metadata?.description || FALLBACK_SEO.description || '',
      images : metadata?.image?.url
        ? [{ url : imageUrl( metadata?.image?.url as any, 'medium' ) || '' }]
        : [], // Twitter image
    },
  }
}

export const revalidate = 60; // ISR Support

export default async function PageRoute(props: Props) {
  const params = await props.params;
  const pages = await getPageBySlug( params.slug || 'home-id', params.locale )
  if ( pages.docs?.length === 0 ) return notFound()

  const payloadPage = pages.docs[0]
  const payloadToStrapiFormat = {
    banner: (payloadPage as any).banner || [],
    content: payloadPage.blocks || []
  }

  return <HeroesAndSections page={payloadToStrapiFormat as any} />
}
