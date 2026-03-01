import type { CollectionConfig } from 'payload'

import { revalidateTag } from 'next/cache'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [({ doc }) => { 
      // @ts-expect-error Next.js 15 canary typing mismatch
      revalidateTag('projects'); 
      return doc; 
    }],
    afterDelete: [({ doc }) => { 
      // @ts-expect-error Next.js 15 canary typing mismatch
      revalidateTag('projects'); 
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
