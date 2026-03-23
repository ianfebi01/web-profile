'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useMousePos } from '../../hooks/useMousePos'

export default function UIMouseCursor() {
  const { xpos, ypos } = useMousePos()
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorInnerRef = useRef<HTMLDivElement>(null)
  
  const [showCursor, setShowCursor] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverText, setHoverText] = useState('')

  // The lagging pos object we tween towards real mouse
  const pos = useRef({ x: -100, y: -100 }) // Start offscreen
  const mouseRef = useRef({ x: -100, y: -100 })

  // Disable on mobile/touch devices
  useEffect(() => {
    const handleTouch = () => {
      setShowCursor(false)
    }
    window.addEventListener('touchstart', handleTouch, { once: true })
    return () => {
      window.removeEventListener('touchstart', handleTouch)
    }
  }, [])

  // Tween lagging 'pos' to real 'xpos', 'ypos'
  useEffect(() => {
    if (!showCursor) return
    mouseRef.current = { x: xpos, y: ypos }
    
    // In case the cursor was just initialized, snap it to current position to avoid flying from top left
    if (pos.current.x === -100 && pos.current.y === -100) {
      pos.current.x = xpos
      pos.current.y = ypos
      return
    }

    gsap.to(pos.current, {
      x: xpos,
      y: ypos,
      duration: 0.2,
      ease: 'power4.out'
    })
  }, [xpos, ypos, showCursor])

  // Ticker for physics and updating element style
  useEffect(() => {
    if (!showCursor || !cursorRef.current) return

    const el = cursorRef.current
    const setX = gsap.quickSetter(el, 'x', 'px')
    const setY = gsap.quickSetter(el, 'y', 'px')
    const setScaleX = gsap.quickSetter(el, 'scaleX')
    const setScaleY = gsap.quickSetter(el, 'scaleY')
    const setRotation = gsap.quickSetter(el, 'rotation', 'deg')

    const updateCursor = () => {
      // Calculate velocity/distance between lagging pos and real coords
      const velX = mouseRef.current.x - pos.current.x
      const velY = mouseRef.current.y - pos.current.y
      
      const distance = Math.hypot(velX, velY)
      // Cap scale at a maximum value like 0.2
      const scale = Math.min(distance * 0.002, 0.2)
      
      // Center cursor visually
      setX(pos.current.x)
      setY(pos.current.y)

      if (!isHovering) {
        setScaleX(1 + scale)
        setScaleY(1 - scale)
        const angle = Math.atan2(velY, velX) * (180 / Math.PI)
        setRotation(angle)
      } else {
        setScaleX(1)
        setScaleY(1)
        setRotation(0)
      }
    }

    gsap.ticker.add(updateCursor)
    return () => {
      gsap.ticker.remove(updateCursor)
    }
  }, [showCursor, isHovering])

  // Hover states for .action and .magnet
  useEffect(() => {
    if (!showCursor) return

    const actions = document.querySelectorAll('.action')
    const magnets = document.querySelectorAll('.magnet')

    const handleActionEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement
      setIsHovering(true)
      
      const text = target.dataset.text || target.dataset.name || ''
      setHoverText(text)
      
      gsap.to(cursorInnerRef.current, {
        scale: 4,
        duration: 0.3,
        ease: 'power3.out'
      })
    }

    const handleActionLeave = () => {
      setIsHovering(false)
      setHoverText('')
      gsap.to(cursorInnerRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power3.out'
      })
    }

    const handleMagnetMove = (e: Event) => {
      const mouseEvent = e as MouseEvent
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const distanceX = mouseEvent.clientX - centerX
      const distanceY = mouseEvent.clientY - centerY

      gsap.to(target, {
        x: distanceX * 0.3,
        y: distanceY * 0.3,
        duration: 0.4,
        ease: 'power2.out'
      })
    }

    const handleMagnetLeave = (e: Event) => {
      const target = e.currentTarget as HTMLElement
      gsap.to(target, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)'
      })
    }

    actions.forEach(el => {
      el.addEventListener('mouseenter', handleActionEnter)
      el.addEventListener('mouseleave', handleActionLeave)
    })

    magnets.forEach(el => {
      // It is important to attach move/leave directly on the magnet component 
      // so it resets gracefully when exiting the specific node!
      el.addEventListener('mousemove', handleMagnetMove)
      el.addEventListener('mouseleave', handleMagnetLeave)
    })

    return () => {
      actions.forEach(el => {
        el.removeEventListener('mouseenter', handleActionEnter)
        el.removeEventListener('mouseleave', handleActionLeave)
      })

      magnets.forEach(el => {
        el.removeEventListener('mousemove', handleMagnetMove)
        el.removeEventListener('mouseleave', handleMagnetLeave)
      })
    }
  }, [showCursor])

  if (!showCursor) return null

  // Mix-blend difference is commonly used for these kinds of custom cursors against both dark and light modes
  // pointer-events: none is extremely important here so it doesn't hook clicks.
  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 will-change-transform mix-blend-difference"
    >
      <div 
        ref={cursorInnerRef}
        className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-black font-medium text-[4px] will-change-transform text-center"
      >
        {isHovering && hoverText && (
          <span className="opacity-100 whitespace-nowrap px-1">{hoverText}</span>
        )}
      </div>
    </div>
  )
}
