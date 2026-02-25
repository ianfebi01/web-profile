import type { CollectionConfig } from 'payload'

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
        // We will define specific blocks (like Strapi's Dynamic Zone components) here later.
        // For now, a simple RichText block to get started:
        {
          slug: 'richText',
          fields: [
            {
              name: 'content',
              type: 'richText',
            },
          ],
        },
      ],
    },
  ],
}
