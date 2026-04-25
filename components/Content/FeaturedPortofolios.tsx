import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Link } from '@/i18n/navigation'
import NoDataFound from '../NoDataFound'
import { getLocale } from 'next-intl/server'
import PortofoliosWrapper from '../PortofoliosWrapper'
import Button from '../Buttons/Button'

const FeaturedPortofolios = async () => {
  const locale = await getLocale()

  const payload = await getPayload( { config : configPromise } )
  const responseData = await payload.find( {
    collection : 'projects',
    locale     : locale as 'en' | 'id',
    limit      : 3,
    sort       : '-createdAt',
    depth      : 2,
  } )

  if ( responseData.docs?.length === 0 ) return <NoDataFound />

  return (
    <div className="flex flex-col gap-4">
      <PortofoliosWrapper portofolios={responseData?.docs} />
      <Link className="no-underline"
        href={'/portofolio'}
      >
        <Button variant="secondary"
          className="w-fit"
        >
          Show more
        </Button>
      </Link>
    </div>
  )
}

export default FeaturedPortofolios
