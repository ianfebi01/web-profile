import { Article } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@/app/payload.config'
import { notFound } from 'next/navigation'

export const getDetail = async (
  slug: string | number,
  locale: string = 'en'
): Promise<Article | null> => {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    locale: locale as 'en' | 'id',
    depth: 2,
  })
  if (res.docs.length === 0) return notFound()
  return res.docs[0]
}

export const getAllArticleSlugs = async (): Promise<Article[] | null> => {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'articles',
    depth: 1,
    limit: 1000,
  })
  if (res.docs.length === 0) return null
  return res.docs
}
