'use client'
import { useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
type ClientPortalInterface = {
  children: React.ReactNode
  show?: boolean
  onClose?: () => void
  selector: string
}

// The portal target lives outside React, so read it as an external store
// rather than syncing it into state from an effect.
const subscribe = () => () => {}
const getServerSnapshot = () => null

const ClientPortal = ( { children, selector, show }: ClientPortalInterface ) => {
  const getSnapshot = useCallback(
    () => document.getElementById( selector ),
    [selector]
  )
  const element = useSyncExternalStore( subscribe, getSnapshot, getServerSnapshot )

  return show && element ? createPortal( children, element ) : null
}

export default ClientPortal
