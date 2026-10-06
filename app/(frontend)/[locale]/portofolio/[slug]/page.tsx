import Detail from '@/components/Pages/Portofolio/Detail'
import {
  getAllPortfolioSlugs,
  getDetail,
  getLatestPortofolios,
} from '@/lib/api/portofolioQueryFn'
import { Project, Skill } from '@/payload-types'
import { buildMetadata, clampDescription } from '@/lib/seo/metadata'
import { getLocalizedSlugs, slugsToPaths } from '@/lib/seo/localized-slugs'
import { getPlainText } from '@/utils/parseMd'
import JsonLd from '@/components/Seo/JsonLd'
import { breadcrumbSchema, graph, projectSchema } from '@/lib/seo/structured-data'
import imageUrl from '@/utils/imageUrl'
import { Metadata } from 'next'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    locale: Locale
    slug: string
  }>
}

const skillNames = ( data: Project ) =>
  ( data.skills ?? [] ).filter( ( skill ): skill is Skill => typeof skill === 'object' ).map( ( skill ) => skill.name )

const projectDescription = ( data: Project ) =>
  clampDescription( getPlainText( data.description || '' ) ) || `Portfolio project: ${data.title}`

export async function generateMetadata( props: Props ): Promise<Metadata> {
  const params = await props.params;
  setRequestLocale( params.locale )

  const data = await getDetail( params.slug, params.locale )

  if ( !data ) return { robots : { index : false } }

  const slugs = await getLocalizedSlugs( 'projects', data.id )

  return buildMetadata( {
    locale        : params.locale,
    paths         : slugsToPaths( slugs, '/portofolio' ),
    title         : data.title,
    description   : projectDescription( data ),
    image         : imageUrl( data.thumbnail ),
    imageAlt      : data.title,
    type          : 'article',
    publishedTime : data.createdAt,
    modifiedTime  : data.updatedAt,
    tags          : skillNames( data ),
    keywords      : skillNames( data ),
  } )
}

export async function generateStaticParams() {
  const projects = await getAllPortfolioSlugs()

  return (
    projects?.map( ( project: Project ) => ( {
      slug : project.slug,
    } ) ) || []
  )
}

export default async function PortofolioPage(
  props: {
    params: Promise<{ locale: string; slug: string }>
  }
) {
  const params = await props.params;
  setRequestLocale( params.locale )

  const data = await getDetail( params.slug, params.locale )

  if ( !data ) {
    return notFound()
  }
  
  const latestPortofolios = await getLatestPortofolios( params.slug, params.locale )

  const t = await getTranslations( { locale : params.locale, namespace : 'portofolio' } )
  const path = `/portofolio/${params.slug}`
  const jsonLd = graph(
    projectSchema( {
      locale       : params.locale,
      path,
      name         : data.title,
      description  : projectDescription( data ),
      image        : imageUrl( data.thumbnail ),
      images       : ( data.gallery ?? [] ).map( ( item ) => imageUrl( item.image ) ),
      dateCreated  : data.createdAt,
      dateModified : data.updatedAt,
      keywords     : skillNames( data ),
      sameAs       : data.url,
    } ),
    breadcrumbSchema( params.locale, [
      { name : 'Home', path : '' },
      { name : t( 'title' ), path : '/portofolio' },
      { name : data.title, path },
    ] ),
  )

  return (
    <div className="grow flex flex-col">
      <JsonLd data={jsonLd} />
      <Detail data={data}
        latestPortofolios={latestPortofolios}
      />
    </div>
  )
}
