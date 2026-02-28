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

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Anyone can read published pages
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

