'use client'

import { useState, startTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import NoDataFound from '@/components/NoDataFound'
import ArticleListItem from '@/components/Cards/ArticleListItem'
import SearchField from '@/components/Inputs/SearchField'
import PaginationControls from '@/components/UI/PaginationControls'
import { fetchArticles } from '@/lib/api/articleListClient'

const ArticleListing = () => {
  const locale = useLocale()
  const tArticle = useTranslations( 'article' )
  const t = useTranslations()
  const [searchTerm, setSearchTerm] = useState( '' )
  const [currentPage, setCurrentPage] = useState( 1 )

  const { data, isLoading, isError, isFetching } = useQuery( {
    queryKey : ['articles', locale, searchTerm, currentPage],
    queryFn  : () =>
      fetchArticles( {
        locale,
        page : currentPage,
        searchTerm,
      } ),
    placeholderData : ( previousData ) => previousData,
  } )

  const articles = data?.docs ?? []
  const page = data?.page ?? currentPage
  const totalPages = data?.totalPages ?? 0

  return (
    <>
      <section id="article"
        className="h-fit bg-white dark:bg-dark"
      >
        <div className="max-w-[728px] mx-auto px-6 mt-28 mb-16 flex flex-col gap-8 text-black dark:text-white">
          <h1 className="m-0 font-bold tracking-tight leading-[1.15] text-[32px] md:text-[42px]">
            {tArticle( 'title' )}
          </h1>
          <SearchField
            value={searchTerm}
            onChange={( value ) => startTransition( () => {
              setSearchTerm( value )
              setCurrentPage( 1 )
            } )}
            placeholder={`${t( 'search' )} ${tArticle( 'title' )}`}
            resetLabel={t( 'reset' )}
          />
          {isLoading ? (
            <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
              {Array.from( { length : 4 } ).map( ( _, index ) => (
                <div
                  key={index}
                  className="flex gap-12 py-8 first:pt-0 animate-pulse"
                >
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="h-4 w-32 rounded-full bg-light-secondary dark:bg-dark-secondary" />
                    <div className="h-6 w-full rounded-lg bg-light-secondary dark:bg-dark-secondary" />
                    <div className="h-4 w-3/4 rounded-lg bg-light-secondary dark:bg-dark-secondary" />
                  </div>
                  <div className="w-20 sm:w-40 aspect-square sm:aspect-[3/2] bg-light-secondary dark:bg-dark-secondary" />
                </div>
              ) )}
            </div>
          ) : isError ? (
            <p className="text-sm text-black/70 dark:text-white/70 sm:text-base">{t( 'something_went_wrong_title' )}</p>
          ) : articles.length === 0 ? (
            <NoDataFound />
          ) : (
            <>
              {isFetching ? (
                <p className="m-0 text-sm text-black/65 dark:text-white/50">Loading...</p>
              ) : null}
              <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
                {articles.map( ( article ) => (
                  <ArticleListItem key={article.id}
                    data={article}
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

export default ArticleListing