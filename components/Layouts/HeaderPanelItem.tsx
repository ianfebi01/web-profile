'use client'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { NavCategoryType } from '@/types/header'
import constructNavUrl from '@/utils/construct-nav-url'
import HeaderPanelDisclosure from './HeaderPanelDisclosure'
import { PanelIndex, panelLabelClass, panelRowClass } from './HeaderPanelRow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

interface Props {
  item: NavCategoryType
  index: number
  setIsOpen: ( value: boolean ) => void
}

const HeaderPanelItem = ( { item, index, setIsOpen }: Props ) => {
  const hasCategoryName = Boolean( item.categoryName )
  const hasChildren = Boolean( item.navItems?.length )
  const hasDirectLink = Boolean( item.navItem?.url || item.navItem?.page )
  const href = constructNavUrl( item.navItem )

  if ( hasCategoryName && hasChildren ) {
    return (
      <HeaderPanelDisclosure
        item={item}
        index={index}
        setIsOpen={setIsOpen}
      />
    )
  }

  if ( hasCategoryName && hasDirectLink ) {
    return (
      <Link
        href={href || ''}
        className={cn( panelRowClass, !href && 'pointer-events-none' )}
        aria-disabled={!href}
        tabIndex={!href ? -1 : undefined}
        onClick={() => setIsOpen( false )}
      >
        <PanelIndex index={index} />
        <span className={panelLabelClass}>{item.categoryName}</span>
        <FontAwesomeIcon
          icon={faArrowRight}
          aria-hidden="true"
          className="ml-auto self-center size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
        />
      </Link>
    )
  }

  return (
    <div className={cn( panelRowClass, 'cursor-default' )}>
      <PanelIndex index={index} />
      <span className={panelLabelClass}>{item.categoryName}</span>
    </div>
  )
}

export default HeaderPanelItem
