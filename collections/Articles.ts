import type { CollectionConfig } from 'payload'

import { readLocalizedSlug, resolveLocales, revalidateContent } from '../lib/revalidate'

export const Articles: CollectionConfig = {
  slug  : 'articles',
  admin : {
    useAsTitle : 'title',
  },
  access : {
    read : () => true,
  },
  hooks : {
    afterChange : [( { doc, req } ) => {
      const locales = resolveLocales( req?.locale )
      const paths = locales.flatMap( ( locale ) => {
        const slug = readLocalizedSlug( doc?.slug, locale )
        
        return slug ? [`/${locale}/article`, `/${locale}/article/${slug}`] : [`/${locale}/article`]
      } )

      revalidateContent( { tags : ['articles'], locales, paths } )
      
      return doc
    }],
    afterDelete : [( { doc, req } ) => {
      const locales = resolveLocales( req?.locale )
      const paths = locales.flatMap( ( locale ) => {
        const slug = readLocalizedSlug( doc?.slug, locale )
        
        return slug ? [`/${locale}/article`, `/${locale}/article/${slug}`] : [`/${locale}/article`]
      } )

      revalidateContent( { tags : ['articles'], locales, paths } )
      
      return doc
    }],
  },
  fields : [
    {
      name      : 'title',
      type      : 'text',
      required  : true,
      localized : true,
    },
    {
      name      : 'slug',
      type      : 'text',
      required  : true,
      unique    : true,
      localized : true,
      admin     : {
        position : 'sidebar',
      },
    },
    {
      name      : 'introText',
      type      : 'textarea',
      localized : true,
    },
    {
      name      : 'content',
      type      : 'textarea',
      localized : true,
    },
    {
      name       : 'heroImage',
      type       : 'upload',
      relationTo : 'media',
      localized  : true,
    },
    {
      name       : 'tags',
      type       : 'relationship',
      relationTo : 'tags',
      hasMany    : true,
      localized  : true,
    },
    // Skipping 'category' as product-category and mm-category were removed, 
    // unless you want a new generic 'Categories' collection later.
  ],
}
