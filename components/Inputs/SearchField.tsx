'use client'

import { useEffect, useState } from 'react'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TextField from '@/components/Inputs/TextField'

type Props = {
  value: string
  onChange: ( value: string ) => void
  placeholder: string
  resetLabel: string
  debounceMs?: number
}

const SearchField = ( {
  value,
  onChange,
  placeholder,
  debounceMs = 350,
}: Props ) => {
  const [inputValue, setInputValue] = useState( value )

  useEffect( () => {
    setInputValue( value )
  }, [value] )

  useEffect( () => {
    if ( inputValue === value ) {
      return
    }

    const timeoutId = window.setTimeout( () => {
      onChange( inputValue )
    }, debounceMs )

    return () => window.clearTimeout( timeoutId )
  }, [debounceMs, inputValue, onChange, value] )

  const handleReset = () => {
    setInputValue( '' )
    onChange( '' )
  }

  return (
    <div className="max-w-md"
      data-name="input"
    >
      <div className="w-full relative">
        <TextField
          type="text"
          name="search"
          value={inputValue}
          onChange={setInputValue}
          placeholder={placeholder}
          aria-label={placeholder}
          className='pr-8'
        />
        <button
          type="button"
          onClick={handleReset}
          disabled={!inputValue}
          className="absolute inset-y-0 right-4 z-1 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 ease-in-out"
          aria-hidden={!inputValue}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </div>
  )
}

export default SearchField
