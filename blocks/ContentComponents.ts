import { Block } from 'payload'

const svgURI = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="400" fill="#f1f5f9"/>${svg}</svg>`)}`

const ButtonFields = [
  { name: 'name', type: 'text' },
  { name: 'url', type: 'text' },
  { name: 'newTab', type: 'checkbox', defaultValue: false },
  { name: 'style', type: 'select', options: ['primary', 'secondary', 'transparent'], defaultValue: 'primary' },
]

export const ProfileBanner: Block = {
  slug: 'banner-components.profile-banner',
  interfaceName: 'ProfileBannerBlock',
  labels: { singular: 'Profile Banner', plural: 'Profile Banners' },
  imageURL: svgURI('<circle cx="300" cy="120" r="50" fill="#e2e8f0"/><rect x="200" y="190" width="200" height="20" rx="10" fill="#94a3b8"/><rect x="150" y="230" width="300" height="15" rx="7" fill="#cbd5e1"/>'),
  imageAltText: 'Profile Banner',
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } }
  ],
}

export const BannerStandard: Block = {
  slug: 'banner-components.banner-standard',
  interfaceName: 'BannerStandardBlock',
  labels: { singular: 'Banner Standard', plural: 'Banner Standards' },
  imageURL: svgURI('<rect x="0" y="0" width="600" height="400" fill="#334155"/><rect x="50" y="120" width="350" height="30" rx="10" fill="#e2e8f0"/><rect x="50" y="170" width="280" height="20" rx="10" fill="#94a3b8"/><rect x="50" y="220" width="120" height="40" rx="20" fill="#3b82f6"/>'),
  imageAltText: 'Banner Standard',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'background', type: 'upload', relationTo: 'media' },
    { name: 'buttons', type: 'array', fields: ButtonFields as any },
  ],
}

export const BodyCopy: Block = {
  slug: 'content-components.body-copy',
  interfaceName: 'BodyCopyBlock',
  labels: { singular: 'Body Copy', plural: 'Body Copies' },
  imageURL: svgURI('<rect x="100" y="100" width="400" height="20" rx="10" fill="#94a3b8"/><rect x="100" y="150" width="350" height="20" rx="10" fill="#cbd5e1"/><rect x="100" y="200" width="380" height="20" rx="10" fill="#cbd5e1"/><rect x="100" y="250" width="200" height="20" rx="10" fill="#cbd5e1"/>'),
  imageAltText: 'Body Copy',
  fields: [ { name: 'content', type: 'textarea' } ],
}

export const TextLeftImageRight: Block = {
  slug: 'content-components.text-left-image-right',
  interfaceName: 'TextLeftImageRightBlock',
  labels: { singular: 'Text Left Image Right', plural: 'Text Left Image Right' },
  imageURL: svgURI('<rect x="50" y="100" width="200" height="20" rx="10" fill="#94a3b8"/><rect x="50" y="150" width="180" height="20" rx="10" fill="#cbd5e1"/><rect x="50" y="200" width="150" height="20" rx="10" fill="#cbd5e1"/><rect x="300" y="50" width="250" height="300" rx="20" fill="#e2e8f0"/>'),
  imageAltText: 'Text Left Image Right',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'fullWidthBgImage', type: 'checkbox', defaultValue: false },
    { name: 'reverse', type: 'checkbox', defaultValue: false },
    { name: 'fullWidth', type: 'checkbox', defaultValue: false, required: true },
    { name: 'bodyCopy', type: 'textarea' },
    { name: 'biggerColumn', type: 'select', options: [{ label: 'Image', value: 'image' }, { label: 'Content', value: 'content' }] },
    { name: 'scaling', type: 'select', options: [{ label: 'Contain', value: 'contain' }, { label: 'Cover', value: 'cover' }], defaultValue: 'cover' },
    { name: 'buttons', type: 'array', fields: ButtonFields as any },
  ],
}

export const SimpleCards: Block = {
  slug: 'content-components.simple-cards',
  interfaceName: 'SimpleCardsBlock',
  labels: { singular: 'Simple Cards', plural: 'Simple Cards' },
  imageURL: svgURI('<rect x="50" y="125" width="140" height="150" rx="15" fill="#e2e8f0"/><rect x="230" y="125" width="140" height="150" rx="15" fill="#e2e8f0"/><rect x="410" y="125" width="140" height="150" rx="15" fill="#e2e8f0"/>'),
  imageAltText: 'Simple Cards',
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'cards',
      type: 'array',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

export const SmallBanner: Block = {
  slug: 'content-components.small-banner',
  interfaceName: 'SmallBannerBlock',
  labels: { singular: 'Small Banner', plural: 'Small Banners' },
  imageURL: svgURI('<rect x="0" y="100" width="600" height="200" fill="#e2e8f0"/><rect x="200" y="180" width="200" height="40" rx="20" fill="#94a3b8"/>'),
  imageAltText: 'Small Banner',
  fields: [
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    { name: 'buttons', type: 'array', fields: ButtonFields as any },
  ],
}

export const Divider: Block = {
  slug: 'content-components.divider',
  interfaceName: 'DividerBlock',
  labels: { singular: 'Divider', plural: 'Dividers' },
  imageURL: svgURI('<line x1="100" y1="200" x2="500" y2="200" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>'),
  imageAltText: 'Divider',
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } }
  ],
}

export const Accordian: Block = {
  slug: 'content-components.accordian',
  interfaceName: 'AccordianBlock',
  labels: { singular: 'Accordion', plural: 'Accordions' },
  imageURL: svgURI('<rect x="100" y="80" width="400" height="40" rx="8" fill="#e2e8f0"/><rect x="100" y="140" width="400" height="40" rx="8" fill="#e2e8f0"/><rect x="100" y="200" width="400" height="40" rx="8" fill="#e2e8f0"/><rect x="100" y="260" width="400" height="40" rx="8" fill="#e2e8f0"/>'),
  imageAltText: 'Accordion',
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'content', type: 'textarea', required: true },
      ],
    },
  ],
}

export const Quote: Block = {
  slug: 'content-components.quote',
  interfaceName: 'QuoteBlock',
  labels: { singular: 'Quote', plural: 'Quotes' },
  imageURL: svgURI('<text x="300" y="280" font-size="160" font-family="serif" fill="#cbd5e1" text-anchor="middle" font-weight="bold">"</text>'),
  imageAltText: 'Quote',
  fields: [
    { name: 'quote', type: 'text', required: true },
  ],
}

export const FeaturedPortofolios: Block = {
  slug: 'content-components.featured-portofolios',
  interfaceName: 'FeaturedPortofoliosBlock',
  labels: { singular: 'Featured Portfolios', plural: 'Featured Portfolios' },
  imageURL: svgURI('<rect x="100" y="50" width="180" height="130" rx="15" fill="#e2e8f0"/><rect x="320" y="50" width="180" height="130" rx="15" fill="#e2e8f0"/><rect x="100" y="220" width="180" height="130" rx="15" fill="#e2e8f0"/><rect x="320" y="220" width="180" height="130" rx="15" fill="#e2e8f0"/>'),
  imageAltText: 'Featured Portfolios',
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } }
  ],
}

export const FeaturedExperiences: Block = {
  slug: 'content-components.featured-experiences',
  interfaceName: 'FeaturedExperiencesBlock',
  labels: { singular: 'Featured Experiences', plural: 'Featured Experiences' },
  imageURL: svgURI('<circle cx="150" cy="100" r="15" fill="#94a3b8"/><line x1="150" y1="115" x2="150" y2="185" stroke="#cbd5e1" stroke-width="4"/><circle cx="150" cy="200" r="15" fill="#94a3b8"/><line x1="150" y1="215" x2="150" y2="285" stroke="#cbd5e1" stroke-width="4"/><circle cx="150" cy="300" r="15" fill="#94a3b8"/><rect x="200" y="90" width="250" height="20" rx="10" fill="#e2e8f0"/><rect x="200" y="190" width="250" height="20" rx="10" fill="#e2e8f0"/><rect x="200" y="290" width="250" height="20" rx="10" fill="#e2e8f0"/>'),
  imageAltText: 'Featured Experiences',
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } }
  ],
}

export const IconTexts: Block = {
  slug: 'content-components.icon-texts',
  interfaceName: 'IconTextsBlock',
  labels: { singular: 'Icon Texts', plural: 'Icon Texts' },
  imageURL: svgURI('<circle cx="150" cy="150" r="40" fill="#e2e8f0"/><rect x="220" y="130" width="250" height="15" rx="7" fill="#94a3b8"/><rect x="220" y="160" width="180" height="15" rx="7" fill="#cbd5e1"/><circle cx="150" cy="270" r="40" fill="#e2e8f0"/><rect x="220" y="250" width="250" height="15" rx="7" fill="#94a3b8"/><rect x="220" y="280" width="180" height="15" rx="7" fill="#cbd5e1"/>'),
  imageAltText: 'Icon Texts',
  fields: [
    {
      name: 'icons',
      type: 'array',
      required: true,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'bodyCopy', type: 'textarea' },
        { name: 'link', type: 'text' },
        { name: 'linkNewTab', type: 'checkbox' }
      ],
    },
  ],
}

export const ArticleSearch: Block = {
  slug: 'content-components.article-search',
  interfaceName: 'ArticleSearchBlock',
  labels: { singular: 'Article Search', plural: 'Article Search' },
  imageURL: svgURI('<rect x="100" y="80" width="400" height="50" rx="25" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="4"/><circle cx="460" cy="105" r="12" stroke="#94a3b8" stroke-width="4" fill="none"/><line x1="468" y1="113" x2="478" y2="123" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/><rect x="100" y="180" width="400" height="80" rx="10" fill="#e2e8f0" stroke="#e2e8f0" stroke-width="4"/><rect x="100" y="280" width="400" height="80" rx="10" fill="#e2e8f0" stroke="#e2e8f0" stroke-width="4"/>'),
  imageAltText: 'Article Search',
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } }
  ],
}

export const PortofolioSearch: Block = {
  slug: 'content-components.portofolio-search',
  interfaceName: 'PortofolioSearchBlock',
  labels: { singular: 'Portfolio Search', plural: 'Portfolio Search' },
  imageURL: svgURI('<rect x="100" y="80" width="400" height="50" rx="25" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="4"/><circle cx="460" cy="105" r="12" stroke="#94a3b8" stroke-width="4" fill="none"/><line x1="468" y1="113" x2="478" y2="123" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/><rect x="100" y="180" width="180" height="120" rx="10" fill="#e2e8f0"/><rect x="320" y="180" width="180" height="120" rx="10" fill="#e2e8f0"/>'),
  imageAltText: 'Portfolio Search',
  fields: [
    { name: 'title', type: 'text', admin: { hidden: true } }
  ],
}
