import type { GlobalConfig } from 'payload'

export const MainMenu: GlobalConfig = {
  slug: 'main-menu',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      localized: true,
      fields: [
        {
          name: 'categoryName',
          type: 'text',
        },
        {
          name: 'navItem',
          type: 'group',
          fields: [
            {
              name: 'name',
              type: 'text',
            },
            {
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
            },
            {
              name: 'newTab',
              type: 'checkbox',
            },
            {
              name: 'url',
              type: 'text',
            },
            {
              name: 'pageAnchor',
              type: 'text',
            },
            {
              name: 'description',
              type: 'text',
            },
          ]
        },
        {
          name: 'navItems',
          type: 'array',
          fields: [
            {
                name: 'name',
                type: 'text',
            },
            {
                name: 'page',
                type: 'relationship',
                relationTo: 'pages',
            },
            {
                name: 'newTab',
                type: 'checkbox',
            },
            {
                name: 'url',
                type: 'text',
            },
            {
                name: 'pageAnchor',
                type: 'text',
            },
            {
                name: 'description',
                type: 'text',
            }
          ]
        }
      ],
    },
  ],
}
