'use client'

import { useState, startTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import NoDataFound from '@/components/NoDataFound'
import ProjectCard from '@/components/Cards/ProjectCard'
import SearchField from '@/components/Inputs/SearchField'
import PaginationControls from '@/components/UI/PaginationControls'
import { fetchPortofolios } from '@/lib/api/portofolioListClient'

const PortofolioListing = () => {
  const locale = useLocale()
  const tPortofolio = useTranslations( 'portofolio' )
  const t = useTranslations()
  const [searchTerm, setSearchTerm] = useState( '' )
  const [currentPage, setCurrentPage] = useState( 1 )

  const { data, isLoading, isError, isFetching } = useQuery( {
    queryKey : ['projects', locale, searchTerm, currentPage],
    queryFn  : () =>
      fetchPortofolios( {
        locale,
        page : currentPage,
        searchTerm,
      } ),
    placeholderData : ( previousData ) => previousData,
  } )

  const portofolios = data?.docs ?? []
  const page = data?.page ?? currentPage
  const totalPages = data?.totalPages ?? 0

  return (
    <>
      <section id="portofolio"
        className="h-fit bg-white dark:bg-dark"
      >
        <div className="max-w-5xl mx-auto px-6 mt-28 mb-16 flex flex-col gap-8 text-black dark:text-white">
          <h1 className="m-0 font-bold tracking-tight leading-[1.15] text-[32px] md:text-[42px]">
            {tPortofolio( 'title' )}
          </h1>
          <SearchField
            value={searchTerm}
            onChange={( value ) => startTransition( () => {
              setSearchTerm( value )
              setCurrentPage( 1 )
            } )}
            placeholder={`${t( 'search' )} ${tPortofolio( 'title' )}`}
            resetLabel={t( 'reset' )}
          />
          {isLoading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 border-t border-black/10 dark:border-white/10 pt-10">
              {Array.from( { length : 6 } ).map( ( _, index ) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 animate-pulse"
                >
                  <div className="aspect-video bg-light-secondary dark:bg-dark-secondary" />
                  <div className="h-6 w-3/4 mt-2 rounded-lg bg-light-secondary dark:bg-dark-secondary" />
                  <div className="h-4 w-full rounded-lg bg-light-secondary dark:bg-dark-secondary" />
                </div>
              ) )}
            </div>
          ) : isError ? (
            <p className="text-sm text-black/70 dark:text-white/70 sm:text-base">{t( 'something_went_wrong_title' )}</p>
          ) : portofolios.length === 0 ? (
            <NoDataFound />
          ) : (
            <>
              {isFetching ? (
                <p className="m-0 text-sm text-black/65 dark:text-white/50">Loading...</p>
              ) : null}
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 border-t border-black/10 dark:border-white/10 pt-10">
                {portofolios.map( ( portofolio ) => (
                  <ProjectCard key={portofolio.id}
                    data={portofolio}
                  />
                ) )}
              </div>
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                previousLabel={t( 'previous' )}
                nextLabel={t( 'next' )}
                pageLabel={t( 'page' )}
              />
            </>
          )}
        </div>
      </section>
    </>
  )
}

export default PortofolioListing