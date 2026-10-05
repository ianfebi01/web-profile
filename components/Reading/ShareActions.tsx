'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faLink, faShareFromSquare } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'

interface Props {
  title?: string
}

export const actionClass =
  'p-2 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors duration-200 cursor-pointer'

const ShareActions = ( { title }: Props ) => {
  const t = useTranslations()
  const [copied, setCopied] = useState( false )

  const copyLink = async () => {
    await navigator.clipboard.writeText( window.location.href )
    setCopied( true )
    toast.success( t( 'article.link_copied' ) )
    setTimeout( () => setCopied( false ), 2000 )
  }

  const share = async () => {
    if ( !navigator.share ) return copyLink()

    try {
      await navigator.share( { title, url : window.location.href } )
    } catch {
      // The user dismissed the share sheet
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copyLink}
        aria-label={t( 'article.copy_link' )}
        className={actionClass}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faLink}
          className="size-4"
        />
      </button>
      <button
        type="button"
        onClick={share}
        aria-label={t( 'article.share' )}
        className={actionClass}
      >
        <FontAwesomeIcon icon={faShareFromSquare}
          className="size-4"
        />
      </button>
    </>
  )
}

export default ShareActions
