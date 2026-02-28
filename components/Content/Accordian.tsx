import { AccordianBlock } from '@/payload-types'
import React from 'react'
import Accordion from '../Accordian'

interface Props {
  sectionData: AccordianBlock
}
const Accordian: React.FC<Props> = ( { sectionData } ) => {
  return (
    <div className="max-w-3xl mx-auto">
      <Accordion items={(sectionData.items as any) || []} />
    </div>
  )
}
export default Accordian
