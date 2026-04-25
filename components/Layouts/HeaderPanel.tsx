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
  const panelTop = menuAnchor ? Math.max( menuAnchor.top, 16 ) : 16
  const panelRight = menuAnchor ? Math.max( menuAnchor.right, 16 ) : 16
  const panelMaxHeight = `calc(100vh - ${panelTop}px - 16px)`
  const transformOrigin = menuAnchor
    ? `calc(100% - 16px) ${menuAnchor.height / 2}px`
    : 'top right'

  return (
    <div
      className={cn(
        'fixed inset-0 z-[80] transition-all duration-500',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => setIsOpen( false )}
      />

      <div
        className={cn(
          'absolute w-[calc(100vw-2rem)] sm:w-full sm:max-w-md bg-blue-dark bg-dark pt-10 px-6 lg:px-8 overflow-y-auto flex flex-col h-fit rounded-[2rem] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
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
        <div className={cn( "flex mt-6 grow transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0" )}>
          <div className="flex flex-col items-center justify-center mb-6 overflow-hidden text-xl font-bold text-white grow">
            <div className="flex w-full mt-6 grow">
              <div className="flex flex-col w-full gap-4 py-6">
                <div className={cn(
                  "flex flex-col w-full h-full gap-4 text-white",
                )}
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
                        setIsOpen={setIsOpen}
                      />
                    </div>
                  ) )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderPanel
