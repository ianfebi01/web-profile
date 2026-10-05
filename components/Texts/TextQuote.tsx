'use client'
import { FunctionComponent, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

interface Props {
  quote: string
}

// Reveals the quote word by word once it scrolls into view
const TextQuote: FunctionComponent<Props> = ( { quote } ) => {
  const textRef = useRef<HTMLParagraphElement>( null )
  const isInView = useInView( textRef, { once : true, margin : '0px 0px -15% 0px' } )
  const reduceMotion = useReducedMotion()

  const words = quote.trim().split( /\s+/ )

  return (
    <p
      ref={textRef}
      className="m-0 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-snug md:leading-[1.3] tracking-tight text-balance"
    >
      {words.map( ( word, index ) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={reduceMotion ? false : { opacity : 0, y : 12, filter : 'blur(4px)' }}
          animate={isInView ? { opacity : 1, y : 0, filter : 'blur(0px)' } : undefined}
          transition={{ duration : 0.5, ease : 'easeOut', delay : index * 0.04 }}
        >
          {word}
          {index < words.length - 1 && ' '}
        </motion.span>
      ) )}
    </p>
  )
}

export default TextQuote
