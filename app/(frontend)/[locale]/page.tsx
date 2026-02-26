import { Metadata } from 'next'
import { FALLBACK_SEO } from '@/utils/constants'
import imageUrl from '@/utils/imageUrl'
import HeroesAndSections from '@/components/Parsers/HeroesAndSections'
import { Locale } from 'next-intl'
import { getHomePage } from '@/utils/get-home-page'
import { locales } from '@/i18n/config'

type Props = {
  params: Promise<{
    locale: Locale
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const page = await getHomePage( params.locale )

  const metadata = (page as any)?.meta;
  if ( !metadata ) return FALLBACK_SEO

  const canonicalURL = metadata?.canonicalURL || `${process.env.NEXT_PUBLIC_BASE_URL}/${params.locale}`;

  return {
    title       : metadata?.title || FALLBACK_SEO.title,
    description : metadata?.description || FALLBACK_SEO.description,
    keywords    : metadata?.keywords,
    openGraph   : {
      url         : canonicalURL,
      title       : metadata?.title || FALLBACK_SEO.title,
      description : metadata?.description || FALLBACK_SEO.description,
      siteName    : 'Ian Febi Sastrataruna', // Replace with your site name
      type        : 'website',
      images      : [
        {
          url : metadata?.image?.url ? imageUrl( metadata?.image?.url as any, 'thumbnail' ) || '' : '',
        },
      ],
    },
    twitter : {
      card        : 'summary',
      site        : '@ianfebi01',
      title       : metadata?.title || FALLBACK_SEO.title,
      description : metadata?.description || FALLBACK_SEO.description,
      images      : [
        {
          url : metadata?.image?.url ? imageUrl( metadata?.image?.url as any, 'thumbnail' ) || '' : '',
        },
      ],
    },
  }
}

export  function generateStaticParams() {
  
  return (
    locales?.map( ( locale ) => ( {
      locale : locale
    } ) ) || []
  )
}

export const revalidate = 60; // ISR Support

export default async function PageHome(props: Props) {
  const params = await props.params;
  const page = await getHomePage( params.locale )

  if ( !page ) return null

  // Passing the payload global "page" down. We mock the Strapi shape slightly to prevent full rewrite of HeroesAndSections right now, or just pass it directly.
  const payloadToStrapiFormat = {
    banner: [page.heroSection],
    content: []
  }

  return (
    <HeroesAndSections page={payloadToStrapiFormat as any} />
  )
}
