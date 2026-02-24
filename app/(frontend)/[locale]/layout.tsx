import type { Metadata } from 'next'
import { config } from '@fortawesome/fontawesome-svg-core'
import ReactQueryProvider from '@/components/Context/ReactQueryProvider'
import { Toaster } from 'react-hot-toast'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import NextTopLoader from 'nextjs-toploader'
import Navbar from '@/components/Layouts/Navbar'
import SectionProvider from '@/components/Context/SectionProvider'
import Footer from '@/components/Layouts/Footer'
import { getSiteData } from '@/utils/get-site-data'
import { ApiSiteSite } from '@/types/generated/contentTypes'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import Error from '../error'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

config.autoAddCss = false

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
  
  const siteData = ( await getSiteData( locale ) ) as { data: ApiSiteSite }

  return (
    <html lang={locale}>
      <GoogleAnalytics />
      <ErrorBoundary errorComponent={Error}>
        <ReactQueryProvider>
          <body suppressHydrationWarning={true}
            id="myportal"
          >
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
                  items={siteData?.data?.attributes?.mainNavMenu}
                  socials={siteData?.data?.attributes?.socials}
                />

                {children}
          
                <SectionProvider>
                  <Footer />
                </SectionProvider>
              </div>
            </NextIntlClientProvider>
          </body>
        </ReactQueryProvider>
      </ErrorBoundary>
    </html>
  )
}
