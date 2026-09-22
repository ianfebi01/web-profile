'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MyPosYProps {
  myposy?: number
  winheight?: number
}

const SectionProvider = ( {
  children,
}: {
  children: React.ReactElement<MyPosYProps>[] | React.ReactElement<MyPosYProps>
} ) => {
  const [winHeight, setWinHeight] = useState<number>( 0 )
  const [myPosY, setMyPosY] = useState<number>( 0 )

  const sectionRef = useRef<HTMLDivElement>( null )

  useEffect( () => {
    function handleScroll() {
      if ( sectionRef.current ) {
        const { top } = sectionRef.current?.getBoundingClientRect() as DOMRect
        setMyPosY( top )
      }
    }

    function handleResize() {
      setWinHeight( window.innerHeight )
    }
    
    // Read the viewport only after mount, so the server and the first client
    // render agree.
    handleResize()

    // Initialize and track events
    window.addEventListener( 'scroll', handleScroll )
    window.addEventListener( 'resize', handleResize )

    // Cleanup function
    return () => {
      window.removeEventListener( 'scroll', handleScroll )
      window.removeEventListener( 'resize', handleResize )
    }
  }, [] )

  return (
    <div ref={sectionRef}>
      {React.Children.map( children, ( child ) => {
        // Only component children can read these props. A server component
        // arrives here already rendered, so cloning onto its host element would
        // emit `myposy`/`winheight` as DOM attributes and break hydration.
        if ( React.isValidElement( child ) && typeof child.type !== 'string' ) {
          return React.cloneElement( child, {
            myposy    : myPosY,
            winheight : winHeight,
          } ) // Passing myPosY to React child components
        }

        return child
      } )}
    </div>
  )
}

export default SectionProvider
