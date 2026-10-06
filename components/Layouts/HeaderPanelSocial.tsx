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
import { cn } from '@/lib/utils'
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
  const buttonRef = useRef<HTMLAnchorElement>( null )
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
    <a
      ref={buttonRef}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        transitionEnabled && 'opacity-0 translate-y-[50px] will-change-transform',
        'flex size-12 items-center justify-center rounded-full text-black dark:text-white hover:text-orange transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange'
      )}
      data-name="button"
      aria-label={item.platform}
      title={item.platform}
    >
      {icon ? (
        <FontAwesomeIcon icon={icon}
          aria-hidden="true"
          size="lg"
        />
      ) : (
        <span className="text-sm font-bold uppercase">
          {item.platform?.slice( 0, 2 )}
        </span>
      )}
    </a>
  )
}

export default HeaderPanelSocial
