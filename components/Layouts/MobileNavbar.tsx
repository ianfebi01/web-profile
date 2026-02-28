'use client'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faXmark } from '@fortawesome/free-solid-svg-icons'
import { NavCategoryType, NavItemType } from './Navbar'
import { cn, openNewTab } from '@/lib/utils'
import gsap from 'gsap'
import constructNavUrl from '@/utils/construct-nav-url'
import { Page, Site } from '@/payload-types'

interface Props {
  isOpen: boolean
  items: NavCategoryType[]
  socials: NonNullable<Site['socialPlatformLinks']>
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export default function MobileMenu( { isOpen, setIsOpen, items, socials }: Props ) {
  const itemsRefs = useRef<HTMLButtonElement[] | HTMLDivElement[] | null[]>( [] )

  return (
    <Transition show={isOpen}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="min-[853px]:hidden"
        onClose={() => setIsOpen( false )}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 z-30" />

        {/* Slide-in panel */}
        <Transition.Child
          as={Fragment}
          enter="duration-300 ease-in-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          afterEnter={() => {
            const targets = itemsRefs.current.filter(
              Boolean
            ) as HTMLButtonElement[]
            gsap.set( targets, { opacity : 0, y : 50 } )
            gsap.to( targets, {
              opacity  : 1,
              y        : 0,
              duration : 0.5,
              ease     : 'power2.out',
              stagger  : 0.2,
            } )
          }}
          beforeLeave={() => {
            const targets = itemsRefs.current.filter(
              Boolean
            ) as HTMLButtonElement[]
            gsap.set( targets, { opacity : 0, y : 50 } )
          }}
          leave="duration-300 ease-in-out"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Panel className="fixed inset-y-0 right-0 z-40 flex flex-col w-full px-6 overflow-y-auto lg:px-8 sm:max-w-sm sm:shadow-lg bg-blue-dark bg-dark">
            {/* Close Button */}
            <div className="flex items-center h-16 md:hidden">
              <Link href={'/'}
                onClick={() => setIsOpen( false )}
              >
                <Image
                  src="/Logo.svg"
                  alt="Logo image"
                  width={40}
                  height={40}
                />
              </Link>
              <div className="grow" />
              <div className="md:hidden">
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-white hover:text-white/50 transition-default outline-none ring-0 focus:outline-none focus-visible:ring-0"
                  aria-label="Close navigation drawer"
                  onClick={() => setIsOpen( false )}
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    size="2xl"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            {/* Navigation Content */}
            <div className="flex mt-6 grow">
              <div className="flex flex-col items-center justify-center mb-6 overflow-hidden text-xl font-bold text-white grow">
                <div className="flex w-full mt-6 grow">
                  <div className="flex flex-col w-full gap-4 py-6">
                    <div className="flex flex-col w-full h-full gap-4 text-white">
                      {items?.map( ( item, key ) => (
                        <div
                          key={key}
                          ref={el => {
                            (itemsRefs.current[key] = el);
                          }}
                          className={cn( 'opacity-0 translate-y-[50px]' )}
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
                                      {(!item.navItem?.url && !item.navItem?.page) ? (
                                        <div className={cn('h3 pl-4 no-underline cursor-default')}>
                                           {item.categoryName}
                                        </div>
                                      ) : (
                                        <Link
                                          href={
                                            constructNavUrl( item.navItem ) || ''
                                          }
                                          className={cn(
                                            'h3 pl-4 underline-offset-4',
                                            !constructNavUrl( item.navItem )
                                              ? 'no-underline pointer-events-none'
                                              : 'no-underline hover:underline pointer-events-auto'
                                          )}
                                          aria-disabled={
                                            !constructNavUrl( item.navItem )
                                          }
                                          tabIndex={
                                            !constructNavUrl( item.navItem )
                                              ? -1
                                              : undefined
                                          }
                                          onClick={() =>
                                            isOpen && setIsOpen( false )
                                          }
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
                                              (
                                                subItem: NavItemType,
                                                indexSubitem: number
                                              ) => (
                                                <Link
                                                  key={indexSubitem}
                                                  href={constructNavUrl(
                                                    subItem
                                                  )}
                                                  className="block m-0 no-underline p underline-offset-4 decoration-2 hover:underline"
                                                  target={
                                                    subItem?.newTab
                                                      ? '_blank'
                                                      : undefined
                                                  }
                                                  rel={
                                                    subItem?.newTab
                                                      ? 'noopener noreferrer'
                                                      : undefined
                                                  }
                                                  onClick={() =>
                                                    setIsOpen( false )
                                                  }
                                                >
                                                  {subItem?.name ||
                                                    (
                                                      subItem.page as Page
                                                    )?.title}
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
                          ) : (!!item.categoryName && (item.navItem?.url || item.navItem?.page)) ? (
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
                              tabIndex={
                                !constructNavUrl( item.navItem ) ? -1 : undefined
                              }
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
                    ref={el => {
                      (itemsRefs.current[items.length + 1 + index] = el);
                    }}
                    onClick={() => openNewTab( item.url )}
                    className={cn(
                      'opacity-0 translate-y-[50px]',
                      'flex items-center rounded-lg overflow-hidden',
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
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
