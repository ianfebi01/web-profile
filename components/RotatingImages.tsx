'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import CircleGrids, { CircleGridsHandle } from '@/components/Icons/CircleGrids'
import { gsap } from 'gsap'

const RotatingImages = () => {
  const profileImages = useRef<HTMLElement[] | null[]>( [] )
  const circleGridsRef = useRef<CircleGridsHandle>( null )
  const circleGridsContainerRef = useRef<HTMLDivElement>( null )

  useEffect( () => {
    const ctx = gsap.context( () => {
      const tl = gsap.timeline( {
        repeat : -1,
        delay  : 1,
      } )

      // Forward
      tl.call( () => {
        circleGridsRef.current?.replay()
      } )

      tl.to(
        profileImages.current.reverse(),
        {
          duration : 1,
          stagger  : 2,
          rotate   : 0,
          ease     : 'power4.inOut',
        },
        '<',
      )

      tl.to(
        circleGridsContainerRef.current,
        {
          rotate   : 180,
          duration : 1,
          width    : '75%',
          ease     : 'power4.inOut',
        },
        '<+=1',
      )

      tl.to(
        circleGridsContainerRef.current,
        {
          rotate   : -180,
          duration : 1,
          width    : '100%',
          ease     : 'power4.inOut',
        },
        '<+=2',
      )

      // Backward
      tl.call( () => {
        circleGridsRef.current?.replay()
      } )

      tl.to( circleGridsContainerRef.current, {
        rotate   : 180,
        duration : 1,
        width    : '50%',
        ease     : 'power4.inOut',
      } )

      tl.to( profileImages.current, {
        duration : 1,
        stagger  : 2,
        rotate   : ( i ) => {
          if ( i === 0 ) return 45
          if ( i === 1 ) return -90
          if ( i === 2 ) return 90

          return 0
        },
        ease : 'power4.inOut',
      } )

      tl.to(
        circleGridsContainerRef.current,
        {
          rotate   : -180,
          duration : 1,
          width    : '75%',
          ease     : 'power4.inOut',
        },
        '<+=1',
      )

      tl.to(
        circleGridsContainerRef.current,
        {
          rotate   : 0,
          duration : 1,
          width    : '100%',
          ease     : 'power4.inOut',
        },
        '<+=2',
      )

      tl.to( circleGridsContainerRef.current, {
        rotate   : 180,
        duration : 1,
        width    : '50%',
        ease     : 'power4.inOut',
      } )
    } )

    return () => ctx.revert()
  }, [] )

  return (
    <div className="rounded-full bg-dark-secondary/50 shadow-2xl aspect-square max-w-[500px] w-full flex flex-col p-8">
      <div className="relative w-full h-full">
        <div
          ref={( el ) => {
            profileImages.current[0] = el
          }}
          className="aspect-square w-full overflow-hidden absolute inset-x-0 mx-auto inset-y-0 my-auto rounded-full bg-dark-secondary/60 rotate-90"
        >
          <Image
            src={'/ian-no-bg-mono.png'}
            alt="Ian"
            layout="fill"
            objectFit="contain"
            className="w-full h-full"
          />
        </div>
        <div
          ref={( el ) => {
            profileImages.current[1] = el
          }}
          className="aspect-square w-full overflow-hidden absolute inset-x-0 mx-auto inset-y-0 my-auto rounded-full -rotate-90"
        >
          <div className="[clip-path:circle(35%_at_50%_50%)] w-full h-full bg-dark-secondary/80">
            <Image
              src="/ian-no-bg-mono.png"
              alt="Ian"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div
          ref={( el ) => {
            profileImages.current[2] = el
          }}
          className="aspect-square w-full overflow-hidden absolute inset-x-0 mx-auto inset-y-0 my-auto rounded-full rotate-45"
        >
          <div className="[clip-path:circle(25%_at_50%_50%)] w-full h-full bg-dark-secondary/90">
            <Image
              src="/ian-no-bg-mono.png"
              alt="Ian"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div
          ref={circleGridsContainerRef}
          className="aspect-square w-1/2 p-1 absolute inset-x-0 mx-auto inset-y-0 my-auto text-white"
        >
          <CircleGrids ref={circleGridsRef}
            play={false}
          />
        </div>
      </div>
    </div>
  )
}

export default RotatingImages
