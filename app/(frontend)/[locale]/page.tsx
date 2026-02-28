import { Metadata } from "next";
import { FALLBACK_SEO } from "@/utils/constants";
import imageUrl from "@/utils/imageUrl";
import HeroesAndSections from "@/components/Parsers/HeroesAndSections";
import { Locale } from "next-intl";
import { getHomePage } from "@/utils/get-home-page";
import { locales } from "@/i18n/config";

type Props = {
  params: Promise<{
    locale: Locale;
  }>;
};

import { getPayload } from "payload";
import configPromise from "@payload-config";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const homeGlobal = await getHomePage(params.locale);

  if (!homeGlobal || !homeGlobal.page) return FALLBACK_SEO;

  const payload = await getPayload({ config: configPromise });
  const pageDoc =
    typeof homeGlobal.page === "object"
      ? homeGlobal.page
      : await payload.findByID({
          collection: "pages",
          id: homeGlobal.page as string,
          locale: params.locale as 'en' | 'id',
          depth: 2,
        });

  const metadata = (pageDoc as any)?.meta;
  if (!metadata) return FALLBACK_SEO;

  const canonicalURL =
    metadata?.canonicalURL ||
    `${process.env.NEXT_PUBLIC_BASE_URL}/${params.locale}`;

  return {
    title: metadata?.title || FALLBACK_SEO.title,
    description: metadata?.description || FALLBACK_SEO.description,
    keywords: metadata?.keywords,
    openGraph: {
      url: canonicalURL,
      title: metadata?.title || FALLBACK_SEO.title,
      description: metadata?.description || FALLBACK_SEO.description,
      siteName: "Ian Febi Sastrataruna",
      type: "website",
      images: [
        {
          url: metadata?.image?.url
            ? imageUrl(metadata?.image?.url as any, "thumbnail") || ""
            : "",
        },
      ],
    },
    twitter: {
      card: "summary",
      site: "@ianfebi01",
      title: metadata?.title || FALLBACK_SEO.title,
      description: metadata?.description || FALLBACK_SEO.description,
      images: [
        {
          url: metadata?.image?.url
            ? imageUrl(metadata?.image?.url as any, "thumbnail") || ""
            : "",
        },
      ],
    },
  };
}

export function generateStaticParams() {
  return (
    locales?.map((locale) => ({
      locale: locale,
    })) || []
  );
}

export const revalidate = 60; // ISR Support

export default async function PageHome(props: Props) {
  const params = await props.params;
  const homeGlobal = await getHomePage(params.locale);

  if (!homeGlobal || !homeGlobal.page) return null;

  const payload = await getPayload({ config: configPromise });

  const pageDoc =
    typeof homeGlobal.page === "object"
      ? homeGlobal.page
      : await payload.findByID({
          collection: "pages",
          id: homeGlobal.page as string,
          locale: params.locale as 'en' | 'id',
          depth: 2,
        });

  // Fetch profile global for profile-banner blocks
  const profile = await payload.findGlobal({
    slug: "profile",
    locale: params.locale as 'en' | 'id',
    depth: 2,
  });

  // Inject profile data into any profile-banner blocks
  const bannerBlocks = ((pageDoc as any).banner || []).map((block: any) => {
    if (block.blockType === 'banner-components.profile-banner') {
      return { ...block, ...profile }
    }
    return block
  })

  const pageData = {
    banner: bannerBlocks,
    blocks: (pageDoc as any).blocks || [],
  };

  return <HeroesAndSections page={pageData as any} />;
}

