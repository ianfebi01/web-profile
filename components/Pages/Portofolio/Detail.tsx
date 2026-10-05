'use client'
import SkeletonDetail from './SkeletonDetail'
import Markdown from '@/components/Parsers/Markdown'
import GaleryCarousel from '@/components/Layouts/GaleryCarousel'
import { useTranslations } from 'next-intl'
import PortofolioCard from '@/components/Cards/PortofolioCard'
import { Media, Project, Skill } from '@/payload-types'
import { Link } from '@/i18n/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import AuthorMeta from '@/components/Reading/AuthorMeta'
import ShareActions, { actionClass } from '@/components/Reading/ShareActions'

interface Props {
  data: Project | null
  latestPortofolios: Project[] | null
  isFetching?: boolean
}

const Detail = ( { data, latestPortofolios, isFetching }: Props ) => {
  const t = useTranslations()

  const skills = ( data?.skills ?? [] ).filter( ( skill ): skill is Skill => typeof skill === 'object' )

  return (
    <section
      id="portofolio"
      className="w-full flex flex-col items-center bg-white dark:bg-dark grow"
    >
      {isFetching || !data ? (
        <SkeletonDetail />
      ) : (
        <article className="w-full max-w-[728px] px-6 mt-28 mb-16 text-black dark:text-white">
          <Link
            href="/portofolio"
            className="inline-flex items-center gap-2 mb-6 text-sm no-underline text-black/55 hover:text-black dark:text-white/55 dark:hover:text-white transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faArrowLeft}
              className="size-3"
            />
            {t( 'portofolio.title' )}
          </Link>

          <h1 className="m-0 font-bold tracking-tight leading-[1.15] text-[32px] md:text-[42px]">
            {data.title}
          </h1>

          <AuthorMeta content={data.description}
            date={data.createdAt}
          />

          {/* Action bar */}
          <div className="flex items-center justify-between gap-4 mt-8 py-1 border-y border-black/10 dark:border-white/10">
            <div className="flex flex-wrap gap-2">
              {skills.slice( 0, 3 ).map( ( skill ) => (
                <span
                  key={skill.id}
                  className="text-xs px-3 py-1 rounded-full bg-light-secondary dark:bg-dark-secondary text-black/70 dark:text-white/70"
                >
                  {skill.name}
                </span>
              ) )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!!data.url && (
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t( 'portofolio.visit_site' )}
                  className={`${actionClass} no-underline`}
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare}
                    className="size-4"
                  />
                </a>
              )}
              <ShareActions title={data.title} />
            </div>
          </div>

          {!!data.gallery?.length && (
            <div className="mt-10">
              <GaleryCarousel data={data.gallery.map( ( g ) => g.image ).filter( ( image ): image is string | Media => !!image )} />
            </div>
          )}

          {!!data.description && (
            <div className="article-body mt-6">
              <Markdown content={data.description} />
            </div>
          )}

          {!!data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-10 px-5 py-2.5 rounded-full text-sm font-medium no-underline bg-black text-white hover:bg-black/80 dark:bg-white dark:text-dark dark:hover:bg-white/80 transition-colors duration-200"
            >
              {t( 'portofolio.visit_site' )}
              <FontAwesomeIcon icon={faArrowUpRightFromSquare}
                className="size-3"
              />
            </a>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12">
              {skills.map( ( skill ) => (
                <span
                  key={skill.id}
                  className="text-sm px-4 py-2 rounded-full bg-light-secondary dark:bg-dark-secondary"
                >
                  {skill.name}
                </span>
              ) )}
            </div>
          )}

          {latestPortofolios && latestPortofolios.length > 0 && (
            <div className="mt-16 pt-12 border-t border-black/10 dark:border-white/10">
              <h2 className="mt-0 mb-8 text-xl font-bold">{t( 'see_latest_portfolios' )}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestPortofolios.map( ( portofolio ) => (
                  <PortofolioCard
                    key={portofolio.slug}
                    portofolio={portofolio as any}
                  />
                ) )}
              </div>
            </div>
          )}
        </article>
      )}
    </section>
  )
}

export default Detail
