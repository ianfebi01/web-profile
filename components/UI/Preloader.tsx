'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { useLenis } from 'lenis/react'

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const preloaderRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    // Prevent scrolling while preloader is active
    if (lenis) {
      lenis.stop()
    }

    const animateOut = () => {
      // Add a tiny delay to ensure everything settles and to prevent instant flashing on fast connections
      setTimeout(() => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            yPercent: -100,
            duration: 1.2,
            ease: 'power4.inOut',
            onComplete: () => {
              setIsLoading(false)
              if (lenis) {
                lenis.start()
                // Force ScrollTrigger to refresh its calculations now that the UI is fully visible
                // This prevents the bug where animations trigger at wrong positions
                // because they were calculated before the page fully rendered
                import('gsap/ScrollTrigger').then((st) => {
                  st.ScrollTrigger.refresh()
                })
              }
            },
          })
        }
      }, 200)
    }

    if (document.readyState === 'complete') {
      animateOut()
    } else {
      window.addEventListener('load', animateOut)
      return () => window.removeEventListener('load', animateOut)
    }
  }, [lenis])

  if (!isLoading) return null

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-dark text-white"
    >
      {/* Modern minimal spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-orange rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="mt-6 text-sm font-medium text-orange uppercase opacity-80 animate-pulse">
        Loading
      </div>
    </div>
  )
}
