import ArticleSearch from '@/components/Content/ArticleSearch'
import Header from '@/components/Layouts/Header'
import { Props } from '@/types'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

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
      siteName    : 'Ian Febi Sastrataruna', // Replace with your site name
      type        : 'website', // or "article"
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

  const t = await getTranslations( { locale, namespace : 'article' } )

  return (
    <main>
      <section id="article"
        className="h-fit bg-dark"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20 sm:mt-20 flex flex-col gap-4">
          <Header text={t( 'title' )}
            link={'/'}
          />
          <ArticleSearch />
        </div>
      </section>
    </main>
  )
}
