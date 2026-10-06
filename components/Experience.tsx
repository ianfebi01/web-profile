'use client'
import { FunctionComponent, useEffect, useMemo, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Experience as ExperienceType } from '@/payload-types'
import { cn } from '@/lib/utils'
import Markdown from './Parsers/Markdown'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin( ScrollTrigger )

interface Props {
  data: ExperienceType[]
}

// Sort by endDate in descending order, prioritizing null or missing endDate (current)
const compareByEndDate = ( a: ExperienceType, b: ExperienceType ) => {
  const aEndDate = a.endDate
    ? new Date( a.endDate ).getTime()
    : null
  const bEndDate = b.endDate
    ? new Date( b.endDate ).getTime()
    : null

  // Handle null or missing endDate
  if ( aEndDate === null && bEndDate !== null ) return -1 // a comes first
  if ( bEndDate === null && aEndDate !== null ) return 1 // b comes first
  if ( aEndDate === null && bEndDate === null ) return 0 // equal

  return bEndDate! - aEndDate!
}

const isCurrent = ( item: ExperienceType ) => !item.endDate || new Date( item.endDate ) >= new Date()

const getMonths = ( item: ExperienceType ) => {
  const startDate = new Date( item.startDate )
  const endDate = item.endDate ? new Date( item.endDate ) : new Date() // Use current date if endDate is null

  return ( endDate.getFullYear() - startDate.getFullYear() ) * 12 + ( endDate.getMonth() - startDate.getMonth() )
}

const Experience: FunctionComponent<Props> = ( { data } ) => {
  const t = useTranslations( 'experience' )
  const locale = useLocale()

  const companies = useMemo( () => {
    // Group by companyName
    const grouped = data.reduce<Record<string, ExperienceType[]>>( ( acc, item ) => {
      if ( !acc[item.companyName] ) {
        acc[item.companyName] = []
      }
      acc[item.companyName].push( item )

      return acc
    }, {} )

    // Sort roles in each company, then sort companies by their latest role
    return Object.entries( grouped )
      .map( ( [companyName, roles] ) => {
        const sortedRoles = [...roles].sort( compareByEndDate )
        const earliestStart = sortedRoles.reduce(
          ( earliest, role ) => ( role.startDate < earliest ? role.startDate : earliest ),
          sortedRoles[0].startDate
        )

        return {
          companyName,
          roles       : sortedRoles,
          startDate   : earliestStart,
          endDate     : sortedRoles[0].endDate,
          isCurrent   : sortedRoles.some( isCurrent ),
          totalMonths : sortedRoles.reduce( ( total, role ) => total + getMonths( role ), 0 ),
        }
      } )
      .sort( ( a, b ) => compareByEndDate( a.roles[0], b.roles[0] ) )
  }, [data] )

  const formatDuration = ( totalMonths: number ) => {
    const years = Math.floor( totalMonths / 12 )
    const months = totalMonths % 12

    if ( years === 0 && months === 0 ) return t( 'less_than_month' )

    return [
      years > 0 && t( 'years', { count : years } ),
      months > 0 && t( 'months', { count : months } ),
    ].filter( Boolean ).join( ' ' )
  }

  const formatPeriod = ( startDate: string, endDate?: string | null ) => {
    const format = ( date: string ) =>
      new Date( date ).toLocaleDateString( locale, { month : 'short', year : 'numeric' } )

    return `${format( startDate )} — ${endDate && new Date( endDate ) < new Date() ? format( endDate ) : t( 'present' )}`
  }

  // Transition
  const itemsRef = useRef<HTMLLIElement[] | null[]>( [] )
  useEffect( () => {
    itemsRef.current.forEach( ( item ) => {
      gsap.to( item, {
        opacity       : 1,
        y             : 0,
        duration      : 0.8,
        ease          : 'power2.out',
        scrollTrigger : {
          trigger       : item,
          start         : 'top 90%', // when top of item hits 90% of viewport
          toggleActions : 'play none none none',
        },
      } )
    } )
  }, [] )

  return (
    <ol className="m-0 list-none max-w-5xl mx-auto border-t border-black/10 dark:border-white/10 text-black dark:text-white">
      {companies.map( ( company, index ) => {
        const hasMultipleRoles = company.roles.length > 1

        return (
          <li
            key={company.companyName}
            ref={( el ) => {
              itemsRef.current[index] = el
            }}
            className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 md:gap-12 py-10 md:py-12 border-b border-black/10 dark:border-white/10 translate-y-[50px] opacity-0"
          >
            {/* Period */}
            <div className="flex flex-col gap-1 text-sm text-black/65 dark:text-white/55">
              <span className="font-medium text-black/80 dark:text-white/80">
                {formatPeriod( company.startDate, company.endDate )}
              </span>
              <span>{formatDuration( company.totalMonths )}</span>
              {company.isCurrent && (
                <span className="inline-flex items-center gap-2 mt-2 text-orange font-medium">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full rounded-full bg-orange opacity-60 animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-orange" />
                  </span>
                  {t( 'current' )}
                </span>
              )}
            </div>

            {/* Company and roles */}
            <div className="flex flex-col min-w-0">
              <h3 className="m-0 text-2xl md:text-[28px] font-bold tracking-tight leading-tight">
                {company.companyName}
              </h3>

              <ol className={cn( 'm-0 list-none flex flex-col', hasMultipleRoles ? 'mt-6 gap-8' : 'mt-1' )}>
                {company.roles.map( ( role ) => (
                  <li
                    key={role.id}
                    className={cn( 'relative', hasMultipleRoles && 'pl-7' )}
                  >
                    {hasMultipleRoles && (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute left-[5px] top-4 -bottom-8 w-px bg-black/15 dark:bg-white/15 [li:last-child>&]:hidden"
                        />
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute left-0 top-1.5 size-[11px] rounded-full border-2',
                            isCurrent( role )
                              ? 'bg-orange border-orange'
                              : 'bg-white dark:bg-dark border-black/30 dark:border-white/30'
                          )}
                        />
                      </>
                    )}

                    <h4 className={cn( 'm-0 font-semibold leading-snug', hasMultipleRoles ? 'text-lg' : 'text-lg md:text-xl text-black/70 dark:text-white/70' )}>
                      {role.role}
                    </h4>
                    {hasMultipleRoles && (
                      <p className="m-0 mt-1 text-sm text-black/65 dark:text-white/55">
                        {formatPeriod( role.startDate, role.endDate )}
                        <span className="mx-2">·</span>
                        {formatDuration( getMonths( role ) )}
                      </p>
                    )}
                    {!!role.description && (
                      <div className="mt-3 text-black/75 dark:text-white/75 [&_.body-copy_p]:mt-3 [&_.body-copy_li]:mt-1.5">
                        <Markdown content={role.description} />
                      </div>
                    )}
                  </li>
                ) )}
              </ol>
            </div>
          </li>
        )
      } )}
    </ol>
  )
}

export default Experience
