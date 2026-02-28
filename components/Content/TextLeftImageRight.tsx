'use client'
import { TextLeftImageRightBlock } from '@/payload-types'
import React from 'react'
import TextLeftImageRight from '@/components/TextLeftImageRight'

type Props = {
  sectionData: TextLeftImageRightBlock
  buttonsVariation?: 'primary' | 'secondary'
}

const Section: React.FC<Props> = ( {
  sectionData,
  buttonsVariation = 'primary',
} ) => {
  const bgColour =
    (sectionData.sectionSettings?.bgColour as any)?.name ||
    sectionData.sectionSettings?.bgColour || ''

  return (
    <TextLeftImageRight
      image={sectionData.image as any}
      fullWidthBgImage={sectionData.fullWidthBgImage || false}
      reverse={sectionData.reverse || false}
      fullWidth={sectionData.fullWidth || false}
      buttons={(sectionData.buttons as any) || []}
      bodyCopy={sectionData.bodyCopy}
      biggerColumn={sectionData.biggerColumn as 'image' | 'content' | undefined}
      buttonsVariation={buttonsVariation}
      bgColour={bgColour}
      scaling={sectionData?.scaling as 'cover' | 'contain'}
    />
  )
}

export default Section
