import type { CollectionConfig } from 'payload'
import { 
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
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'blocks',
      type: 'blocks',
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
