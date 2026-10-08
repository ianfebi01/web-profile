import type { CollectionConfig, CollectionSlug, PayloadRequest } from 'payload'
import { convertLexicalToMarkdown, convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

import { readLocalizedSlug, resolveLocales, revalidateContent } from '../lib/revalidate'

type LexicalNode = {
  type?: string
  relationTo?: string
  value?: unknown
  children?: LexicalNode[]
  [k: string]: unknown
}

// Upload nodes only hold the media ID when the markdown is generated, which the
// converter exports as a `![media:id]()` placeholder. Load those docs so it can
// output real `![alt](url)` images instead.
const populateUploadNodes = async <T extends { root: unknown }>( data: T, req: PayloadRequest ): Promise<T> => {
  const uploads: LexicalNode[] = []
  const walk = ( node: LexicalNode ) => {
    if ( node.type === 'upload' && node.relationTo && ( typeof node.value === 'string' || typeof node.value === 'number' ) ) {
      uploads.push( node )
    }
    node.children?.forEach( walk )
  }
  walk( data.root as LexicalNode )

  if ( !uploads.length ) return data

  const idsByCollection = new Map<string, Set<string | number>>()
  uploads.forEach( ( node ) => {
    const ids = idsByCollection.get( node.relationTo! ) ?? new Set()
    ids.add( node.value as string | number )
    idsByCollection.set( node.relationTo!, ids )
  } )

  const docs = new Map<string, unknown>()
  await Promise.all( [...idsByCollection].map( async ( [collection, ids] ) => {
    const { docs: found } = await req.payload.find( {
      collection : collection as CollectionSlug,
      where      : { id : { in : [...ids] } },
      depth      : 0,
      pagination : false,
      req,
    } )
    found.forEach( ( doc ) => docs.set( `${collection}:${doc.id}`, doc ) )
  } ) )

  uploads.forEach( ( node ) => {
    const doc = docs.get( `${node.relationTo}:${node.value}` )
    if ( doc ) node.value = doc
  } )

  return data
}

export const Projects: CollectionConfig = {
  slug  : 'projects',
  admin : {
    useAsTitle : 'title',
  },
  auth : {
    useAPIKey : {
      reveal : true, 
    },
  },
  access : {
    read : () => true,
  },
  hooks : {
    beforeValidate : [async ( { data, req } ) => {
      // Replace `content` with the pasted markdown (if any), so it is validated and saved as Lexical JSON
      const markdown = typeof data?.markdownImport === 'string' ? data.markdownImport.trim() : ''

      if ( data && markdown ) {
        data.content = convertMarkdownToLexical( {
          markdown,
          editorConfig : await editorConfigFactory.default( { config : req.payload.config } ),
        } )
      }
      if ( data ) delete data.markdownImport

      return data
    }],
    afterChange : [( { doc, req } ) => {
      const locales = resolveLocales( req?.locale )
      const paths = locales.flatMap( ( locale ) => {
        const slug = readLocalizedSlug( doc?.slug, locale )
        
        return slug
          ? [`/${locale}/portofolio`, `/${locale}/portofolio/${slug}`]
          : [`/${locale}/portofolio`]
      } )

      revalidateContent( { tags : ['projects'], locales, paths } )
      
      return doc
    }],
    afterDelete : [( { doc, req } ) => {
      const locales = resolveLocales( req?.locale )
      const paths = locales.flatMap( ( locale ) => {
        const slug = readLocalizedSlug( doc?.slug, locale )
        
        return slug
          ? [`/${locale}/portofolio`, `/${locale}/portofolio/${slug}`]
          : [`/${locale}/portofolio`]
      } )

      revalidateContent( { tags : ['projects'], locales, paths } )
      
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
      name      : 'description',
      type      : 'textarea',
      localized : true,
    },
    {
      name      : 'content',
      type      : 'richText',
      localized : true,
    },
    {
      // Paste markdown here and save: it replaces `content` (see the beforeValidate hook)
      name    : 'markdownImport',
      label   : 'Import markdown',
      type    : 'textarea',
      virtual : true,
      admin   : {
        // Virtual fields default to read-only in the admin
        readOnly    : false,
        description : 'Paste markdown and save to replace the content above. This field is cleared after saving.',
      },
    },
    {
      // Read-only markdown version of `content`, generated on read so the frontend
      // can keep rendering it with the existing markdown parser.
      name    : 'contentMarkdown',
      type    : 'textarea',
      virtual : true,
      admin   : {
        hidden : true,
      },
      hooks : {
        afterRead : [async ( { siblingData, req } ) => {
          const data = siblingData?.content

          if ( !data || typeof data !== 'object' ) return ''

          return convertLexicalToMarkdown( {
            // Clone so populating uploads doesn't change the `content` returned to the client
            data         : await populateUploadNodes( structuredClone( data ), req ),
            editorConfig : await editorConfigFactory.default( { config : req.payload.config } ),
          } )
        }],
        beforeChange : [( { siblingData } ) => {
          // Never persist the generated markdown
          delete siblingData.contentMarkdown

          return null
        }],
      },
    },
    {
      name       : 'thumbnail',
      type       : 'upload',
      relationTo : 'media',
    },
    {
      name   : 'gallery',
      type   : 'array',
      fields : [
        {
          name       : 'image',
          type       : 'upload',
          relationTo : 'media',
        },
      ],
    },
    {
      name : 'url',
      type : 'text',
    },
    {
      name       : 'skills',
      type       : 'relationship',
      relationTo : 'skills',
      hasMany    : true,
    },
  ],
}
