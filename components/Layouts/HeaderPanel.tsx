'use client'

import { MutableRefObject } from 'react'
import { cn } from '@/lib/utils'
import {
  MenuAnchorType,
  NavCategoryType,
  SocialLinksType,
} from '@/types/header'
import HeaderPanelItem from './HeaderPanelItem'
import HeaderPanelSocial from './HeaderPanelSocial'
import { LocaleSegmented } from './LocaleSwitcher'

interface Props {
  isOpen: boolean
  items: NavCategoryType[]
  socials: SocialLinksType
  menuAnchor: MenuAnchorType | null
  itemsRefs: MutableRefObject<
    ( HTMLButtonElement | HTMLDivElement | null )[]
  >
  setIsOpen: ( value: boolean ) => void
}

const HeaderPanel = ( {
  isOpen,
  items,
  socials,
  menuAnchor,
  itemsRefs,
  setIsOpen,
}: Props ) => {
  // Wrap the panel around the menu button with a small inset so the X sits inside its corner
  const PANEL_INSET = 8
  const panelTop = menuAnchor ? Math.max( menuAnchor.top - PANEL_INSET, 4 ) : 16
  const panelRight = menuAnchor ? Math.max( menuAnchor.right - PANEL_INSET, 4 ) : 16
  const panelMaxHeight = `calc(100dvh - ${panelTop}px - 16px)`

  // Grow the panel out of the button's centre
  const transformOrigin = menuAnchor
    ? `calc(100% - ${menuAnchor.right - panelRight + menuAnchor.width / 2}px) ${menuAnchor.top - panelTop + menuAnchor.height / 2}px`
    : 'top right'

  return (
    <div
      className={cn(
        'fixed inset-0 z-80 transition-all duration-500',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      id="site-menu"
      // Keep the closed panel out of the tab order and the accessibility tree
      inert={!isOpen}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => setIsOpen( false )}
        aria-hidden="true"
      />

      <div
        className={cn(
          'absolute w-[calc(100vw-2rem)] sm:w-full sm:max-w-md bg-white dark:bg-dark border border-black/10 dark:border-white/10 shadow-2xl pt-20 pb-6 px-4 sm:px-6 overflow-y-auto flex flex-col h-fit rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen
            ? 'scale-100'
            : 'scale-[0]'
        )}
        style={{
          top             : `${panelTop}px`,
          right           : `${panelRight}px`,
          maxHeight       : panelMaxHeight,
          transformOrigin : transformOrigin,
        }}
      >
        <div className={cn( 'flex flex-col transition-opacity duration-300 text-black dark:text-white', isOpen ? 'opacity-100' : 'opacity-0' )}>
          <span aria-hidden="true"
            className="px-3 mb-2 font-code text-[11px] uppercase tracking-[0.2em] text-black/65 dark:text-white/60"
          >
            Navigation
          </span>

          <nav aria-label="Menu"
            className="flex flex-col"
          >
            {items?.map( ( item, key ) => (
              <div
                key={key}
                ref={( el ) => {
                  itemsRefs.current[key] = el
                }}
                className="opacity-0 translate-y-[50px] will-change-transform"
              >
                <HeaderPanelItem
                  item={item}
                  index={key}
                  setIsOpen={setIsOpen}
                />
              </div>
            ) )}
          </nav>

          <div className="flex items-center justify-between gap-4 mt-8 pt-5 px-1 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center -ml-2">
              {socials.map( ( item, index ) => (
                <HeaderPanelSocial
                  key={index}
                  item={item}
                  transitionEnabled
                  transitionIn={isOpen}
                  transitionDelay={0.2 + ( items.length * 0.1 ) + ( index * 0.1 )}
                />
              ) )}
            </div>
            <LocaleSegmented className="sm:hidden" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderPanel
