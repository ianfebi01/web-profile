import type { CollectionConfig } from 'payload'

import { generateArticle } from '../lib/ai/generateArticle'
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
      path    : '/generate',
      method  : 'post',
      handler : async ( req ) => {
        if ( !req.user ) {
          return Response.json( { error : 'Unauthorized' }, { status : 401 } )
        }

        try {
          const result = await generateArticle( req.payload, { force : req.searchParams.get( 'force' ) === 'true' } )

          return Response.json( result, { status : result.status === 'created' ? 201 : 200 } )
        } catch ( error ) {
          req.payload.logger.error( { err : error, msg : 'AI article generation failed' } )

          return Response.json( { error : error instanceof Error ? error.message : 'Generation failed' }, { status : 500 } )
        }
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
