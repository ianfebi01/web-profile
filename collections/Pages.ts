import type { CollectionConfig } from 'payload'
import { 
  ProfileBanner,
  BannerStandard,
  BodyCopy, 
  TextLeftImageRight, 
  SimpleCards,
  SmallBanner,
  Divider,
  Accordian,
  Quote,
  FeaturedPortofolios,
  FeaturedExperiences,
  IconTexts,
  ArticleSearch,
  PortofolioSearch
} from '../blocks/ContentComponents'

import { revalidateTag } from 'next/cache'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Anyone can read published pages
  },
  hooks: {
    afterChange: [({ doc }) => { 
      // @ts-expect-error Next.js 15 canary typing mismatch
      revalidateTag('pages'); 
      return doc; 
    }],
    afterDelete: [({ doc }) => { 
      // @ts-expect-error Next.js 15 canary typing mismatch
      revalidateTag('pages'); 
      return doc; 
    }],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'banner',
      type: 'blocks',
      maxRows: 1,
      localized: true,
      blocks: [
        ProfileBanner,
        BannerStandard,
      ],
    },
    {
      name: 'blocks',
      type: 'blocks',
      localized: true,
      blocks: [
        BodyCopy, 
        TextLeftImageRight, 
        SimpleCards,
        SmallBanner,
        Divider,
        Accordian,
        Quote,
        FeaturedPortofolios,
        FeaturedExperiences,
        IconTexts,
        ArticleSearch,
        PortofolioSearch
      ],
    },
  ],
}

