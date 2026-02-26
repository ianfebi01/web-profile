import { ReactElement } from 'react'
import SectionProvider from '@/components/Context/SectionProvider'
import { componentMap } from './component-maps'

export default function componentResolver(
  section: any,
  index: number
): ReactElement<any> | null {
  const key: string = section.blockType || section.__component // e.g., 'content-components.body-copy'
  const Component = componentMap[key]

  if ( !Component ) {
    // eslint-disable-next-line no-console
    console.warn( `ComponentResolver: No component found for "${key}"` )
    
    return null
  }

  return (
    <SectionProvider key={index}>
      <Component sectionData={section} />
    </SectionProvider>
  )
}
