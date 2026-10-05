'use client'

import TextQuote from '@/components/Texts/TextQuote'
import { QuoteBlock } from '@/payload-types'
import { FunctionComponent } from 'react'

interface Props {
  sectionData: QuoteBlock
  myposy?: number
}

// Editorial pull quote: oversized serif text framed by an orange mark and rule
const Quote: FunctionComponent<Props> = ( { sectionData } ) => {
  return (
    <figure className="m-0 mx-auto max-w-4xl py-12 md:py-20 flex flex-col items-center text-center text-black dark:text-white">
      <span
        aria-hidden="true"
        className="font-serif text-orange text-[96px] md:text-[128px] leading-none h-12 md:h-16 select-none"
      >
        &ldquo;
      </span>
      <blockquote className="m-0 mt-4">
        <TextQuote quote={sectionData.quote} />
      </blockquote>
      <span
        aria-hidden="true"
        className="block w-12 h-0.5 mt-10 md:mt-12 bg-orange"
      />
    </figure>
  )
}

export default Quote
