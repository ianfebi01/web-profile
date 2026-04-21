'use client'

import { useState, startTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import Header from '@/components/Layouts/Header'
import NoDataFound from '@/components/NoDataFound'
import PortofoliosWrapper from '@/components/PortofoliosWrapper'
import SearchField from '@/components/Inputs/SearchField'
import PaginationControls from '@/components/UI/PaginationControls'
import { fetchPortofolios } from '@/lib/api/portofolioListClient'

const PortofolioListing = () => {
  const locale = useLocale()
  const tPortofolio = useTranslations('portofolio')
  const t = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['projects', locale, searchTerm, currentPage],
    queryFn: () =>
      fetchPortofolios({
        locale,
        page: currentPage,
        searchTerm,
      }),
    placeholderData: (previousData) => previousData,
  })

  const portofolios = data?.docs ?? []
  const page = data?.page ?? currentPage
  const totalPages = data?.totalPages ?? 0

  return (
    <main>
      <section id="portofolio" className="h-fit bg-dark">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20 sm:mt-20 flex flex-col gap-4">
          <Header text={tPortofolio('title')} link={'/'} />
          <SearchField
            value={searchTerm}
            onChange={(value) => startTransition(() => {
              setSearchTerm(value)
              setCurrentPage(1)
            })}
            placeholder={`${t('search')} ${tPortofolio('title')}`}
            resetLabel={t('reset')}
          />
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] rounded-lg bg-dark-secondary animate-pulse"
                />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-white/70 sm:text-base">{t('something_went_wrong_title')}</p>
          ) : portofolios.length === 0 ? (
            <NoDataFound />
          ) : (
            <>
              {isFetching ? (
                <p className="m-0 text-sm text-white/50">Loading...</p>
              ) : null}
              <PortofoliosWrapper portofolios={portofolios} />
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                previousLabel={t('previous')}
                nextLabel={t('next')}
                pageLabel={t('page')}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default PortofolioListing