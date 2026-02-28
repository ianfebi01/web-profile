import { Page } from '@/payload-types'
import React, { useMemo } from 'react'
import Heroes from './Heroes'
import Sections from './Sections'

interface Props {
  page: Page
}

const HeroesAndSections = ( { page }: Props ) => {
  const heroes = useMemo( () => page?.banner, [page?.banner] )
  const sections = useMemo( () => page?.blocks, [page?.blocks] )

  return (
    <div>
      {(heroes?.length || 0) > 0 && <Heroes banners={heroes as any} />}
      {(sections?.length || 0) > 0 && (
        <Sections sections={sections}
          headingLevel={2}
        />
      )}
    </div>
  )
}

export default HeroesAndSections
