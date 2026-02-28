import React from 'react'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'
import { BannerStandardBlock } from '@/payload-types'
import { parseUrl } from '@/utils/parse-url'

interface ButtonGroupProps {
  buttons?: BannerStandardBlock['buttons']
}

const ButtonGroup: React.FC<ButtonGroupProps> = ( { buttons = [] } ) => {
  if ( !buttons?.length ) return null

  return (
    <div className="flex items-center gap-4 justify-center lg:justify-start mt-2 flex-wrap">
      {buttons?.map( ( button, index ) => (
        <Link
          key={index}
          className={cn( 'button button-primary' )}
          href={parseUrl(button?.url)}
          target={button?.newTab ? '_blank' : undefined}
          rel={button?.newTab ? 'noopener noreferrer' : undefined}
        >
          {button?.name}
        </Link>
      ) )}
    </div>
  )
}

export default ButtonGroup
