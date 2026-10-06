import { getPageBySlug } from '@/utils/get-page-by-slug'
import HeroesAndSections from '@/components/Parsers/HeroesAndSections'
import { notFound } from 'next/navigation'
import { Page } from '@/payload-types'
import { getAllPageSlugs } from '@/lib/api/pagesQueryFn'
import imageUrl from '@/utils/imageUrl'
import { FALLBACK_SEO } from '@/utils/constants'
import { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/metadata'
import { getLocalizedSlugs, slugsToPaths } from '@/lib/seo/localized-slugs'
import JsonLd from '@/components/Seo/JsonLd'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/structured-data'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs() // Fetch slugs from Payload

  return (
    slugs?.map( ( slug: Page ) => ( {
      slug : slug.slug,
      // locale routing might need handling depending on next-intl implementation, defaulting to both
    } ) ).flatMap( s => [{ ...s, locale : 'en' }, { ...s, locale : 'id' }] ) || []
  )
}

export async function generateMetadata( props: Props ): Promise<Metadata> {
  const params = await props.params;
  const pages = await getPageBySlug( params.slug, params.locale )

  if ( pages.docs?.length === 0 ) return { title : FALLBACK_SEO.title, robots : { index : false } };
  const page = pages.docs[0];
  const metadata = ( page as any )?.meta; // payload-plugin-seo defaults to 'meta'
  const slugs = await getLocalizedSlugs( 'pages', page.id )

  return buildMetadata( {
    locale      : params.locale,
    paths       : slugsToPaths( slugs ),
    title       : metadata?.title || page?.title,
    description : metadata?.description || FALLBACK_SEO.description,
    keywords    : metadata?.keywords,
    image       : imageUrl( metadata?.image ),
    canonical   : metadata?.canonicalURL,
  } )
}

export const revalidate = 60; // ISR Support

export default async function PageRoute( props: Props ) {
  const params = await props.params;
  const pages = await getPageBySlug( params.slug || 'home-id', params.locale )
  if ( pages.docs?.length === 0 ) return notFound()

  const payloadPage = pages.docs[0]
  const payloadToStrapiFormat = {
    banner : ( payloadPage as any ).banner || [],
    blocks : payloadPage.blocks || []
  }

  const name = ( payloadPage as any )?.meta?.title || payloadPage.title
  const jsonLd = graph(
    webPageSchema( {
      locale      : params.locale,
      path        : `/${params.slug}`,
      name,
      description : ( payloadPage as any )?.meta?.description,
    } ),
    breadcrumbSchema( params.locale, [
      { name : 'Home', path : '' },
      { name : payloadPage.title, path : `/${params.slug}` },
    ] ),
  )

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroesAndSections page={payloadToStrapiFormat as any} />
    </>
  )
}
