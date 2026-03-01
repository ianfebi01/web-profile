import { Project } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@/app/payload.config'

export const getDetail = async (
  slug: string | number,
  locale: string = 'en'
): Promise<Project | null> => {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    locale: locale as 'en' | 'id',
    depth: 2,
  })
  if (res.docs.length === 0) return null
  return res.docs[0]
}

export const getAllPortfolioSlugs = async (): Promise<Project[] | null> => {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 1000,
  })
  if (res.docs.length === 0) return null
  return res.docs
}

export const getLatestPortofolios = async (
  currentSlug: string,
  locale: string = 'en'
): Promise<Project[] | null> => {
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
}
