'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  isOpen: boolean
  onClick: () => void
}

const HeaderMenuButton = forwardRef<HTMLDivElement, Props>(
  function HeaderMenuButton( { isOpen, onClick }, ref ) {
    return (
      <div
        ref={ref}
        className="magnet-zone flex items-center gap-3 p-4 -m-4 cursor-pointer group w-fit relative z-50"
        data-name="burger"
        onClick={onClick}
      >
        <span aria-hidden="true"
          className="text-sm font-medium text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white transition-colors hidden sm:block pointer-events-none"
        >
          {isOpen ? 'Close' : 'Menu'}
        </span>

        <button
          className="magnet-target group/target flex items-center justify-center w-12 h-12 rounded-full bg-transparent text-black dark:text-white ring-0 ring-black/10 dark:ring-white/15 group-hover:ring-black/25 dark:group-hover:ring-white/30 transition-shadow duration-300"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="site-menu"
          type="button"
        >
          <div className="relative flex items-center justify-center w-[22px] h-[22px] pointer-events-none">
            <span className={cn(
              'absolute transition-all duration-300 ease-out bg-black dark:bg-white',
              isOpen
                ? 'left-0 w-[22px] h-[2px] rotate-45 rounded-sm'
                : 'left-0 w-[5px] h-[5px] rounded-full group-hover/target:translate-x-[8px]'
            )}
            ></span>

            <span className={cn(
              'absolute transition-all duration-300 ease-out bg-black dark:bg-white z-10',
              isOpen ? 'w-0 h-0 opacity-0' : 'w-[5px] h-[5px] rounded-full'
            )}
            ></span>

            <span className={cn(
              'absolute transition-all duration-300 ease-out bg-black dark:bg-white',
              isOpen
                ? 'right-0 w-[22px] h-[2px] -rotate-45 rounded-sm'
                : 'right-0 w-[5px] h-[5px] rounded-full group-hover/target:translate-x-[-8px]'
            )}
            ></span>
          </div>
        </button>
      </div>
    )
  }
)

export default HeaderMenuButton
