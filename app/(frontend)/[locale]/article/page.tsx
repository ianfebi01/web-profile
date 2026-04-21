import Header from '@/components/Layouts/Header'
import NoDataFound from '@/components/NoDataFound'
import ArticleCard from '@/components/Cards/ArticleCard'
import { Props } from '@/types'
import { isPayloadReady } from '@/lib/is-payload-ready'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { Article } from '@/payload-types'

export async function generateMetadata( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale(locale)

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

export const getArticles = unstable_cache(
  async (locale: 'en' | 'id'): Promise<Article[] | null> => {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'articles',
      locale: locale as 'en' | 'id',
      sort: '-createdAt',
      depth: 2,
    })
    if (res.docs.length === 0) return null
    return res.docs
  },
  ['articles'],
  { tags: ['articles'] },
)

export default async function ArticlePage( props: Omit<Props, 'children'> ) {
  const { locale } = await props.params

  setRequestLocale(locale)

  const t = await getTranslations( { locale, namespace : 'article' } )

  const responseData = { docs: [] as any[] }

  if (isPayloadReady()) {
    const data = await getArticles(locale as 'en' | 'id')

    responseData.docs = data || []
  }

  return (
    <main>
      <section id="article"
        className="h-fit bg-dark"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20 sm:mt-20 flex flex-col gap-4">
          <Header text={t( 'title' )}
            link={'/'}
          />
          {responseData.docs?.length === 0
            ? <NoDataFound />
            : (
              <div className="mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 list-none">
                {responseData.docs.map( ( article ) => (
                  <ArticleCard key={article.id} data={article} />
                ) )}
              </div>
            )
          }
        </div>
      </section>
    </main>
  )
}

