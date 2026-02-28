'use client'
import { FunctionComponent, useEffect, useMemo, useRef } from 'react'
import { Experience as ExperienceType } from '@/payload-types'
import Markdown from './Parsers/Markdown'
import ProgressVertical, { IStep } from './ProgressVertical'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin( ScrollTrigger )

interface Props {
  data: ExperienceType[]
}

const Experience: FunctionComponent<Props> = ( { data } ) => {
  const groupedAndSorted = useMemo(
    () =>
      data.reduce<Record<string, ExperienceType[]>>( ( acc, item ) => {
        // Group by companyName
        if ( !acc[item.companyName] ) {
          acc[item.companyName] = []
        }
        acc[item.companyName].push( item )

        // Sort items in the group by endDate in descending order, prioritizing null or missing endDate
        acc[item.companyName].sort( ( a, b ) => {
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

          // Sort by endDate in descending order
          return bEndDate! - aEndDate!
        } )

        return acc
      }, {} ),
    [data]
  )

  // console.log( groupedAndSorted )

  const transformedData: {
    companyName: string
    totalWorkingMonths: number
    steps: IStep[]
  }[] = useMemo(
    () =>
      Object.entries( groupedAndSorted ).map( ( [companyName, experiences] ) => {
        // Calculate total working months for this company
        const totalWorkingMonths = experiences.reduce( ( total, item ) => {
          const startDate = new Date( item.startDate )
          const endDate = item.endDate
            ? new Date( item.endDate )
            : new Date() // Use current date if endDate is null
          const months =
            ( endDate.getFullYear() - startDate.getFullYear() ) * 12 +
            ( endDate.getMonth() - startDate.getMonth() )

          return total + months
        }, 0 )

        return {
          companyName        : companyName,
          totalWorkingMonths : totalWorkingMonths,
          steps              : experiences.map( ( item ) => {
            const startDate = new Date( item.startDate )
            const endDate = item.endDate
              ? new Date( item.endDate )
              : new Date() // Use current date if endDate is null
            const months =
              ( endDate.getFullYear() - startDate.getFullYear() ) * 12 +
              ( endDate.getMonth() - startDate.getMonth() )

            return {
              description : String( item.description || '' ),
              name        : String( item.companyName ),
              role        : String( item.role ),
              status :
                item.endDate &&
                new Date( item.endDate ) < new Date()
                  ? 'complete'
                  : 'current',
              totalWorkingMonths : months,
            }
          } ),
        }
      } ),
    [groupedAndSorted]
  )

  function convertMonthsToYearsAndMonths( totalMonths: number ): string {
    const years = Math.floor( totalMonths / 12 ) // Calculate the number of years
    const months = totalMonths % 12 // Calculate the remaining months

    const yearText = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : ''
    const monthText =
      months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''

    // Combine year and month text with appropriate spacing
    return [yearText, monthText].filter( Boolean ).join( ' ' )
  }

  // Transition
  const itemsRef = useRef<HTMLDivElement[] | null[]>( [] )
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
    <div className="flex flex-col gap-4">
      <div className="bg-dark px-4 py-6 rounded-lg divide-y-[1px] divide-white-overlay-2">
        {transformedData.map( ( item, index ) => (
          <div
            key={item.companyName}
            className="pt-4 first:pt-0 translate-y-[50px] opacity-0"
            ref={el => {
              (itemsRef.current[index] = el);
            }}
          >
            {item.steps.length > 1 && (
              <>
                <h3>{item.companyName}</h3>
                <p className="mt-0 mb-2 text-sm">
                  {convertMonthsToYearsAndMonths( item.totalWorkingMonths )}
                </p>
              </>
            )}
            <div>
              {item.steps.length > 1 ? (
                <ProgressVertical
                  steps={item.steps}
                  convertMonthsToYearsAndMonths={convertMonthsToYearsAndMonths}
                />
              ) : (
                item.steps.map( ( step, i ) => (
                  <div key={i}
                    className="relative flex items-start group"
                  >
                    <span className="flex flex-col min-w-0 ml-4">
                      <h4 className="h3">{step.role}</h4>
                      <p className="mt-0 mb-2 text-sm">
                        {convertMonthsToYearsAndMonths( item.totalWorkingMonths )}
                      </p>
                      <p className="mt-0 mb-2 text-sm text-white-overlay">
                        {step.name}
                      </p>
                      <div className="text-white/80">
                        <Markdown content={step.description} />
                      </div>
                    </span>
                  </div>
                ) )
              )}
            </div>
          </div>
        ) )}
        {/* <ProgressVertical steps={steps} /> */}
      </div>
    </div>
  );
}

export default Experience

