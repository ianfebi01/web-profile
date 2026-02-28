'use client'

import TextQuote from '@/components/Texts/TextQuote'
import { cn } from '@/lib/utils'
import { QuoteBlock } from '@/payload-types'
import { scalePow } from 'd3-scale'
import Image from 'next/image'
import { FunctionComponent } from 'react'

interface Props {
  sectionData: QuoteBlock
  myposy?: number
}
const Quote: FunctionComponent<Props> = ( props ) => {
  const { sectionData, myposy } = props

  const translate = scalePow().domain( [-2000, 2000] ).range( [-100, 100] )

  return (
    <div
      className={cn(
        'bg-dark h-full border border-none rounded-3xl flex justify-center items-center p-4 md:p-10 relative overflow-hidden'
      )}
    >
      <div
        className="bg-plus absolute top-0 left-0 w-full h-full bg-contain bg-center z-0"
        style={{
          transform : `translate(0, ${translate.exponent( 1 )(
            myposy ? -myposy : 0
          )}px)`,
        }}
      ></div>
      <div className="h-fit p-8 md:p-14 relative z-10">
        <Image
          src="/quote.svg"
          alt="Quote icon"
          className="absolute top-0 left-0 w-8 h-8 md:w-[52px] md:h-[52px]"
          width={0}
          height={0}
          priority
        />
        <TextQuote quote={sectionData.quote} />
        <Image
          src="/quote.svg"
          className="absolute bottom-0 right-0 w-8 h-8 md:w-[52px] md:h-[52px]"
          width={0}
          height={0}
          alt="Quote icon"
          priority
        />
      </div>
    </div>
  )
}

export default Quote
