'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
type ClientPortalInterface = {
  children: React.ReactNode
  show?: boolean
  onClose?: () => void
  selector: string
}

const ClientPortal = ( { children, selector, show }: ClientPortalInterface ) => {
  const [element, setElement] = useState<Element | null>( null )

  useEffect( () => {
    setElement( document.getElementById( selector ) )
  }, [selector] )
  
  return show && element ? createPortal( children, element ) : null
}

export default ClientPortal