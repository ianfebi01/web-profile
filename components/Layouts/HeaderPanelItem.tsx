'use client'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { NavCategoryType } from '@/types/header'
import constructNavUrl from '@/utils/construct-nav-url'
import HeaderPanelDisclosure from './HeaderPanelDisclosure'

interface Props {
  item: NavCategoryType
  setIsOpen: ( value: boolean ) => void
}

const HeaderPanelItem = ( { item, setIsOpen }: Props ) => {
  const hasCategoryName = Boolean( item.categoryName )
  const hasChildren = Boolean( item.navItems?.length )
  const hasDirectLink = Boolean( item.navItem?.url || item.navItem?.page )
  const href = constructNavUrl( item.navItem )

  if ( hasCategoryName && hasChildren ) {
    return (
      <HeaderPanelDisclosure
        item={item}
        setIsOpen={setIsOpen}
      />
    )
  }

  if ( hasCategoryName && hasDirectLink ) {
    return (
      <Link
        href={href || ''}
        className={cn(
          'h3 px-4 underline-offset-4 w-full block',
          'py-2 hover:bg-dark-secondary rounded-lg overflow-x-clip transition-all duration-300 ease-in-out',
          !href
            ? 'no-underline pointer-events-none'
            : 'no-underline hover:underline pointer-events-auto'
        )}
        aria-disabled={!href}
        tabIndex={!href ? -1 : undefined}
        onClick={() => setIsOpen( false )}
      >
        {item.categoryName}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'h3 px-4 underline-offset-4 w-full block',
        'py-2 hover:bg-dark-secondary rounded-lg overflow-x-clip transition-all duration-300 ease-in-out cursor-default'
      )}
    >
      {item.categoryName}
    </div>
  )
}

export default HeaderPanelItem
