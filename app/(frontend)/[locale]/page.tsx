import { Metadata } from "next";
import { FALLBACK_SEO } from "@/utils/constants";
import { buildMetadata } from "@/lib/seo/metadata";
import JsonLd from "@/components/Seo/JsonLd";
import { graph, personSchema, webPageSchema, PERSON_ID } from "@/lib/seo/structured-data";
import { SITE_NAME } from "@/lib/seo/config";
import imageUrl from "@/utils/imageUrl";
import HeroesAndSections from "@/components/Parsers/HeroesAndSections";
import { Locale } from "next-intl";
import { getHomePage } from "@/utils/get-home-page";
import { locales } from "@/i18n/config";
import { isPayloadReady } from '@/lib/is-payload-ready'

type Props = {
  params: Promise<{
    locale: Locale;
  }>;
};

import { getPayload } from "payload";
import configPromise from "@payload-config";

export async function generateMetadata( props: Props ): Promise<Metadata> {
  const params = await props.params;
  const fallback = buildMetadata( {
    locale      : params.locale,
    paths       : '',
    title       : FALLBACK_SEO.title,
    description : FALLBACK_SEO.description,
    type        : 'profile',
  } )

  if ( !isPayloadReady() ) return fallback;

  const homeGlobal = await getHomePage( params.locale );

  if ( !homeGlobal || !homeGlobal.page ) return fallback;

  const payload = await getPayload( { config : configPromise } );
  const pageDoc =
    typeof homeGlobal.page === "object"
      ? homeGlobal.page
      : await payload.findByID( {
        collection     : "pages",
        id             : homeGlobal.page as string,
        locale         : params.locale as 'en' | 'id',
        fallbackLocale : false,
        depth          : 2,
      } );

  const metadata = ( pageDoc as any )?.meta;
  if ( !metadata ) return fallback;

  return buildMetadata( {
    locale      : params.locale,
    paths       : '',
    title       : metadata?.title || FALLBACK_SEO.title,
    description : metadata?.description || FALLBACK_SEO.description,
    keywords    : metadata?.keywords,
    image       : imageUrl( metadata?.image ),
    canonical   : metadata?.canonicalURL,
    type        : 'profile',
  } );
}

export function generateStaticParams() {
  // Without a database (e.g. the Docker build) the page would be prerendered empty and
  // that blank HTML served as the stale ISR copy on the first visit after a deploy.
  // Returning [] defers rendering to the first request instead.
  if ( !isPayloadReady() ) return [];

  return (
    locales?.map( ( locale ) => ( {
      locale : locale,
    } ) ) || []
  );
}

export const revalidate = 60; // ISR Support

export default async function PageHome( props: Props ) {
  if ( !isPayloadReady() ) return null;

  const params = await props.params;
  const homeGlobal = await getHomePage( params.locale );

  if ( !homeGlobal || !homeGlobal.page ) return null;

  const payload = await getPayload( { config : configPromise } );

  const pageDoc =
    typeof homeGlobal.page === "object"
      ? homeGlobal.page
      : await payload.findByID( {
        collection     : "pages",
        id             : homeGlobal.page as string,
        locale         : params.locale as 'en' | 'id',
        fallbackLocale : false,
        depth          : 2,
      } );

  // Fetch profile global for profile-banner blocks
  const profile = await payload.findGlobal( {
    slug   : "profile",
    locale : params.locale as 'en' | 'id',
    depth  : 2,
  } );

  // Inject profile data into any profile-banner blocks
  const bannerBlocks = ( ( pageDoc as any ).banner || [] ).map( ( block: any ) => {
    if ( block.blockType === 'banner-components.profile-banner' ) {
      return { ...block, ...profile }
    }
    
    return block
  } )

  const pageData = {
    banner : bannerBlocks,
    blocks : ( pageDoc as any ).blocks || [],
  };

  const jsonLd = graph(
    webPageSchema( {
      locale      : params.locale,
      path        : '',
      name        : ( pageDoc as any )?.meta?.title || SITE_NAME,
      description : ( pageDoc as any )?.meta?.description || profile?.bio || FALLBACK_SEO.description,
      type        : 'ProfilePage',
      extra       : { mainEntity : { '@id' : PERSON_ID } },
    } ),
    personSchema( {
      description : profile?.bio,
      image       : imageUrl( profile?.avatar as any ),
      sameAs      : ( profile?.socialPlatformLinks ?? [] ).map( ( link ) => link.url ).filter( ( url ) => /^https?:/.test( url ) ),
    } ),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroesAndSections page={pageData as any} />
    </>
  );
}
