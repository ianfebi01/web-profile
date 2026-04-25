import type { GlobalConfig } from "payload";
import { resolveLocales, revalidateContent } from '../lib/revalidate'

export const HomePage: GlobalConfig = {
  slug   : "home-page",
  access : {
    read : () => true,
  },
  hooks : {
    afterChange : [( { doc, req } ) => {
      const locales = resolveLocales( req?.locale )
      const paths = locales.map( ( locale ) => `/${locale}` )

      revalidateContent( { tags : ['home-page', 'pages'], locales, paths } )
      
      return doc
    }],
  },
  fields : [
    {
      name         : "title",
      type         : "text",
      required     : true,
      defaultValue : "Home",
      localized    : true,
    },
    {
      name       : "page",
      type       : "relationship",
      relationTo : "pages",
      required   : true,
      admin      : {
        description : "Select the Page document to render as the homepage.",
      },
    },
  ],
};
