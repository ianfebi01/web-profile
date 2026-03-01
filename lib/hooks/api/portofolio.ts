import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { Project } from '@/payload-types'
import { useLocale } from 'next-intl'

/**
 *  Get Portfolio Detail from Payload CMS
 */
export const useGetDetail = (
  slug: string | number,
  enabled: boolean = true
): UseQueryResult<Project> => {
  const locale = useLocale()

  const data = useQuery({
    queryKey: ['portofolio', 'detail', slug, locale],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects?where[slug][equals]=${slug}&depth=2&locale=${locale}`
      )
      if (!res.ok) return null
      const json = await res.json()
      if (json.docs?.length === 0) return null
      return json.docs[0]
    },
    enabled,
  })

  return data
}

/**
 *  Get Latest Portfolios from Payload CMS
 */
export const useGetLatestPortofolios = (
  currentSlug: string,
  enabled: boolean = true
): UseQueryResult<Project[]> => {
  const locale = useLocale()

  const data = useQuery({
    queryKey: ['latest-portofolios', currentSlug, locale],
    queryFn: async () => {
      const res = await fetch(
        `/api/projects?where[slug][not_equals]=${currentSlug}&depth=2&limit=4&sort=createdAt&locale=${locale}`
      )
      if (!res.ok) return null
      const json = await res.json()
      if (json.docs?.length === 0) return null
      return json.docs
    },
    enabled,
  })

  return data
}
