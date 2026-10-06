'use client'
import { cn } from '@/lib/utils'
import { Popover, Transition } from '@headlessui/react'
import { MouseEvent, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { routing } from '@/i18n/routing'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'

export default function LocaleSwitcher() {
  const [show, setShow] = useState<boolean>( false )

  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()

  const changeLocale = ( locale: string, e: MouseEvent<HTMLElement> ) => {
    e.preventDefault()
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      { pathname, params },
      { locale : locale }
    )
  }

  return (
    <div className="relative">
      <Popover
        className="relative"
        onMouseEnter={() => setShow( true )}
        onMouseLeave={() => setShow( false )}
        onTouchStart={() => setShow( true )}
      >
        {() => (
          <>
            <Popover.Button
              className={cn(
                'h-10 px-3 text-sm font-medium uppercase flex items-center gap-2 rounded-full',
                'ring-0 focus:ring-0 outline-none transition-colors duration-200 cursor-pointer',
                'text-black/70 hover:text-black hover:bg-light-secondary dark:text-white/70 dark:hover:text-white dark:hover:bg-dark-secondary',
                show && 'text-black bg-light-secondary dark:text-white dark:bg-dark-secondary'
              )}
              aria-label="Change language"
            >
              <FontAwesomeIcon icon={faGlobe}
                className="size-3.5"
              />
              {locale}
            </Popover.Button>
            <Transition
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
              show={show}
            >
              <Popover.Panel
                static
                className="absolute right-0 z-10 min-w-24 pt-2"
              >
                <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-dark shadow-lg p-1">
                  {routing.locales?.map( ( item ) => (
                    <button
                      key={item}
                      onClick={( e ) => changeLocale( item, e )}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2 rounded-lg',
                        'text-sm font-medium uppercase transition-colors duration-150 cursor-pointer',
                        'focus:outline-none focus-visible:ring focus-visible:ring-orange/50',
                        'hover:bg-light-secondary dark:hover:bg-dark-secondary',
                        item === locale ? 'text-black dark:text-white' : 'text-black/65 dark:text-white/50'
                      )}
                    >
                      {item}
                      {item === locale && <span className="size-1.5 rounded-full bg-orange" />}
                    </button>
                  ) )}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}

// Inline segmented locale control, used inside the menu panel on small screens
export function LocaleSegmented( { className }: { className?: string } ) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()

  const changeLocale = ( nextLocale: string ) => {
    router.replace(
      // @ts-expect-error -- see LocaleSwitcher: params always match the current route
      { pathname, params },
      { locale : nextLocale }
    )
  }

  return (
    <div className={cn( 'inline-flex items-center p-1 rounded-full bg-light-secondary dark:bg-dark-secondary', className )}>
      {routing.locales?.map( ( item ) => (
        <button
          key={item}
          type="button"
          onClick={() => changeLocale( item )}
          aria-pressed={item === locale}
          className={cn(
            'h-8 px-3 rounded-full text-xs font-medium uppercase transition-colors duration-200 cursor-pointer',
            item === locale
              ? 'bg-white text-black dark:bg-dark dark:text-white shadow-sm'
              : 'text-black/65 hover:text-black dark:text-white/50 dark:hover:text-white'
          )}
        >
          {item}
        </button>
      ) )}
    </div>
  )
}
