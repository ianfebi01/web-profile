import PortofolioListing from '@/components/Pages/Portofolio/Listing'
import { Props } from '@/types'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/seo/metadata'
import JsonLd from '@/components/Seo/JsonLd'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/structured-data'

export const dynamic = 'force-dynamic'

export async function generateMetadata( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale( locale )

  const t = await getTranslations( { locale, namespace : 'portofolio' } )

  return buildMetadata( {
    locale,
    paths       : '/portofolio',
    title       : t( 'title' ),
    description : t( 'desc' ),
    keywords    : 'Frontend developer portofolio',
  } )
}

export default async function PortofolioPage( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale( locale )

  const t = await getTranslations( { locale, namespace : 'portofolio' } )
  const jsonLd = graph(
    webPageSchema( {
      locale,
      path        : '/portofolio',
      name        : t( 'title' ),
      description : t( 'desc' ),
      type        : 'CollectionPage',
    } ),
    breadcrumbSchema( locale, [
      { name : 'Home', path : '' },
      { name : t( 'title' ), path : '/portofolio' },
    ] ),
  )

  return (
    <>
      <JsonLd data={jsonLd} />
      <PortofolioListing />
    </>
  )
}
