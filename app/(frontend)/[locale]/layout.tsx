import '@/assets/css/main.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Source_Code_Pro, Source_Serif_4 } from 'next/font/google'
import { config } from '@fortawesome/fontawesome-svg-core'
import ReactQueryProvider from '@/components/Context/ReactQueryProvider'
import { Toaster } from 'react-hot-toast'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import NextTopLoader from 'nextjs-toploader'
import UIMouseCursor from '@/components/UI/UIMouseCursor'
import SectionProvider from '@/components/Context/SectionProvider'
import SmoothScrollProvider from '@/components/Context/SmoothScrollProvider'
import Footer from '@/components/Layouts/Footer'
import { getSiteData } from '@/utils/get-site-data'
import { Site } from '@/payload-types'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import Error from '@/app/error'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { isPayloadReady } from '@/lib/is-payload-ready'
import Header from '@/components/Layouts/Header'
import JsonLd from '@/components/Seo/JsonLd'
import { FALLBACK_SEO } from '@/utils/constants'
import { AUTHOR_NAME, SITE_NAME, SITE_URL, TWITTER_HANDLE } from '@/lib/seo/config'
import { graph, personSchema, websiteSchema } from '@/lib/seo/structured-data'

config.autoAddCss = false

const inter = Inter( {
  subsets  : ['latin'],
  variable : '--font-sans-family',
} )

const sourceCodePro = Source_Code_Pro( {
  subsets  : ['latin'],
  variable : '--font-code-family',
} )

const sourceSerif = Source_Serif_4( {
  subsets  : ['latin'],
  variable : '--font-serif-family',
} )

export const metadata: Metadata = {
  metadataBase : new URL( SITE_URL ),
  title        : {
    default  : FALLBACK_SEO.title,
    template : `%s | ${SITE_NAME}`,
  },
  description     : FALLBACK_SEO.description,
  applicationName : SITE_NAME,
  authors         : [{ name : AUTHOR_NAME, url : SITE_URL }],
  creator         : AUTHOR_NAME,
  publisher       : AUTHOR_NAME,
  formatDetection : { telephone : false, email : false, address : false },
  robots          : {
    index     : true,
    follow    : true,
    googleBot : {
      index               : true,
      follow              : true,
      'max-image-preview' : 'large',
      'max-snippet'       : -1,
      'max-video-preview' : -1,
    },
  },
  twitter : {
    card    : 'summary_large_image',
    site    : TWITTER_HANDLE,
    creator : TWITTER_HANDLE,
  },
}

export const viewport: Viewport = {
  width        : 'device-width',
  initialScale : 1,
  themeColor   : [
    { media : '(prefers-color-scheme: light)', color : '#ffffff' },
    { media : '(prefers-color-scheme: dark)', color : '#222222' },
  ],
  colorScheme : 'light dark',
}

const themeInitScript = `try{var t=localStorage.theme;document.documentElement.classList.toggle('dark',t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){}`

export function generateStaticParams() {
  // See app/(frontend)/[locale]/page.tsx: don't prerender without a database
  if ( !isPayloadReady() ) return [];

  return routing.locales.map( ( locale ) => ( { locale } ) );
}

export default async function LocaleLayout( {
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
} ) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params
  if ( !hasLocale( routing.locales, locale ) ) {
    notFound()
  }

  setRequestLocale( locale )
  const t = await getTranslations( { locale } )

  const siteData = ( await getSiteData( locale ) ) as { data: Site & { mainNavMenu?: any, footerNavMenu?: any } }
  const navItems = siteData?.data?.mainNavMenu ?? []
  const socialLinks = siteData?.data?.socialPlatformLinks ?? []
  const siteJsonLd = graph(
    personSchema( { sameAs : socialLinks.map( ( link ) => link.url ).filter( ( url ) => /^https?:/.test( url ) ) } ),
    websiteSchema( siteData?.data?.description || FALLBACK_SEO.description ),
  )

  return (
    <html lang={locale}
      className={`${inter.variable} ${sourceCodePro.variable} ${sourceSerif.variable} scrollbar-gutter-stable`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved theme (or the OS preference) before paint to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html : themeInitScript }} />
        <JsonLd data={siteJsonLd} />
      </head>
      <body suppressHydrationWarning={true}
        id="myportal"
      >
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-full focus:bg-orange focus:text-white focus:no-underline"
        >
          {t( 'skip_to_content' )}
        </a>
        <GoogleAnalytics />
        <ErrorBoundary errorComponent={Error}>
          <SmoothScrollProvider>
            {/* <Preloader /> */}
            <UIMouseCursor />
            <ReactQueryProvider>
              <NextIntlClientProvider>
                <NextTopLoader
                  color="#F26B50"
                  initialPosition={0.08}
                  crawlSpeed={200}
                  height={3}
                  crawl={true}
                  showSpinner={false}
                  easing="ease"
                  speed={200}
                  shadow="0 0 10px #F26B50,0 0 5px #F26B50"
                />
                <Toaster
                  toastOptions={{
                    // icon : (
                    // 	<div className="text-20" data-cy="modal-information-icon">
                    // 		<ModalInformationIcon />
                    // 	</div>
                    // ),
                    position  : 'top-right',
                    className : 'bg-white text-dark text-md',
                    style     : {
                      boxShadow : '0px 4px 10px rgba(0, 0, 0, 0.1)',
                      height    : '44px',
                    },
                  }}
                />
                <div className="flex flex-col min-h-screen">
                  <Header
                    items={navItems}
                    socials={socialLinks}
                  />

                  <main id="main-content"
                    tabIndex={-1}
                    className="grow flex flex-col outline-none"
                  >
                    {children}
                  </main>

                  <SectionProvider>
                    <Footer />
                  </SectionProvider>
                </div>
              </NextIntlClientProvider>
            </ReactQueryProvider>
          </SmoothScrollProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
