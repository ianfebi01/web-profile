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
        className="magnet-zone flex items-center gap-4 p-4 -m-4 cursor-pointer group w-fit relative z-50"
        data-name="burger"
        onClick={onClick}
      >
        <span className="text-[15px] font-bold text-white group-hover:text-[#F26B50] transition-colors hidden sm:block pointer-events-none mt-1">
          Menu
        </span>

        <button
          className="magnet-target group/target flex items-center justify-center w-12 h-12 rounded-full bg-transparent text-white"
          aria-label="Toggle Menu"
          type="button"
        >
          <div className="relative flex items-center justify-center w-[26px] h-[26px] pointer-events-none">
            <span className={cn(
              'absolute transition-all duration-300 ease-out bg-white',
              isOpen
                ? 'left-0 w-[26px] h-[2px] rotate-45 rounded-sm'
                : 'left-0 w-1.5 h-1.5 rounded-full group-hover/target:translate-x-[10px]'
            )}
            ></span>

            <span className={cn(
              'absolute transition-all duration-300 ease-out bg-white z-10',
              isOpen ? 'w-0 h-0 opacity-0' : 'w-1.5 h-1.5 rounded-full'
            )}
            ></span>

            <span className={cn(
              'absolute transition-all duration-300 ease-out bg-white',
              isOpen
                ? 'right-0 w-[26px] h-[2px] -rotate-45 rounded-sm'
                : 'right-0 w-1.5 h-1.5 rounded-full group-hover/target:-translate-x-[10px]'
            )}
            ></span>
          </div>
        </button>
      </div>
    )
  }
)

export default HeaderMenuButton
