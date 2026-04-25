'use client'
import { FunctionComponent, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin( ScrollTrigger )
gsap.registerPlugin( TextPlugin );

const ProfileBanner: FunctionComponent = () => {
  const sectionRef = useRef<HTMLElement>( null )
  const contentRef = useRef<HTMLDivElement>( null )
  const squareRef = useRef<HTMLDivElement>( null )
  const codeTextRef = useRef<HTMLElement>( null )
  const textsRef = useRef<HTMLElement[] | null[]>( [] )

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
        duration : 0.8,
        ease     : 'power2.inOut',
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
      <div ref={contentRef}
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
        <div
          className="flex-1 h-full flex flex-col justify-center gap-4"
        >
          <h1
            ref={( el ) => {
              textsRef.current[0] = el
            }}
            className="text-5xl lg:text-7xl font-normal m-0 opacity-0 translate-y-6"
          >
            Pixel{' '}
            <span className="font-code font-thin text-orange">Perfect</span>
            <br />
          </h1>
          <h2
            ref={( el ) => {
              textsRef.current[1] = el
            }}
            className="text-5xl lg:text-7xl font-normal m-0 opacity-0 translate-y-6"
          >
            <span className="text-orange">Frontend</span> dev.
          </h2>
          <p
            ref={( el ) => {
              textsRef.current[2] = el
            }}
            className="max-w-md text-white/80 opacity-0 translate-y-6"
          >
            Hello world! I&apos;m Ian Febi, a frontend developer dedicated to
            crafting pixel-perfect, high-performance web experiences. With over
            3 years of hands-on expertise, I transform ideas into scalable,
            robust, and visually engaging applications.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProfileBanner
