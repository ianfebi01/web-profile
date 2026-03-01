import { getPayload } from 'payload'
import configPromise from '@/app/payload.config'
import { Page } from '@/payload-types'

export const getAllPageSlugs = async (): Promise<Page[] | null> => {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'pages',
    depth: 1,
    limit: 1000,
  })

  if (res.docs.length === 0) return null
  return res.docs
}
