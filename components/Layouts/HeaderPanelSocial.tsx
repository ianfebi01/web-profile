'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import {
  faGithub,
  faInstagram,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn, openNewTab } from '@/lib/utils'
import { SocialLinksType } from '@/types/header'

interface Props {
  item: SocialLinksType[number]
  transitionEnabled?: boolean
  transitionIn?: boolean
  transitionDelay?: number
}

const getSocialIcon = ( platform?: string ) => {
  switch ( platform?.toLowerCase() ) {
  case 'instagram':
    return faInstagram
  case 'linkedin':
    return faLinkedinIn
  case 'github':
    return faGithub
  case 'email':
    return faEnvelope
  default:
    return null
  }
}

const HeaderPanelSocial = ( {
  item,
  transitionEnabled = true,
  transitionIn = false,
  transitionDelay = 0,
}: Props ) => {
  const buttonRef = useRef<HTMLButtonElement>( null )
  const icon = getSocialIcon( item.platform )

  useEffect( () => {
    if ( !buttonRef.current ) return

    if ( !transitionEnabled ) {
      gsap.set( buttonRef.current, {
        opacity : 1,
        y       : 0,
      } )

      return
    }

    if ( transitionIn ) {
      gsap.fromTo(
        buttonRef.current,
        { opacity : 0, y : 50 },
        {
          opacity  : 1,
          y        : 0,
          duration : 0.5,
          ease     : 'power2.out',
          delay    : transitionDelay,
        }
      )

      return
    }

    gsap.set( buttonRef.current, {
      opacity : 0,
      y       : 50,
    } )
  }, [transitionDelay, transitionEnabled, transitionIn] )

  return (
    <button
      ref={buttonRef}
      onClick={() => openNewTab( item.url )}
      className={cn(
        transitionEnabled && 'opacity-0 translate-y-[50px] will-change-transform',
        'flex size-12 items-center justify-center text-white hover:text-orange transition-all duration-300 focus:outline-none focus-visible:ring-0 focus:border-none outline-none focus:outline-0'
      )}
      data-name="button"
      aria-label={item.platform}
      title={item.platform}
      tabIndex={-1}
      type="button"
    >
      {icon ? (
        <FontAwesomeIcon icon={icon}
          size="lg"
        />
      ) : (
        <span className="text-sm font-bold uppercase">
          {item.platform?.slice( 0, 2 )}
        </span>
      )}
    </button>
  )
}

export default HeaderPanelSocial
