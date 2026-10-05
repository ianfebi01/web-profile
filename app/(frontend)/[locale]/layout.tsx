import '@/assets/css/main.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { Metadata } from 'next'
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
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Header from '@/components/Layouts/Header'

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
  title : 'Ian Febi S',
  description :
    'Front End Web Developer with 1+ year of experience. Expert on React js and Vue js',
}

const themeInitScript = `try{var t=localStorage.theme;document.documentElement.classList.toggle('dark',t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){}`

export function generateStaticParams() {
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
  
  const siteData = ( await getSiteData( locale ) ) as { data: Site & { mainNavMenu?: any, footerNavMenu?: any } }
  const navItems = siteData?.data?.mainNavMenu ?? []
  const socialLinks = siteData?.data?.socialPlatformLinks ?? []

  return (
    <html lang={locale}
      className={`${inter.variable} ${sourceCodePro.variable} ${sourceSerif.variable} scrollbar-gutter-stable`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the saved theme (or the OS preference) before paint to avoid a flash */}
        <script dangerouslySetInnerHTML={{ __html : themeInitScript }} />
      </head>
      <body suppressHydrationWarning={true}
        id="myportal"
      >
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

                  {children}
          
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
