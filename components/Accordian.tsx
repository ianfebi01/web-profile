'use client'
import { cn } from '@/lib/utils'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Disclosure, Transition } from '@headlessui/react'
import Markdown from './Parsers/Markdown'

type AccordianItem = {
  heading: string
  content: string
}

type Props = {
  items?: AccordianItem[]
}

export default function Accordion( { items = [] }: Props ) {
  return (
    <div>
      <div className="mx-auto max-w-7xl flex flex-col gap-2">
        {items.map(
          ( item, idx ) =>
            item.heading &&
            item.content && (
              <Disclosure as="div"
                key={idx}
              >
                {( { open } ) => (
                  <dl className={cn( 'pt-6 p-4 rounded-xl bg-dark shadow-2xl' )}>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left">
                        <span
                          className={cn(
                            'text-md lg:text-lg 2xl:text-xl pl-4 font-bold'
                          )}
                        >
                          {item.heading}
                        </span>
                        <span className="ml-6 flex h-7 items-center pr-4">
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className={cn(
                              'h-6 w-6 transition-transform ease-in-out',
                              { '-rotate-180' : open }
                            )}
                          />
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <dd>
                      <Transition
                        show={open}
                        enter="transition-all duration-500 ease-in-out"
                        enterFrom="max-h-0 opacity-0"
                        enterTo="max-h-[500px] opacity-100"
                        leave="transition-all duration-500 ease-in-out"
                        leaveFrom="max-h-[500px] opacity-100"
                        leaveTo="max-h-0 opacity-0"
                      >
                        <Disclosure.Panel
                          as="div"
                          className="flex overflow-y-hidden transition-all duration-500 ease-in-out"
                        >
                          <div
                            className={cn( 'body-copy pl-4 text-white-overlay' )}
                          >
                            <Markdown content={item.content}></Markdown>
                          </div>
                        </Disclosure.Panel>
                      </Transition>
                    </dd>
                  </dl>
                )}
              </Disclosure>
            )
        )}
      </div>
    </div>
  )
}
