'use client'

import { MutableRefObject } from 'react'
import { Disclosure, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { Page } from '@/payload-types'
import { Link } from '@/i18n/navigation'
import { cn, openNewTab } from '@/lib/utils'
import {
  MenuAnchorType,
  NavCategoryType,
  NavItemType,
  SocialLinksType,
} from '@/types/header'
import constructNavUrl from '@/utils/construct-nav-url'

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
          'absolute w-[calc(100vw-2rem)] sm:w-full sm:max-w-md bg-blue-dark bg-dark pt-28 px-6 lg:px-8 overflow-y-auto flex flex-col h-fit rounded-[2rem] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
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
                      {!!item.categoryName &&
                      item.navItems &&
                      item.navItems.length > 0 ? (
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
                                      <div
                                        className={cn(
                                          'h3 pl-4 no-underline cursor-default'
                                        )}
                                      >
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
                                          !constructNavUrl( item.navItem )
                                            ? -1
                                            : undefined
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
                                    show={open}
                                    className={'overflow-clip'}
                                    enter="transition-all duration-500 ease-in-out"
                                    enterFrom="max-h-0"
                                    enterTo="max-h-[500px]"
                                    leave="transition-all duration-500 ease-in-out"
                                    leaveFrom="max-h-[500px]"
                                    leaveTo="max-h-0 "
                                  >
                                    <Disclosure.Panel
                                      as="div"
                                      className="flex overflow-y-hidden"
                                    >
                                      <div className="px-4 my-4 text-xs lg:text-[1.1rem] ml-4">
                                        <div className="flex flex-col gap-4">
                                          {item.navItems?.map(
                                            (
                                              subItem: NavItemType,
                                              indexSubitem: number
                                            ) => (
                                              <Link
                                                key={indexSubitem}
                                                href={constructNavUrl( subItem )}
                                                className="block m-0 no-underline p underline-offset-4 decoration-2 hover:underline"
                                                target={subItem?.newTab ? '_blank' : undefined}
                                                rel={subItem?.newTab ? 'noopener noreferrer' : undefined}
                                                onClick={() => setIsOpen( false )}
                                              >
                                                {subItem?.name ||
                                                ( subItem.page as Page )?.title}
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
                        ) : ( !!item.categoryName &&
                        ( item.navItem?.url || item.navItem?.page ) ) ? (
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

            {socials.map( ( item, index ) => (
              <button
                ref={( el ) => {
                  itemsRefs.current[items.length + index] = el
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
  )
}

export default HeaderPanel
