import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { Article } from '@/payload-types'
import { notFound } from 'next/navigation'
import { useLocale } from 'next-intl'

/**
 *  Get Article Detail from Payload CMS
 */
export const useGetDetail = (
  slug: string | number,
  enabled: boolean = true
): UseQueryResult<Article> => {
  const locale = useLocale()

  const data = useQuery({
    queryKey: ['article', 'detail', slug, locale],
    queryFn: async () => {
      const res = await fetch(
        `/api/articles?where[slug][equals]=${slug}&depth=2&locale=${locale}`
      )
      if (!res.ok) return notFound()
      const json = await res.json()
      if (json.docs?.length === 0) return notFound()
      return json.docs[0]
    },
    enabled,
  })

  return data
}
