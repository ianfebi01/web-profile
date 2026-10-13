import { after } from 'next/server'
import type { CollectionConfig } from 'payload'

import { getGenerationState, startGeneration } from '../lib/ai/generateArticle'
import { readLocalizedSlug, resolveLocales, revalidateContent } from '../lib/revalidate'

export const Articles: CollectionConfig = {
  slug  : 'articles',
  admin : {
    useAsTitle : 'title',
  },
  access : {
    read : () => true,
  },
  endpoints : [
    {
      // Called daily by .github/workflows/generate-article.yml
      // Auth: `Authorization: users API-Key <key>`; add `?force=true` to bypass the once-a-day guard.
      // Responds 202 right away and generates in the background; poll GET /generate/status.
      path    : '/generate',
      method  : 'post',
      handler : async ( req ) => {
        if ( !req.user ) {
          return Response.json( { error : 'Unauthorized' }, { status : 401 } )
        }

        const { state, run } = startGeneration( req.payload, { force : req.searchParams.get( 'force' ) === 'true' } )
        // after() keeps the request context, so the revalidation hooks still work
        if ( run ) after( run )

        return Response.json( state, { status : 202 } )
      },
    },
    {
      path    : '/generate/status',
      method  : 'get',
      handler : async ( req ) => {
        if ( !req.user ) {
          return Response.json( { error : 'Unauthorized' }, { status : 401 } )
        }

        return Response.json( getGenerationState() ?? { running : false } )
      },
    },
  ],
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
    {
      name         : 'aiGenerated',
      type         : 'checkbox',
      defaultValue : false,
      admin        : {
        position : 'sidebar',
        readOnly : true,
      },
    },
    // Skipping 'category' as product-category and mm-category were removed, 
    // unless you want a new generic 'Categories' collection later.
  ],
}
