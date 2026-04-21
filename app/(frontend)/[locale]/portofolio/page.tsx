import PortofolioListing from '@/components/Pages/Portofolio/Listing'
import { Props } from '@/types'
import { getTranslations, setRequestLocale } from 'next-intl/server'

export async function generateMetadata(props: Omit<Props, 'children'>) {
  const { locale } = await props.params

  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'portofolio' })

  const title = `${t('title')} | Ian Febi Sastrataruna`
  const desc = t('desc')

  return {
    title: title,
    description: desc,
    keywords: 'Frontend developer portofolio',

    openGraph: {
      title: title,
      description: desc,
      siteName: 'Ian Febi Sastrataruna',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      site: '@ianfebi01',
      title: title,
      description: desc || '',
    },
  }
}

export default async function PortofolioPage(props: Omit<Props, 'children'>) {
  const { locale } = await props.params

  setRequestLocale(locale)

  return <PortofolioListing />
}
