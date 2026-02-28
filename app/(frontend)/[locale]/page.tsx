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
      siteName: "Ian Febi Sastrataruna", // Replace with your site name
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

  // Resolve the actual page document since getHomePage depth might not deeply populate relations fully depending on depth
  const pageDoc =
    typeof homeGlobal.page === "object"
      ? homeGlobal.page
      : await payload.findByID({
          collection: "pages",
          id: homeGlobal.page as string,
          depth: 2,
        });

  // Fetch profile global
  const profile = await payload.findGlobal({
    slug: "profile",
    depth: 2,
  });

  // Mocking the structure that HeroesAndSections expects
  const payloadToStrapiFormat = {
    banner: [
      {
        blockType: "banner-components.profile-banner",
        ...profile,
      },
    ],
    content: (pageDoc as any).blocks || [],
  };

  return <HeroesAndSections page={payloadToStrapiFormat as any} />;
}
