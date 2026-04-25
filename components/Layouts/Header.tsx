'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useLenis } from 'lenis/react'
import LocaleSwitcher from './LocaleSwitcher'
import HeaderPanel from './HeaderPanel'
import {
  MenuAnchorType,
  NavCategoryType,
  SocialLinksType,
} from '@/types/header'

interface Props {
  items: NavCategoryType[]
  socials: SocialLinksType
}

const Header = ( { items, socials }: Props ) => {
  const [isOpen, setIsOpen] = useState( false )
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchorType | null>( null )
  const navbarRef = useRef<HTMLElement>( null )
  const menuTriggerRef = useRef<HTMLDivElement>( null )
  const isHiddenRef = useRef( false )
  const itemsRefs = useRef<HTMLButtonElement[] | HTMLDivElement[] | null[]>( [] )

  const syncMenuAnchor = useCallback( () => {
    if ( !menuTriggerRef.current ) return

    const rect = menuTriggerRef.current.getBoundingClientRect()

    setMenuAnchor( {
      top    : rect.top,
      right  : window.innerWidth - rect.right,
      width  : rect.width,
      height : rect.height,
    } )
  }, [] )

  // Animate stagger items flawlessly when opening the new unified drawer
  useEffect( () => {
    const targets = itemsRefs.current.filter( Boolean ) as HTMLElement[]
    if ( isOpen ) {
      gsap.fromTo( targets, 
        { opacity : 0, y : 50 },
        {
          opacity  : 1,
          y        : 0,
          duration : 0.5,
          ease     : 'power2.out',
          stagger  : 0.1,
          delay    : 0.2 // waits gracefully for drawer slide to enter
        } 
      )
    } else {
      gsap.set( targets, { opacity : 0, y : 50 } )
    }
  }, [isOpen] )

  // Instantly force the Navbar to be visible when the menu is toggled open!
  useEffect( () => {
    if ( isOpen && isHiddenRef.current ) {
      isHiddenRef.current = false
      gsap.to( navbarRef.current, {
        y        : 0,
        opacity  : 1,
        duration : 0.5,
        ease     : 'power2.out',
      } )
    }

    syncMenuAnchor()
  }, [isOpen, syncMenuAnchor] )

  useEffect( () => {
    syncMenuAnchor()

    if ( !menuTriggerRef.current ) return

    const resizeObserver = new ResizeObserver( syncMenuAnchor )

    resizeObserver.observe( menuTriggerRef.current )
    window.addEventListener( 'resize', syncMenuAnchor )

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener( 'resize', syncMenuAnchor )
    }
  }, [syncMenuAnchor] )

  useLenis( ( { scroll, direction } ) => {
    // Never hide the Navbar header while the integrated mobile drawer is actively open
    if ( isOpen ) return

    if ( scroll < 100 || direction === -1 ) {
      // Show navbar if it's currently hidden
      if ( isHiddenRef.current ) {
        isHiddenRef.current = false
        gsap.to( navbarRef.current, {
          y        : 0,
          opacity  : 1,
          duration : 0.5,
          ease     : 'power2.out',
        } )
      }
    } else if ( direction === 1 && scroll > 100 ) {
      // Hide navbar completely up past its bounds
      if ( !isHiddenRef.current ) {
        isHiddenRef.current = true
        gsap.to( navbarRef.current, {
          y        : -100,
          opacity  : 0,
          duration : 0.5,
          ease     : 'power2.inOut',
        } )
      }
    }
  } )

  return (
    <>
      <nav
        ref={navbarRef}
        className={cn(
          'fixed top-0 w-full h-24 z-[100] transition-colors duration-500 pointer-events-none',
          isOpen ? 'bg-transparent' : 'bg-transparent'
        )}
      >
        <div className="flex items-center justify-between h-full px-6 md:px-12 mx-auto max-w-[1600px] pointer-events-auto pt-6">
          <Link href={'/'}
            onClick={() => setIsOpen( false )}
            className="relative z-50"
          >
            <Image src="/Logo.svg"
              alt="Logo image"
              width={45}
              height={45}
            />
          </Link>
          
          <div className="flex items-center gap-6">
            <div className={cn( "hidden sm:block transition-opacity duration-300", isOpen ? "opacity-0 pointer-events-none" : "opacity-100" )}>
              <LocaleSwitcher />
            </div>

            <div
              ref={menuTriggerRef}
              className="magnet-zone flex items-center gap-4 p-4 -m-4 cursor-pointer group w-fit relative z-50"
              data-name="burger"
              onClick={() => setIsOpen( !isOpen )}
            >
              <span className="text-[15px] font-bold text-white group-hover:text-[#F26B50] transition-colors hidden sm:block pointer-events-none mt-1">
                Menu
              </span>

              <button
                className="magnet-target group/target flex items-center justify-center w-12 h-12 rounded-full bg-transparent text-white"
                aria-label="Toggle Menu"
              >
                {/* 3-dot to X physical transformation layout */}
                <div className="relative flex items-center justify-center w-[26px] h-[26px] pointer-events-none">
                  <span className={cn(
                    "absolute transition-all duration-300 ease-out bg-white",
                    isOpen 
                      ? "left-0 w-[26px] h-[2px] rotate-45 rounded-sm" 
                      : "left-0 w-1.5 h-1.5 rounded-full group-hover/target:translate-x-[10px]"
                  )}
                  ></span>
                  
                  <span className={cn(
                    "absolute transition-all duration-300 ease-out bg-white z-10",
                    isOpen ? "w-0 h-0 opacity-0" : "w-1.5 h-1.5 rounded-full"
                  )}
                  ></span>
                  
                  <span className={cn(
                    "absolute transition-all duration-300 ease-out bg-white",
                    isOpen 
                      ? "right-0 w-[26px] h-[2px] -rotate-45 rounded-sm" 
                      : "right-0 w-1.5 h-1.5 rounded-full group-hover/target:-translate-x-[10px]"
                  )}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <HeaderPanel
        isOpen={isOpen}
        items={items}
        socials={socials}
        itemsRefs={itemsRefs}
        menuAnchor={menuAnchor}
        setIsOpen={setIsOpen}
      />
    </>
  )
}

export default Header
