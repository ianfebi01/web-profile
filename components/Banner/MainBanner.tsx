'use client'
import { FunctionComponent, useRef, useEffect } from 'react'

interface MainBannerProps {
  sectionData: MainBannerBlock
}
import { cn } from '@/lib/utils'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { MainBannerBlock, Skill } from '@/payload-types'
import imageUrl from '@/utils/imageUrl'
import Image from 'next/image'

gsap.registerPlugin( ScrollTrigger )
gsap.registerPlugin( TextPlugin )

const MainBanner: FunctionComponent<MainBannerProps> = ( { sectionData } ) => {
  const sectionRef = useRef<HTMLElement>( null )
  const contentRef = useRef<HTMLDivElement>( null )
  const squareRef = useRef<HTMLDivElement>( null )
  const codeTextRef = useRef<HTMLElement>( null )
  const textsRef = useRef<HTMLElement[] | null[]>( [] )
  const skillsRef = useRef<HTMLElement[] | null[]>( [] )

  useEffect( () => {
    const ctx = gsap.context( () => {
      const section = sectionRef.current
      if ( !section ) return

      // Fade out section as user scrolls away
      gsap.to( section, {
        opacity       : 0,
        ease          : 'none',
        scrollTrigger : {
          trigger : section,
          start   : 'top top',
          end     : 'bottom top',
          scrub   : true,
        },
      } )

      // Content parallax — moves up slower
      gsap.to( contentRef.current, {
        y             : 80,
        ease          : 'none',
        scrollTrigger : {
          trigger : section,
          start   : 'top top',
          end     : 'bottom top',
          scrub   : 1.5,
        },
      } )

      // Text
      gsap.to( textsRef.current, {
        y        : 0,
        opacity  : 1,
        stagger  : 0.2,
        duration : 0.8,
        ease     : 'power2.out',
      } )

      // Square
      gsap.to( squareRef.current, {
        y        : 0,
        opacity  : 1,
        duration : 0.5,
        scale    : 1,
        ease     : 'power2.out',
      } )

      // Code text
      gsap.to( codeTextRef.current, {
        text     : '&lt;i/&gt;',
        duration : 1,
        ease     : 'none',
      } )

      // Skills
      gsap.to( skillsRef.current, {
        opacity  : 1,
        duration : 0.5,
        scale    : 1,
        delay    : 0.6,
        ease     : 'back.out(1.7)',
      } )
    } )

    return () => ctx.revert() // cleanup on unmount
  }, [] )

  return (
    <section
      ref={sectionRef}
      id="home"
      className={cn(
        'max-w-7xl px-6 lg:px-8 bg-dark relative overflow-clip h-screen pt-28',
      )}
    >
      <div
        ref={contentRef}
        className="flex flex-col md:flex-row items-center justify-center gap-8 h-full w-full pb-16"
      >
        {/* Square icon */}
        <div className="flex-1 w-full flex items-center md:justify-center">
          <div
            ref={squareRef}
            className="bg-gradient-to-r from-orange via-orange/80 to-orange/20 aspect-square h-80 relative p-1 translate-y-6 opacity-0 scale-90 origin-bottom-right"
          >
            <div className="w-full h-full bg-dark"></div>
            <span
              ref={codeTextRef}
              className="font-code font-bold text-3xl lg:text-5xl text-orange p-2 tracking-tighter bg-dark absolute right-0 bottom-0 translate-y-1/2 translate-x-1/2"
            ></span>
          </div>
        </div>
        {/* Text content */}
        <div className="flex-1 h-full flex flex-col justify-center gap-2 lg:gap-4">
          <h1
            ref={( el ) => {
              textsRef.current[0] = el
            }}
            className="text-5xl lg:text-7xl font-bold m-0 opacity-0 translate-y-6"
          >
            {sectionData.heading1 || 'Heading 1'}
            {' '}
            {sectionData.heading2 && (
              <span className="font-code font-thin tracking-tighter text-orange">
                {sectionData.heading2}
              </span>
            )}
          </h1>
          <h2
            ref={( el ) => {
              textsRef.current[1] = el
            }}
            className="text-5xl lg:text-7xl font-bold m-0 opacity-0 translate-y-6"
          >
            <span className='font-code font-thin tracking-tighter text-orange'>
              {sectionData.heading3 || ''}
            </span>
            {' '}
            {sectionData.heading4 && (
              <span className="text-white">{sectionData.heading4}</span>
            )}
          </h2>
          <p
            ref={( el ) => {
              textsRef.current[2] = el
            }}
            className="max-w-md text-white/80 opacity-0 translate-y-6"
          >
            {sectionData.description || ''}
          </p>
          {sectionData.skills && sectionData.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 lg:gap-3 mt-2">
              {( sectionData.skills as Skill[] ).map( ( skill, idx ) => {
                return (
                  <div key={idx}
                    ref={( el ) => {
                      skillsRef.current[idx] = el
                    }}
                    className="relative w-6 lg:w-10 aspect-square opacity-0 scale-0"
                  >
                    {skill && (
                      <Image
                        src={imageUrl( skill?.image ) as string}
                        alt={skill?.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        fill
                      />
                    )}
                  </div>
                )
              } )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MainBanner
