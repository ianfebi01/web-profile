'use client'
import { ContentComponentsTextLeftImageRight } from '@/types/generated/components'
import React from 'react'
import TextLeftImageRight from '@/components/TextLeftImageRight'

type Props = {
  sectionData: ContentComponentsTextLeftImageRight['attributes']
  buttonsVariation?: 'primary' | 'secondary'
}

const Section: React.FC<Props> = ( {
  sectionData,
  buttonsVariation = 'primary',
} ) => {
  const bgColour =
    sectionData.sectionSettings?.attributes?.bgColour?.data?.attributes?.name ||
    sectionData.sectionSettings?.bgColour || ''

  return (
    <TextLeftImageRight
      image={sectionData.image}
      fullWidthBgImage={sectionData.fullWidthBgImage}
      reverse={sectionData.reverse}
      fullWidth={sectionData.fullWidth}
      buttons={sectionData.buttons}
      bodyCopy={sectionData.bodyCopy}
      biggerColumn={sectionData.biggerColumn}
      buttonsVariation={buttonsVariation}
      bgColour={bgColour}
      scaling={sectionData?.scaling}
    />
  )
}

export default Section
