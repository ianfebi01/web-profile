'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'lenis/dist/lenis.css'
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin( ScrollTrigger )

// Below this width Lenis is not instantiated at all: touch devices keep their
// native momentum scrolling instead of fighting it through syncTouch.
const MOBILE_QUERY = '(max-width: 767px)'

export default function SmoothScrollProvider( {
  children,
}: {
  children: React.ReactNode
} ) {
  const pathname = usePathname()
  const lenisRef = useRef<LenisRef>( null )

  // Starts disabled so nothing is created during hydration, then resolves on
  // mount. Lenis is mounted as a sibling of `children` (see below), so
  // toggling it never remounts the app.
  const [enabled, setEnabled] = useState( false )

  useEffect( () => {
    const mediaQuery = window.matchMedia( MOBILE_QUERY )
    const sync = () => setEnabled( !mediaQuery.matches )

    sync()
    mediaQuery.addEventListener( 'change', sync )

    return () => mediaQuery.removeEventListener( 'change', sync )
  }, [] )

  useEffect( () => {
    if ( !enabled ) return

    function update( time: number ) {
      // gsap ticker gives time in seconds, let's multiply by 1000 to get ms.
      lenisRef.current?.lenis?.raf( time * 1000 )
    }

    gsap.ticker.add( update )
    gsap.ticker.lagSmoothing( 0 )

    return () => {
      gsap.ticker.remove( update )
      // Restore gsap's defaults so native scrolling is not left running an
      // unthrottled ticker.
      gsap.ticker.lagSmoothing( 500, 33 )
    }
  }, [enabled] )

  // Scroll positions are measured differently with and without Lenis.
  useEffect( () => {
    const refresh = requestAnimationFrame( () => ScrollTrigger.refresh() )

    return () => cancelAnimationFrame( refresh )
  }, [enabled] )

  useLenis( ScrollTrigger.update )

  useEffect( () => {
    const lenis = lenisRef.current?.lenis

    if ( lenis ) {
      lenis.scrollTo( 0, { immediate : true } )
    } else {
      window.scrollTo( 0, 0 )
    }
  }, [pathname] )

  return (
    <>
      {enabled && (
        <ReactLenis
          root
          ref={lenisRef}
          autoRaf={false}
          options={{
            syncTouch          : true,
            touchMultiplier    : 1.2,
            wheelMultiplier    : 1,
            duration           : 1.2,
            easing             : ( t ) => Math.min( 1, 1.001 - Math.pow( 2, -10 * t ) ),
            orientation        : 'vertical',
            gestureOrientation : 'vertical',
            smoothWheel        : true,
          }}
        />
      )}
      {children}
    </>
  )
}
