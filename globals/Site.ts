import type { GlobalConfig } from 'payload'

export const Site: GlobalConfig = {
  slug: 'site',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
        name: 'socialPlatformLinks',
        type: 'array',
        fields: [
            {
                name: 'platform',
                type: 'text',
                required: true,
            },
            {
                name: 'url',
                type: 'text',
                required: true,
            }
        ]
    }
  ],
}
