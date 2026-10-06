'use client'

import { Disclosure, Transition } from '@headlessui/react'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Page } from '@/payload-types'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { NavCategoryType, NavItemType } from '@/types/header'
import constructNavUrl from '@/utils/construct-nav-url'
import { PanelIndex, panelLabelClass, panelRowClass } from './HeaderPanelRow'

interface Props {
  item: NavCategoryType
  index: number
  setIsOpen: ( value: boolean ) => void
}

const ToggleIcon = ( { open }: { open: boolean } ) => (
  <span aria-hidden="true"
    className="flex items-center justify-center size-8 rounded-full ring-1 ring-black/10 dark:ring-white/15"
  >
    <FontAwesomeIcon
      className={cn( 'size-3 transition-transform duration-300 ease-out', open && 'rotate-45' )}
      aria-hidden="true"
      icon={faPlus}
    />
  </span>
)

const HeaderPanelDisclosure = ( { item, index, setIsOpen }: Props ) => {
  const href = constructNavUrl( item.navItem )
  const hasDirectLink = Boolean( item.navItem?.url || item.navItem?.page ) && !!href

  return (
    <Disclosure as="div">
      {( { open } ) => (
        <div className={cn( 'rounded-2xl transition-colors duration-200', open && 'bg-light-secondary dark:bg-dark-secondary' )}>
          {hasDirectLink ? (
            // Label navigates; only the + button toggles the sub-links
            <div className={cn( panelRowClass, open && 'hover:bg-transparent dark:hover:bg-transparent' )}>
              <PanelIndex index={index} />
              <Link
                href={href}
                className={cn( panelLabelClass, 'no-underline hover:underline underline-offset-4 decoration-2 text-black dark:text-white' )}
                onClick={() => setIsOpen( false )}
              >
                {item.categoryName}
              </Link>
              <Disclosure.Button
                aria-label={`Toggle ${item.categoryName}`}
                className="ml-auto self-center cursor-pointer"
              >
                <ToggleIcon open={open} />
              </Disclosure.Button>
            </div>
          ) : (
            <Disclosure.Button
              className={cn( panelRowClass, 'text-left text-black dark:text-white cursor-pointer', open && 'hover:bg-transparent dark:hover:bg-transparent' )}
            >
              <PanelIndex index={index} />
              <span className={panelLabelClass}>{item.categoryName}</span>
              <span className="ml-auto self-center">
                <ToggleIcon open={open} />
              </span>
            </Disclosure.Button>
          )}

          <Transition
            as="div"
            show={open}
            className="overflow-clip"
            enter="transition-all duration-500 ease-in-out"
            enterFrom="max-h-0"
            enterTo="max-h-[500px]"
            leave="transition-all duration-500 ease-in-out"
            leaveFrom="max-h-[500px]"
            leaveTo="max-h-0"
          >
            <Disclosure.Panel
              as="ul"
              className="m-0 list-none flex flex-col gap-1 pl-[52px] pr-3 pb-4"
            >
              {item.navItems?.map( ( subItem: NavItemType, indexSubitem: number ) => (
                <li key={indexSubitem}
                  className="m-0"
                >
                  <Link
                    href={constructNavUrl( subItem )}
                    className="block py-1.5 text-base font-medium no-underline text-black/65 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors duration-200"
                    target={subItem?.newTab ? '_blank' : undefined}
                    rel={subItem?.newTab ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsOpen( false )}
                  >
                    {subItem?.name || ( subItem.page as Page )?.title}
                  </Link>
                </li>
              ) )}
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  )
}

export default HeaderPanelDisclosure
