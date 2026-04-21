'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useMousePos } from '../../hooks/useMousePos'
import { usePathname } from 'next/navigation'

// Inline SVG components from source
const ChevronSVG = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M9 18l6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const UPArrowSVG = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M7 17L17 7M17 7H7M17 7V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default function UIMouseCursor() {
  const pathname = usePathname()
  const { xpos, ypos } = useMousePos()
  const cursorRef = useRef<HTMLDivElement>(null)
  const shapeRef = useRef<HTMLDivElement>(null)

  const [dataName, setDataName] = useState('')
  const [dataText, setDataText] = useState('')
  const [isOver, setIsOver] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  const pos = useRef({ x: -100, y: -100 })
  const mouseRef = useRef({ x: -100, y: -100 })
  
  // A lock flag to detach the cursor from the raw mouse and snap it onto a physical element
  const isMagnetLocked = useRef(false)
  
  // State to safely manage client-side portal mounting in SSR
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Detect touch device explicitly
    if (typeof window !== 'undefined') {
      const isTouchDevice = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        window.matchMedia('(pointer: coarse)').matches

      if (isTouchDevice || window.innerWidth <= 768) {
        setShowCursor(false)
      }
    }
  }, [])

  // Force reset cursor state on navigation to prevent styles getting stuck
  useEffect(() => {
    setIsOver(false)
    setDataName('')
    setDataText('')
    isMagnetLocked.current = false
  }, [pathname])

  // Tween lagging 'pos' to real 'mouseRef', 'ypos'
  useEffect(() => {
    if (!showCursor) return
    
    // Smoothly track normal mouse pos UNLESS locked onto a magnetic target
    if (!isMagnetLocked.current) {
      mouseRef.current = { x: xpos, y: ypos }
    }

    // In case the cursor was just initialized, snap it to current position
    if (pos.current.x === -100 && pos.current.y === -100) {
      pos.current.x = xpos
      pos.current.y = ypos
      return
    }

    gsap.to(pos.current, {
      x: mouseRef.current.x,
      y: mouseRef.current.y,
      duration: 0.8,
      ease: 'power4.out',
    })
  }, [xpos, ypos, showCursor])

  // GSAP Ticker Loop
  useEffect(() => {
    if (!showCursor || !cursorRef.current) return

    const setX = gsap.quickSetter(cursorRef.current, 'x', 'px')
    const setY = gsap.quickSetter(cursorRef.current, 'y', 'px')
    const setScaleX = gsap.quickSetter(cursorRef.current, 'scaleX')
    const setScaleY = gsap.quickSetter(cursorRef.current, 'scaleY')
    const setRotation = gsap.quickSetter(cursorRef.current, 'rotation', 'deg')
    const setXPercent = gsap.quickSetter(cursorRef.current, 'xPercent')
    const setYPercent = gsap.quickSetter(cursorRef.current, 'yPercent')

    // Always keep dynamic inner shape cleanly centered on exact mouse
    setXPercent(-50)
    setYPercent(-50)

    const loop = () => {
      if (!shapeRef.current) return

      const velX = mouseRef.current.x - pos.current.x
      const velY = mouseRef.current.y - pos.current.y

      const distance = Math.hypot(velX, velY)
      const scale = Math.min(distance * 0.002, 0.2)

      // Use smooth subpixel positioning (no Math.round)
      setX(pos.current.x)
      setY(pos.current.y)

      if (!isOver) {
        // Dynamic squish pointing in movement direction
        setScaleX(1 + scale)
        setScaleY(1 - scale)
        const angle = Math.atan2(velY, velX) * (180 / Math.PI)
        setRotation(angle)
      } else {
        // Reset transform to let CSS handle hover interactions seamlessly
        setScaleX(1)
        setScaleY(1)
        setRotation(0)
      }
    }

    gsap.ticker.add(loop)
    return () => gsap.ticker.remove(loop)
  }, [showCursor, isOver, mounted])

  // Event Delegation for `.action` and `.magnet` elements
  useEffect(() => {
    if (!showCursor) return

    // Helper: fully reset all magnet targets back to resting position
    const resetAllMagnets = () => {
      isMagnetLocked.current = false
      document.querySelectorAll('.magnet-zone, .magnet').forEach((zone) => {
        const magnetTarget = (zone.querySelector('.magnet-target') as HTMLElement) || zone as HTMLElement
        gsap.to(magnetTarget, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
        const inner = magnetTarget.querySelector('.magnet-inner')
        if (inner) {
          gsap.to(inner, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
        }
      })
    }

    const handleMouseOver = (e: MouseEvent) => {
      // .action interaction
      const actionEl = (e.target as Element).closest(
        '[data-name]',
      ) as HTMLElement
      if (actionEl) {
        setIsOver(true)
        setDataName(actionEl.dataset.name || '')
        setDataText(actionEl.dataset.text || '')
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const actionEl = (e.target as Element).closest(
        '[data-name]',
      ) as HTMLElement
      if (actionEl) {
        // relatedTarget is null when the mouse leaves the window entirely
        const leftElement = !e.relatedTarget || !actionEl.contains(e.relatedTarget as Node)
        if (leftElement) {
          setIsOver(false)
          setDataName('')
          setDataText('')
        }
      }
    }

    const handleMagnetMove = (e: MouseEvent) => {
      // Support `.magnet-zone` for disjointed hover triggers, or default `.magnet` 
      const magnetZone = (e.target as Element).closest('.magnet-zone, .magnet') as HTMLElement
      
      if (magnetZone) {
        // Find the specific physical target that translates (defaults to itself if no inner target exists)
        const magnetTarget = (magnetZone.querySelector('.magnet-target') as HTMLElement) || magnetZone
        
        // 1. Check if the mouse is directly over the physical target
        const isHoveringTarget = magnetTarget.contains(e.target as Node) || magnetZone === magnetTarget

        // 2. Cursor Lock
        isMagnetLocked.current = true
        const targetRect = magnetTarget.getBoundingClientRect()
        mouseRef.current = {
          x: targetRect.left + targetRect.width / 2,
          y: targetRect.top + targetRect.height / 2
        }

        // 3. Physical Dragging
        const inner = magnetTarget.querySelector('.magnet-inner')

        if (isHoveringTarget) {
          // Calculate distance from the original resting center of the target
          const currentX = (gsap.getProperty(magnetTarget, 'x') as number) || 0
          const currentY = (gsap.getProperty(magnetTarget, 'y') as number) || 0
          
          const centerX = (targetRect.left - currentX) + targetRect.width / 2
          const centerY = (targetRect.top - currentY) + targetRect.height / 2
          
          const distanceX = e.clientX - centerX
          const distanceY = e.clientY - centerY

          gsap.to(magnetTarget, {
            x: distanceX * 0.4,
            y: distanceY * 0.4,
            duration: 0.6,
            ease: 'power3.out',
            force3D: true
          })

          if (inner) {
            gsap.to(inner, {
               x: distanceX * 0.15,
               y: distanceY * 0.15,
               duration: 0.6,
               ease: 'power3.out'
            })
          }
        } else {
          // Hovering the zone but outside the target itself -> reset physical position
          gsap.to(magnetTarget, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.4)'
          })

          if (inner) {
            gsap.to(inner, {
               x: 0,
               y: 0,
               duration: 0.8,
               ease: 'elastic.out(1, 0.4)'
            })
          }
        }
      }
    }

    const handleMagnetOut = (e: MouseEvent) => {
      const magnetZone = (e.target as Element).closest('.magnet-zone, .magnet') as HTMLElement
      if (magnetZone) {
        // relatedTarget is null when the mouse leaves the window entirely
        const leftZone = !e.relatedTarget || !magnetZone.contains(e.relatedTarget as Node)
        if (leftZone) {
          // Unlock the cursor so it gracefully returns to following the raw mouse
          isMagnetLocked.current = false
          
          const magnetTarget = (magnetZone.querySelector('.magnet-target') as HTMLElement) || magnetZone

          // Snap back instantly with dampening elasticity
          gsap.to(magnetTarget, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.4)'
          })

          const inner = magnetTarget.querySelector('.magnet-inner')
          if (inner) {
            gsap.to(inner, {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: 'elastic.out(1, 0.4)'
            })
          }
        }
      }
    }

    // Failsafe: when the mouse leaves the document viewport entirely (alt-tab, switch app),
    // force-reset everything so nothing stays stuck when the user comes back
    const handleDocumentLeave = () => {
      setIsOver(false)
      setDataName('')
      setDataText('')
      resetAllMagnets()
    }

    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mouseout', handleMouseOut)
    window.addEventListener('mousemove', handleMagnetMove)
    window.addEventListener('mouseout', handleMagnetOut)
    document.documentElement.addEventListener('mouseleave', handleDocumentLeave)
    window.addEventListener('blur', handleDocumentLeave)

    return () => {
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mouseout', handleMouseOut)
      window.removeEventListener('mousemove', handleMagnetMove)
      window.removeEventListener('mouseout', handleMagnetOut)
      document.documentElement.removeEventListener('mouseleave', handleDocumentLeave)
      window.removeEventListener('blur', handleDocumentLeave)
    }
  }, [showCursor])

  if (!showCursor || !mounted) return null

  // Shape class
  let shapeClass =
    'flex items-center justify-center rounded-full pointer-events-none origin-center will-change-transform shadow-md transition-all duration-1000 ease-[cubic-bezier(0.075,0.82,0.165,1)] backdrop-blur-md opacity-80 z-[9000] overflow-hidden '
  let textContainerClass =
    'flex items-center justify-center whitespace-nowrap opacity-100 font-normal '

  if (isOver && (dataName === 'proj' || dataName === 'reel')) {
    shapeClass +=
      ' w-[80px] h-[80px] bg-[#222222] border-transparent text-white'
    textContainerClass += ' text-white'
  } else if (isOver && dataName === 'menu') {
    shapeClass +=
      ' w-[70px] h-[70px] opacity-60 bg-black border-transparent text-white'
    textContainerClass += ' text-white'
  } else if (isOver && dataName === 'yo') {
    shapeClass += ' w-[70px] h-[70px] bg-black border-transparent text-white'
    textContainerClass += ' text-white'
  } else if (isOver && dataName === 'burger') {
    // Specifically styled to map to a burger icon overlay halo instead of totally vanishing
    shapeClass += ' w-[64px] h-[64px] border-[2px] border-[#F26B50] bg-transparent opacity-100'
  } else if (isOver && ['button', 'input'].includes(dataName)) {
    shapeClass += ' w-[0px] h-[0px] transition-none'
    textContainerClass += ' text-white'
  } else {
    // Premium dynamic cursor: inverted visibility over ANY colored background!
    shapeClass += ' w-[20px] h-[20px] bg-white border border-white mix-blend-difference'
  }

  return createPortal(
    <div
      ref={cursorRef}
      style={{ zIndex: 9999999 }} // Injected CSS directly assures the browser composite strictly enforces absolute top priority!
      className="fixed top-0 left-0 pointer-events-none font-mono text-[13px] font-normal"
    >
      <div ref={shapeRef} className={shapeClass}>
        <div className={textContainerClass}>
          {dataName === 'proj' && (
            <>
              {dataText === 'Prev' && (
                <ChevronSVG className="w-3 h-auto mr-[5px] rotate-180 flex-shrink-0" />
              )}
              {dataText}
              {dataText === 'Next' && (
                <ChevronSVG className="w-3 h-auto ml-[5px] flex-shrink-0" />
              )}
              {(dataText === 'View' || dataText === 'Lens') && (
                <UPArrowSVG className="w-5 h-auto ml-[5px] -mb-1 flex-shrink-0" />
              )}
            </>
          )}
          {dataName === 'menu' && dataText}
          {dataName === 'reel' && (
            <>
              <ChevronSVG className="w-3 h-auto mr-[5px] rotate-180 flex-shrink-0" />
              {dataText}
              <ChevronSVG className="w-3 h-auto ml-[5px] flex-shrink-0" />
            </>
          )}
          {dataName === 'yo' && dataText}
        </div>
      </div>
    </div>,
    document.body
  )
}
