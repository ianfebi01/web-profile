import Header from '@/components/Layouts/Header'
import NoDataFound from '@/components/NoDataFound'
import PortofoliosWrapper from '@/components/PortofoliosWrapper'
import { Props } from '@/types'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function generateMetadata( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale( locale )

  const t = await getTranslations( { locale, namespace : 'portofolio' } )

  const title = `${t( 'title' )} | Ian Febi Sastrataruna`
  const desc = t( 'desc' )

  return {
    title       : title,
    description : desc,
    keywords    : 'Frontend developer portofolio',

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

export default async function PortofolioPage( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  const t = await getTranslations( { locale, namespace : 'portofolio' } )

  const payload = await getPayload({ config: configPromise })
  const responseData = await payload.find({
    collection: 'projects',
    sort: '-createdAt',
    depth: 2,
  })

  return (
    <main>
      <section id="portofolio"
        className="h-fit bg-dark"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20 sm:mt-20 flex flex-col gap-4">
          <Header text={t( 'title' )}
            link={'/'}
          />
          {responseData.docs?.length === 0
            ? <NoDataFound />
            : <PortofoliosWrapper portofolios={responseData.docs} />
          }
        </div>
      </section>
    </main>
  )
}

