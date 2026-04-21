import type { CollectionConfig } from 'payload'

import { readLocalizedSlug, resolveLocales, revalidateContent } from '../lib/revalidate'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [({ doc, req }) => {
      const locales = resolveLocales(req?.locale)
      const paths = locales.flatMap((locale) => {
        const slug = readLocalizedSlug(doc?.slug, locale)
        return slug
          ? [`/${locale}/portofolio`, `/${locale}/portofolio/${slug}`]
          : [`/${locale}/portofolio`]
      })

      revalidateContent({ tags: ['projects'], locales, paths })
      return doc
    }],
    afterDelete: [({ doc, req }) => {
      const locales = resolveLocales(req?.locale)
      const paths = locales.flatMap((locale) => {
        const slug = readLocalizedSlug(doc?.slug, locale)
        return slug
          ? [`/${locale}/portofolio`, `/${locale}/portofolio/${slug}`]
          : [`/${locale}/portofolio`]
      })

      revalidateContent({ tags: ['projects'], locales, paths })
      return doc
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
        name: 'description',
        type: 'textarea',
        localized: true,
    },
    {
        name: 'content',
        type: 'textarea',
        localized: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
        name: 'url',
        type: 'text',
    },
    {
      name: 'skills',
      type: 'relationship',
      relationTo: 'skills',
      hasMany: true,
    },
  ],
}
