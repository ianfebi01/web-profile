import React from 'react'
import { cn } from '@/lib/utils'
import { SimpleCardsBlock } from '@/payload-types'
import AnimationProvider from '../Context/AnimationProvider'

interface Props {
  sectionData: SimpleCardsBlock
}

const SimpleCards: React.FC<Props> = ( { sectionData } ) => {
  if ( !sectionData.cards?.length ) return null

  return (
    <div className="flex flex-wrap justify-center gap-4 lg:gap-8 min-h-[150px]">
      {sectionData.cards?.map(
        ( item: any, index: number ) => (
          <article
            key={index}
            className={cn(
              sectionData.cards?.length === 2 || sectionData.cards?.length === 1
                ? 'basis-full md:basis-[calc(50%-0.5rem)] lg:basis-[calc(50%-1rem)]'
                : 'basis-full md:basis-[calc(33.3%-0.75rem)] lg:basis-[calc(33.3%-1.33rem)]'
            )}
          >
            <AnimationProvider
              once
              className={cn(
                'bg-dark-secondary drop-shadow-20 px-6 py-8 rounded-lg h-full'
              )}
              delay={0.2 + ( index * 0.1 )}
            >
              <header>
                <h2
                  className={cn(
                    'font-extra-bold',
                    item.bigTitleSize ? 'h2' : 'h3'
                  )}
                >
                  {item.title}
                </h2>
              </header>
              <p>{item.description}</p>
            </AnimationProvider>
          </article>
        )
      )}
    </div>
  )
}

export default SimpleCards
