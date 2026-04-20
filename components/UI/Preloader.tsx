'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { useLenis } from 'lenis/react'

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  
  const preloaderRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()

  useEffect(() => {
    if (lenis) {
      lenis.stop()
    }

    const counter = { value: 0 }
    let loadComplete = document.readyState === 'complete'
    let counterComplete = false

    const animateOut = () => {
      setTimeout(() => {
        if (!preloaderRef.current || !pathRef.current) return

        const tl = gsap.timeline({
          onComplete: () => {
            setIsLoading(false)
            if (lenis) {
              lenis.start()
              import('gsap/ScrollTrigger').then((st) => {
                st.ScrollTrigger.refresh()
              })
            }
          }
        })

        // Hold entirely still for a short beat after reaching 100%
        tl.addLabel("start", "+=0.4")

        // 1. Snappily translate up the hiding characters
        tl.to('.char-hide .inner-char', {
          yPercent: -100,
          duration: 0.8,
          stagger: 0.02,
          ease: 'expo.inOut'
        }, "start")

        // 2. Collapse the width simultaneously with a slight stagger
        tl.to('.char-hide', {
          width: 0,
          opacity: 0,
          duration: 0.8,
          ease: 'expo.inOut'
        }, "start+=0.1")

        // 3. Drop the wave curtain down and translate the "IFS." container up
        // Notice it starts exactly as the collapse completes its aggressive flick
        const curveData = { y: 0 }
        tl.to(curveData, {
          y: 1,
          duration: 1.4,
          ease: 'expo.inOut',
          onUpdate: () => {
            const depth = 0.4
            const cy = curveData.y + Math.sin(curveData.y * Math.PI) * depth
            if (pathRef.current) {
              pathRef.current.setAttribute('d', `M 0 ${curveData.y} Q 0.5 ${cy} 1 ${curveData.y} L 1 1 L 0 1 Z`)
            }
          }
        }, "start+=0.3")

        if (contentRef.current) {
          tl.to(contentRef.current, {
            yPercent: -100,
            duration: 1.4,
            ease: 'expo.inOut'
          }, "start+=0.3")
        }
      }, 0) // No need for double timeout pause, GSAP timeline handles it
    }

    const checkComplete = () => {
      if (loadComplete && counterComplete) {
        animateOut()
      }
    }

    // Fake progress animation
    gsap.to(counter, {
      value: 100,
      duration: 2.5,
      ease: 'power2.out',
      onUpdate: () => {
        setProgress(Math.round(counter.value))
      },
      onComplete: () => {
        counterComplete = true
        checkComplete()
      },
    })

    const handleLoad = () => {
      loadComplete = true
      checkComplete()
    }

    if (!loadComplete) {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [lenis])

  if (!isLoading) return null

  const nameText = "Ian Febi S.".split('')
  // target indices: I(0), F(4), S(9), .(10)
  const targetIndices = [0, 4, 9, 10]

  return (
    <>
      {/* SVG defining the clip path (hidden from flow) */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="wave-clip" clipPathUnits="objectBoundingBox">
            <path ref={pathRef} d="M 0 0 Q 0.5 0 1 0 L 1 1 L 0 1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        ref={preloaderRef}
        style={{ clipPath: 'url(#wave-clip)' }}
        className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center text-black"
      >
        <div ref={contentRef} className="relative flex flex-col items-center justify-center w-full h-full">
          <h1 className="flex justify-center text-4xl md:text-6xl lg:text-8xl font-normal xs:tracking-tight sm:tracking-normal md:tracking-[0.1em] uppercase whitespace-nowrap px-4 w-full">
            {nameText.map((char, i) => {
              const isTarget = targetIndices.includes(i)
              return (
                <span
                  key={i}
                  className={`inline-flex overflow-hidden ${isTarget ? 'char-target' : 'char-hide'}`}
                >
                  <span className="inner-char whitespace-pre">{char}</span>
                </span>
              )
            })}
          </h1>

          <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex items-center justify-center gap-2 font-mono text-xl md:text-3xl font-medium">
            <span>{String(progress).padStart(3, '0')}</span>
            <svg 
              viewBox="0 0 24 24" 
              className="w-[1.2em] h-[1.2em] stroke-black"
              fill="none"
            >
              <line x1="6" y1="2" x2="18" y2="2" strokeWidth="2" />
              <line x1="6" y1="22" x2="18" y2="22" strokeWidth="2" />
              <line x1="2" y1="6" x2="2" y2="18" strokeWidth="2" />
              <line x1="22" y1="6" x2="22" y2="18" strokeWidth="2" />
              <line x1="2" y1="22" x2="22" y2="2" strokeWidth="2" />
              <rect x="3" y="3" width="3" height="3" className="fill-black stroke-none" />
              <rect x="18" y="18" width="3" height="3" className="fill-black stroke-none" />
            </svg>
          </div>
        </div>
      </div>
    </>
  )
}
