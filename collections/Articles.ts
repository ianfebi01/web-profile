import type { CollectionConfig } from 'payload'

import { revalidateTag } from 'next/cache'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [({ doc }) => { 
      // @ts-expect-error Next.js 15 canary typing mismatch
      revalidateTag('articles'); 
      return doc; 
    }],
    afterDelete: [({ doc }) => { 
      // @ts-expect-error Next.js 15 canary typing mismatch
      revalidateTag('articles'); 
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
      name: 'introText',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'textarea',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    // Skipping 'category' as product-category and mm-category were removed, 
    // unless you want a new generic 'Categories' collection later.
  ],
}
