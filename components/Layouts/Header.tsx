'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useLenis } from 'lenis/react'
import LocaleSwitcher from './LocaleSwitcher'
import HeaderMenuButton from './HeaderMenuButton'
import HeaderPanel from './HeaderPanel'
import {
  MenuAnchorType,
  NavCategoryType,
  SocialLinksType,
} from '@/types/header'
import ThemeToggle from '../ThemeToggle'
import constructNavUrl from '@/utils/construct-nav-url'

interface Props {
  items: NavCategoryType[]
  socials: SocialLinksType
}

const Header = ( { items, socials }: Props ) => {
  const [isOpen, setIsOpen] = useState( false )
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchorType | null>( null )
  const [isScrolled, setIsScrolled] = useState( false )
  const pathname = usePathname()
  const navbarRef = useRef<HTMLElement>( null )
  const menuTriggerRef = useRef<HTMLDivElement>( null )
  const isHiddenRef = useRef( false )
  const itemsRefs = useRef<HTMLButtonElement[] | HTMLDivElement[] | null[]>( [] )
  const itemsCount = items.length

  const syncMenuAnchor = useCallback( () => {
    if ( !menuTriggerRef.current ) return

    // The trigger is a padded hover zone (p-4 -m-4); measure its content box so the
    // panel lines up with the visible button rather than the invisible padding
    const zone = menuTriggerRef.current
    const rect = zone.getBoundingClientRect()
    const style = window.getComputedStyle( zone )
    const paddingTop = parseFloat( style.paddingTop )
    const paddingRight = parseFloat( style.paddingRight )
    const paddingBottom = parseFloat( style.paddingBottom )
    const paddingLeft = parseFloat( style.paddingLeft )

    setMenuAnchor( {
      top    : rect.top + paddingTop,
      right  : window.innerWidth - rect.right + paddingRight,
      width  : rect.width - paddingLeft - paddingRight,
      height : rect.height - paddingTop - paddingBottom,
    } )
  }, [] )

  // Animate stagger items flawlessly when opening the new unified drawer
  useEffect( () => {
    const targets = itemsRefs.current.slice( 0, itemsCount ).filter( Boolean ) as HTMLElement[]
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
  }, [isOpen, itemsCount] )

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

  // Close the menu with Escape
  useEffect( () => {
    if ( !isOpen ) return

    const onKeyDown = ( e: KeyboardEvent ) => {
      if ( e.key === 'Escape' ) setIsOpen( false )
    }

    window.addEventListener( 'keydown', onKeyDown )

    return () => window.removeEventListener( 'keydown', onKeyDown )
  }, [isOpen] )

  // Lenis is not mounted on mobile, so the same handler is driven either by
  // Lenis' scroll callback or by the native scroll event.
  const handleScroll = useCallback(
    ( { scroll, direction }: { scroll: number; direction: number } ) => {
      // Solid bar once the page has scrolled away from the top
      setIsScrolled( scroll > 16 )

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
    },
    [isOpen]
  )

  const lenis = useLenis( handleScroll, [handleScroll] )

  useEffect( () => {
    // Lenis already feeds the handler when it is running.
    if ( lenis ) return

    let previousScroll = window.scrollY

    const onScroll = () => {
      const scroll = window.scrollY
      const direction = scroll > previousScroll ? 1 : -1

      previousScroll = scroll
      handleScroll( { scroll, direction } )
    }

    window.addEventListener( 'scroll', onScroll, { passive : true } )

    return () => window.removeEventListener( 'scroll', onScroll )
  }, [lenis, handleScroll] )

  // Top-level items that link straight to a page are shown inline on wide screens
  const inlineLinks = items
    .filter( ( item ) => item.categoryName && !item.navItems?.length && constructNavUrl( item.navItem ) )
    .slice( 0, 4 )
    .map( ( item ) => ( { label : item.categoryName as string, href : constructNavUrl( item.navItem ) } ) )

  const isActiveLink = ( href: string ) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith( `${href}/` )

  return (
    <>
      <header
        ref={navbarRef}
        className={cn(
          'fixed top-0 inset-x-0 z-100 border-b transition-colors duration-300',
          isScrolled && !isOpen
            ? 'bg-white/80 dark:bg-dark/80 backdrop-blur-md border-black/10 dark:border-white/10'
            : 'bg-transparent border-transparent'
        )}
      >
        {/* Empty bar space lets clicks through to the page; only the controls catch them */}
        <div className="flex items-center justify-between gap-6 h-[72px] px-6 md:px-12 mx-auto max-w-[1600px] pointer-events-none [&>*]:pointer-events-auto">
          <Link href={'/'}
            aria-label="Ian Febi Sastrataruna – Home"
            onClick={() => setIsOpen( false )}
            className={cn(
              'relative z-50 flex items-center gap-3 no-underline text-black dark:text-white transition-opacity duration-300',
              isOpen && 'max-sm:opacity-0 max-sm:pointer-events-none'
            )}
          >
            <Image src="/Logo.svg"
              alt=""
              width={36}
              height={36}
              priority
            />
            <span className="hidden sm:block text-base font-bold tracking-tight">Ian Febi</span>
          </Link>

          {inlineLinks.length > 0 && (
            <nav aria-label="Primary"
              className="hidden lg:block"
            >
              <ul className={cn(
                'flex items-center gap-1 m-0 list-none transition-opacity duration-300',
                isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
              )}
              >
                {inlineLinks.map( ( link ) => {
                  const isActive = isActiveLink( link.href )

                  return (
                    <li key={link.href}
                      className="m-0"
                    >
                      <Link
                        href={link.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'relative flex items-center h-10 px-4 rounded-full text-sm font-medium no-underline transition-colors duration-200',
                          isActive
                            ? 'text-black dark:text-white'
                            : 'text-black/65 hover:text-black dark:text-white/55 dark:hover:text-white'
                        )}
                      >
                        {link.label}
                        {isActive && (
                          <span aria-hidden="true"
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-orange"
                          />
                        )}
                      </Link>
                    </li>
                  )
                } )}
              </ul>
            </nav>
          )}

          <div className="flex items-center gap-1 sm:gap-2">
            <div className={cn( 'flex items-center gap-1 transition-opacity duration-300', isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100' )}>
              <ThemeToggle />
              <div className="hidden sm:block">
                <LocaleSwitcher />
              </div>
            </div>

            <span aria-hidden="true"
              className="hidden sm:block w-px h-6 mx-2 bg-black/10 dark:bg-white/15"
            />

            <HeaderMenuButton
              ref={menuTriggerRef}
              isOpen={isOpen}
              onClick={() => setIsOpen( !isOpen )}
            />
          </div>
        </div>
      </header>

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
