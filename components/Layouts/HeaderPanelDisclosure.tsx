'use client'

import { Disclosure, Transition } from '@headlessui/react'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Page } from '@/payload-types'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { NavCategoryType, NavItemType } from '@/types/header'
import constructNavUrl from '@/utils/construct-nav-url'

interface Props {
  item: NavCategoryType
  setIsOpen: ( value: boolean ) => void
}

const HeaderPanelDisclosure = ( { item, setIsOpen }: Props ) => {
  return (
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
                  tabIndex={!constructNavUrl( item.navItem ) ? -1 : undefined}
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
              className="overflow-clip"
              enter="transition-all duration-500 ease-in-out"
              enterFrom="max-h-0"
              enterTo="max-h-[500px]"
              leave="transition-all duration-500 ease-in-out"
              leaveFrom="max-h-[500px]"
              leaveTo="max-h-0 "
            >
              <Disclosure.Panel as="div"
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
  )
}

export default HeaderPanelDisclosure
