import { ContentComponentsBodyCopy } from '@/types/generated/components'
import React from 'react'
import Markdown from '../Parsers/Markdown'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface Props {
  sectionData: any
}
const BodyCopy: React.FC<Props> = ( { sectionData } ) => {
  return (
    <div className="max-w-3xl mx-auto">
      {typeof sectionData.content === 'string' ? (
        <Markdown content={sectionData.content} />
      ) : (
        <RichText data={sectionData.content} />
      )}
    </div>
  )
}
export default BodyCopy
