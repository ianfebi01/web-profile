import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FunctionComponent } from 'react'
import Experience from '../Experience'
import NoDataFound from '../NoDataFound'
import { getLocale } from 'next-intl/server'

const FeaturedExperiences: FunctionComponent = async () => {
  const locale = await getLocale()
  const payload = await getPayload({ config: configPromise })
  const responseData = await payload.find({
    collection: 'experiences',
    locale: locale as 'en' | 'id',
    limit: 100,
    sort: '-createdAt',
    depth: 1,
  })

  if (responseData.docs?.length === 0) return <NoDataFound />

  return <Experience data={responseData.docs} />
}

export default FeaturedExperiences
