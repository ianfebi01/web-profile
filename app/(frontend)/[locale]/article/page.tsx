import ArticleListing from '@/components/Pages/Article/Listing'
import { Props } from '@/types'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale( locale )

  const t = await getTranslations( { locale, namespace : 'article' } )

  const title = `${t( 'title' )} | Ian Febi Sastrataruna`
  const desc = t( 'desc' )

  return {
    title       : title,
    description : desc,
    keywords    : 'article',

    openGraph : {
      title       : title,
      description : desc,
      siteName    : 'Ian Febi Sastrataruna',
      type        : 'website',
    },
    twitter : {
      card        : 'summary',
      site        : '@ianfebi01',
      title       : title,
      description : desc || '',
    },
  }
}

export default async function ArticlePage( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale( locale )

  return <ArticleListing />
}
