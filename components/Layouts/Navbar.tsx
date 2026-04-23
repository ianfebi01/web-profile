'use client'

import { useEffect, useRef, useState, Fragment } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import { Site, Page } from '@/payload-types'
import { useTranslations } from 'next-intl'
import LocaleSwitcher from './LocaleSwitcher'
import { Link } from '@/i18n/navigation'
import { cn, openNewTab } from '@/lib/utils'
import { useLenis } from 'lenis/react'
import { Disclosure, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import constructNavUrl from '@/utils/construct-nav-url'

export interface NavItemType {
  name?: string
  page?: any
  newTab?: boolean
  url?: string
  pageAnchor?: string | null
  description?: string | null
}

export interface NavCategoryType {
  categoryName?: string
  navItem?: any
  navItems?: NavItemType[]
}

interface Props {
  items: NavCategoryType[]
  socials: NonNullable<Site['socialPlatformLinks']>
}

const Navbar = ( { items, socials }: Props ) => {
  const [isOpen, setIsOpen] = useState( false )
  const navbarRef = useRef<HTMLElement>( null )
  const isHiddenRef = useRef( false )
  const itemsRefs = useRef<HTMLButtonElement[] | HTMLDivElement[] | null[]>( [] )

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
  }, [isOpen] )

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
      {/* 
        1. Unified Navbar Header Layer
        Runs at an extremely high local root z-index to stay fundamentally above the drawer overlay.
      */}
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

      {/* 
        2. Unified Drawer Overlay Layer
        Since it's built inside the identical component root, it perfectly guarantees the header physically overlaps it!
      */}
      <div 
        className={cn(
          "fixed inset-0 z-[80] transition-all duration-500",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isOpen}
      >
        {/* Animated Background Drop */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen( false )}
        />

        {/* Elegant Slide-In Panel */}
        <div 
          className={cn(
            "absolute inset-y-0 right-0 w-full sm:max-w-sm bg-blue-dark bg-dark pt-28 px-6 lg:px-8 overflow-y-auto flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)]",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex mt-6 grow">
            <div className="flex flex-col items-center justify-center mb-6 overflow-hidden text-xl font-bold text-white grow">
              <div className="flex w-full mt-6 grow">
                <div className="flex flex-col w-full gap-4 py-6">
                  <div className="flex flex-col w-full h-full gap-4 text-white">
                    {items?.map( ( item, key ) => (
                      <div
                        key={key}
                        ref={el => {
                          ( itemsRefs.current[key] = el );
                        }}
                        className="opacity-0 translate-y-[50px] will-change-transform"
                      >
                        {!!item.categoryName && item.navItems && item.navItems.length > 0 ? (
                          <Disclosure as="div">
                            {( { open } ) => (
                              <dl
                                className={`py-2 hover:bg-dark-secondary rounded-lg overflow-x-clip transition-all duration-300 ease-in-out ${
                                  open ? 'bg-dark-secondary' : ''
                                }`}
                              >
                                <dt>
                                  <Disclosure.Button className="flex items-start justify-between w-full text-left text-white">
                                    {( !item.navItem?.url && !item.navItem?.page ) ? (
                                      <div className={cn( 'h3 pl-4 no-underline cursor-default' )}>
                                        {item.categoryName}
                                      </div>
                                    ) : (
                                      <Link
                                        href={constructNavUrl( item.navItem ) || ''}
                                        className={cn(
                                          'h3 pl-4 underline-offset-4',
                                          !constructNavUrl( item.navItem )
                                            ? 'no-underline pointer-events-none'
                                            : 'no-underline hover:underline pointer-events-auto'
                                        )}
                                        aria-disabled={!constructNavUrl( item.navItem )}
                                        tabIndex={
                                          !constructNavUrl( item.navItem ) ? -1 : undefined
                                        }
                                        onClick={() => setIsOpen( false )}
                                      >
                                        {item.categoryName}
                                      </Link>
                                    )}
                                    <span className="flex items-center pr-4 ml-6 h-7 text-soft-grey hover:text-blue-dark">
                                      <FontAwesomeIcon
                                        className={`size-4 transition-all ease-in-out ${
                                          open ? '-rotate-45' : ''
                                        }`}
                                        aria-hidden="true"
                                        icon={faPlusCircle}
                                      />
                                    </span>
                                  </Disclosure.Button>
                                </dt>
                                <dd>
                                  <Transition
                                    enterFrom="transform max-h-0 opacity-0"
                                    enterTo="transform max-h-[500px] opacity-100 duration-500 ease-out"
                                    leaveFrom="transform max-h-[500px] opacity-100"
                                    leaveTo="transform max-h-0 opacity-0 duration-500 ease-out"
                                  >
                                    <Disclosure.Panel
                                      as="div"
                                      className="flex overflow-y-hidden"
                                    >
                                      <div className="px-4 my-4 text-xs lg:text-[1.1rem] ml-4">
                                        <div className="flex flex-col gap-4">
                                          {item.navItems?.map(
                                            ( subItem: NavItemType, indexSubitem: number ) => (
                                              <Link
                                                key={indexSubitem}
                                                href={constructNavUrl( subItem )}
                                                className="block m-0 no-underline p underline-offset-4 decoration-2 hover:underline"
                                                target={subItem?.newTab ? '_blank' : undefined}
                                                rel={subItem?.newTab ? 'noopener noreferrer' : undefined}
                                                onClick={() => setIsOpen( false )}
                                              >
                                                {subItem?.name || ( subItem.page as Page )?.title}
                                              </Link>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </Disclosure.Panel>
                                  </Transition>
                                </dd>
                              </dl>
                            )}
                          </Disclosure>
                        ) : ( !!item.categoryName && ( item.navItem?.url || item.navItem?.page ) ) ? (
                          <Link
                            href={constructNavUrl( item.navItem ) || ''}
                            className={cn(
                              'h3 px-4 underline-offset-4 w-full block',
                              'py-2 hover:bg-dark-secondary rounded-lg overflow-x-clip transition-all duration-300 ease-in-out',
                              !constructNavUrl( item.navItem )
                                ? 'no-underline pointer-events-none'
                                : 'no-underline hover:underline pointer-events-auto'
                            )}
                            aria-disabled={!constructNavUrl( item.navItem )}
                            tabIndex={!constructNavUrl( item.navItem ) ? -1 : undefined}
                            onClick={() => setIsOpen( false )}
                          >
                            {item.categoryName}
                          </Link>
                        ) : (
                          <div
                            className={cn(
                              'h3 px-4 underline-offset-4 w-full block',
                              'py-2 hover:bg-dark-secondary rounded-lg overflow-x-clip transition-all duration-300 ease-in-out cursor-default'
                            )}
                          >
                            {item.categoryName}
                          </div>
                        )}
                      </div>
                    ) )}
                  </div>
                </div>
              </div>
              
              {/* Dynamic Socials Insertion */}
              {socials.map( ( item, index ) => (
                <button
                  ref={el => {
                    ( itemsRefs.current[items.length + index] = el );
                  }}
                  onClick={() => openNewTab( item.url )}
                  className={cn(
                    'opacity-0 translate-y-[50px] will-change-transform',
                    'flex items-center rounded-lg overflow-hidden mt-4',
                    'focus:outline-none focus-visible:ring-0'
                  )}
                  tabIndex={-1}
                  key={index}
                >
                  <p className="m-0 h3">{item.platform}</p>
                </button>
              ) )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
