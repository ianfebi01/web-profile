'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import MenuItem from './MenuItem'
import MobileNavbar from './MobileNavbar'
import Image from 'next/image'
import { Site } from '@/payload-types'
import MenuItemSocial from './MenuItemSocial'
import { useTranslations } from 'next-intl'
import LocaleSwitcher from './LocaleSwitcher'
import { Link } from '@/i18n/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/lib/utils'
import { useLenis } from 'lenis/react'

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
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState( false )
  const navbarRef = useRef<HTMLElement>( null )
  const isHiddenRef = useRef( false )

  useLenis(({ scroll, direction }) => {
    if ( scroll < 100 || direction === -1 ) {
      // Show navbar if it's currently hidden
      if (isHiddenRef.current) {
        isHiddenRef.current = false
        gsap.to( navbarRef.current, {
          y        : 0,
          opacity  : 1,
          duration : 0.5,
          ease     : 'power2.out',
        } )
      }
    } else if ( direction === 1 && scroll > 100 ) {
      // Hide navbar if it's currently visible
      if (!isHiddenRef.current) {
        isHiddenRef.current = true
        gsap.to( navbarRef.current, {
          y        : -64,
          opacity  : 0,
          duration : 0.5,
          ease     : 'power2.inOut',
        } )
      }
    }
  })

  return (
    <>
      <nav
        ref={navbarRef}
        className={cn(
          'fixed top-0 w-full h-16 z-30 bg-transparent md:bg-dark'
        )}
      >
        <div className="inset-x-0 items-center hidden h-full gap-2 px-4 mx-auto max-w-7xl sm:px-4 md:px-4 xl:px-0 2xl:px-0 md:flex">
          <Link href={'/'}>
            <Image
              src="/Logo.svg"
              alt="Logo image"
              width={40}
              height={40}
              priority
            />
          </Link>
          <div className="grow"></div>
          <div className="flex items-center gap-4">
            {items?.map( ( item, i ) => (
              <div key={i}>
                <MenuItem data={item} />
              </div>
            ) )}
            <MenuItemSocial title={t( 'contact' )}
              socials={socials}
            />
            <LocaleSwitcher />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex items-center h-16 px-6 md:hidden">
          <Link href={'/'}
            onClick={() => setIsOpen( false )}
          >
            <Image src="/Logo.svg"
              alt="Logo image"
              width={40}
              height={40}
            />
          </Link>
          <div className="grow" />
          <div className="flex items-center gap-4 md:hidden">
            <LocaleSwitcher />
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-white transition-default outline-none ring-0 focus:outline-none focus-visible:ring-0"
              aria-label="Open navigation drawer"
              onClick={() => setIsOpen( true )}
              tabIndex={-1}
            >
              <FontAwesomeIcon icon={faBars}
                size="2xl"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <MobileNavbar isOpen={isOpen}
          items={items}
          socials={socials}
          setIsOpen={setIsOpen}
        />
      </nav>
    </>
  )
}

export default Navbar
