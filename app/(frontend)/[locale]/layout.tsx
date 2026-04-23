import '@/assets/scss/main.scss'
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { Metadata } from 'next'
import { Source_Code_Pro } from 'next/font/google'
import { config } from '@fortawesome/fontawesome-svg-core'
import ReactQueryProvider from '@/components/Context/ReactQueryProvider'
import { Toaster } from 'react-hot-toast'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import NextTopLoader from 'nextjs-toploader'
import Navbar from '@/components/Layouts/Navbar'
import Preloader from '@/components/UI/Preloader'
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

config.autoAddCss = false

const sourceCodePro = Source_Code_Pro( {
  subsets  : ['latin'],
  variable : '--font-code',
} )

export const metadata: Metadata = {
  title : 'Ian Febi S',
  description :
    'Front End Web Developer with 1+ year of experience. Expert on React js and Vue js',
}

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
      className={`${sourceCodePro.variable} [scrollbar-gutter:stable]`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning={true}
        id="myportal"
      >
        <GoogleAnalytics />
        <ErrorBoundary errorComponent={Error}>
          <SmoothScrollProvider>
            <Preloader />
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
                  <Navbar
                    items={navItems as any}
                    socials={socialLinks as any}
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
