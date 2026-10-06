import ArticleListing from '@/components/Pages/Article/Listing'
import { Props } from '@/types'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/seo/metadata'
import JsonLd from '@/components/Seo/JsonLd'
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/seo/structured-data'

export const dynamic = 'force-dynamic'

export async function generateMetadata( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale( locale )

  const t = await getTranslations( { locale, namespace : 'article' } )

  return buildMetadata( {
    locale,
    paths       : '/article',
    title       : t( 'title' ),
    description : t( 'desc' ),
    keywords    : 'article',
  } )
}

export default async function ArticlePage( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale( locale )

  const t = await getTranslations( { locale, namespace : 'article' } )
  const jsonLd = graph(
    webPageSchema( {
      locale,
      path        : '/article',
      name        : t( 'title' ),
      description : t( 'desc' ),
      type        : 'CollectionPage',
    } ),
    breadcrumbSchema( locale, [
      { name : 'Home', path : '' },
      { name : t( 'title' ), path : '/article' },
    ] ),
  )

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArticleListing />
    </>
  )
}
