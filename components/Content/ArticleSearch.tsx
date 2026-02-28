import { getPayload } from 'payload'
import configPromise from '@payload-config'
import ArticleCard from '../Cards/ArticleCard'
import NoDataFound from '../NoDataFound'
import { Link } from '@/i18n/navigation'
import Button2 from '../Buttons/Button2'

const ArticleSearch = async () => {
  const payload = await getPayload({ config: configPromise })
  const responseData = await payload.find({
    collection: 'articles',
    limit: 3,
    sort: '-createdAt',
    depth: 2,
  })

  if ( responseData.docs?.length === 0 ) return <NoDataFound />

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 list-none">
        {responseData.docs.map( ( article ) => (
          <ArticleCard key={article.id} data={article} />
        ) )}
      </div>
      <Link className="no-underline"
        href={'/article'}
      >
        <Button2 variant="secondary"
          className="w-fit"
        >
          Show more
        </Button2>
      </Link>
    </div>
  )
}

export default ArticleSearch

