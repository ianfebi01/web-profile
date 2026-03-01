'use client'
import SkeletonDetail from './SkeletonDetail'
import Chip from '@/components/Chip'
import Header from '@/components/Layouts/Header'
import Markdown from '@/components/Parsers/Markdown'
import GaleryCarousel from '@/components/Layouts/GaleryCarousel'
import { useTranslations } from 'next-intl'
import PortofolioCard from '@/components/Cards/PortofolioCard'
import { Project } from '@/payload-types'

interface Props {
  data: Project | null
  latestPortofolios: Project[] | null
  isFetching?: boolean
}

const Detail = ( { data, latestPortofolios, isFetching }: Props ) => {
  const t = useTranslations()

  return (
    <section
      id="portofolio"
      className="w-full flex flex-col items-center bg-dark grow-[1]"
    >
      {isFetching || !data ? (
        <SkeletonDetail />
      ) : (
        <div className="w-full h-full grow-[1] max-w-3xl px-6 lg:px-8 mt-20 sm:mt-20 mb-8 flex flex-col gap-4">
          <Header text={data?.title || ''}
            link={'/portofolio'}
          />
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 w-full mx-auto">
              {data?.gallery?.length && (
                <GaleryCarousel data={data.gallery.map((g: any) => g.image)} />
              )}
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 flex-wrap">
                  {!!data?.createdAt && (
                    <Chip label={new Date(data.createdAt).toLocaleDateString()}
                      bg="dark-secondary"
                    />
                  )}
                  {!!data?.url && (
                    <Chip
                      label="Url: "
                      link={data.url || undefined}
                      bg="dark-secondary"
                    />
                  )}
                </div>
                {!!data?.description && (
                  <div className="bg-dark-secondary p-4 border border-none rounded-lg flex flex-col gap-4 text-white/90">
                    <Markdown content={data.description} />
                  </div>
                )}
              </div>
            </div>
            <hr className="border-white-overlay-2" />
            {latestPortofolios && latestPortofolios.length > 0 && (
              <>
                <h2 className="h1 mt-0">{t( 'see_latest_portfolios' )}:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestPortofolios.map( ( portofolio ) => (
                    <PortofolioCard
                      key={portofolio.slug}
                      portofolio={portofolio as any}
                    />
                  ) )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default Detail
