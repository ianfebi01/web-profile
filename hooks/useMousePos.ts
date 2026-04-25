'use client'

import { useState, useEffect } from 'react'

export function useMousePos() {
  const [mousePos, setMousePos] = useState( { xpos : 0, ypos : 0 } )

  useEffect( () => {
    const handleMouseMove = ( e: MouseEvent ) => {
      setMousePos( { xpos : e.clientX, ypos : e.clientY } )
    }

    window.addEventListener( 'mousemove', handleMouseMove )

    return () => {
      window.removeEventListener( 'mousemove', handleMouseMove )
    }
  }, [] )

  return mousePos
}
