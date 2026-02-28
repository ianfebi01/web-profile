import type { GlobalConfig } from 'payload'

export const Profile: GlobalConfig = {
  slug: 'profile',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'socialPlatformLinks',
      type: 'array',
      localized: true,
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
        },
      ],
    },
  ],
}
