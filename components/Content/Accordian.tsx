import { ContentComponentsAccordian } from '@/types/generated/components'
import React from 'react'
import Accordion from '../Accordian'

interface Props {
  sectionData: ContentComponentsAccordian['attributes']
}
const Accordian: React.FC<Props> = ( { sectionData } ) => {
  return (
    <div className="max-w-3xl mx-auto">
      <Accordion items={sectionData.items} />
    </div>
  )
}
export default Accordian
