import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FunctionComponent } from 'react'
import Experience from '../Experience'
import NoDataFound from '../NoDataFound'

const FeaturedExperiences: FunctionComponent = async () => {
  const payload = await getPayload({ config: configPromise })
  const responseData = await payload.find({
    collection: 'experiences',
    limit: 100,
    sort: '-createdAt',
    depth: 1,
  })

  if (responseData.docs?.length === 0) return <NoDataFound />

  return <Experience data={responseData.docs} />
}

export default FeaturedExperiences
