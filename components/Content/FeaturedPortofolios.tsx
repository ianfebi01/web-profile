import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Button2 from '../Buttons/Button2'
import { Link } from '@/i18n/navigation'
import NoDataFound from '../NoDataFound'
import { getLocale } from 'next-intl/server'
import PortofoliosWrapper from '../PortofoliosWrapper'

const FeaturedPortofolios = async () => {
  const locale = await getLocale()

  const payload = await getPayload({ config: configPromise })
  const responseData = await payload.find({
    collection: 'projects',
    locale: locale as 'en' | 'id',
    limit: 3,
    sort: '-createdAt',
    depth: 2
  })

  if ( responseData.docs?.length === 0 ) return <NoDataFound />

  return (
    <div className="flex flex-col gap-4">
      <PortofoliosWrapper
        portofolios={responseData?.docs}
      />
      <Link className="no-underline"
        href={'/portofolio'}
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

export default FeaturedPortofolios
