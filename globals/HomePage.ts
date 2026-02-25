import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Home',
    },
    {
        name: 'heroSection',
        type: 'group',
        fields: [
            {
                name: 'heading',
                type: 'text',
                required: true,
            },
            {
                name: 'subheading',
                type: 'textarea',
            },
            {
                name: 'backgroundImage',
                type: 'upload',
                relationTo: 'media'
            }
        ]
    }
  ],
}
