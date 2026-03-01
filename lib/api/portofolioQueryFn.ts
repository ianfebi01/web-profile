import { Project } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@/app/payload.config'
import { unstable_cache } from 'next/cache'

export const getDetail = unstable_cache(
  async (slug: string | number, locale: string = 'en'): Promise<Project | null> => {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'projects',
      where: { slug: { equals: slug } },
      locale: locale as 'en' | 'id',
      depth: 2,
    })
    if (res.docs.length === 0) return null
    return res.docs[0]
  },
  ['project-detail'],
  { tags: ['projects'] }
)

export const getAllPortfolioSlugs = unstable_cache(
  async (): Promise<Project[] | null> => {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: 1000,
    })
    if (res.docs.length === 0) return null
    return res.docs
  },
  ['all-project-slugs'],
  { tags: ['projects'] }
)

export const getLatestPortofolios = unstable_cache(
  async (currentSlug: string, locale: string = 'en'): Promise<Project[] | null> => {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'projects',
      where: { slug: { not_equals: currentSlug } },
      locale: locale as 'en' | 'id',
      depth: 2,
      limit: 4,
      sort: 'createdAt',
    })
    if (res.docs.length === 0) return null
    return res.docs
  },
  ['latest-projects'],
  { tags: ['projects'] }
)
