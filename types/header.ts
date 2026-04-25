import { Page, Site } from '@/payload-types'

export interface NavItemType {
  name?: string
  page?: Page | string | null
  newTab?: boolean
  url?: string
  pageAnchor?: string | null
  description?: string | null
}

export interface NavCategoryType {
  categoryName?: string
  navItem?: NavItemType | null
  navItems?: NavItemType[]
}

export type SocialLinksType = NonNullable<Site['socialPlatformLinks']>
