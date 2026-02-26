import React from 'react'
import { cn } from '@/lib/utils'
import {
  ArraysGalleryItems,
  ContentComponentsIconTexts,
} from '@/types/generated/components'
import Image from 'next/image'
import imageLoader from '@/lib/constans/image-loader'
import Markdown from '../Parsers/Markdown'
import imageUrl from '@/utils/imageUrl'
import { Link } from '@/i18n/navigation'
import AnimationProvider from '../Context/AnimationProvider'

interface Props {
  sectionData: ContentComponentsIconTexts['attributes']
}

const Gallery: React.FC<Props> = ( { sectionData } ) => {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-6 justify-center',
        sectionData.icons?.length &&
          sectionData.icons.length < 3 &&
          '2xl:gap-36'
      )}
    >
      {sectionData.icons?.map(
        ( item: ArraysGalleryItems['attributes'], index: number ) => (
          <Link
            key={index}
            className={cn(
              'flex flex-col items-center p-4 gap-4 basis-full md:basis-[calc(100%/2-1.5rem)] lg:basis-[calc(100%/3-1.5rem)] !text-inherit no-underline cursor-default pointer-events-none',
              item?.link &&
                'hover:shadow-xl cursor-pointer transition-all duration-300 ease-in-out pointer-events-auto'
            )}
            href={item?.link || ''}
            target={item?.linkNewTab ? '_blank' : undefined}
            rel={item?.linkNewTab ? 'noopener noreferrer' : undefined}
            aria-disabled={!item?.link}
            tabIndex={!item?.link ? -1 : undefined}
          >
            <AnimationProvider
              once
              delay={0.2 + index * 0.1}
            >
              <div className="relative w-full overflow-hidden aspect-square">
                {(item.image?.data || item.image) && (
                  <Image
                    src={imageUrl( item?.image?.data || item?.image, 'medium' ) || ''}
                    alt={`Image-${index}`}
                    className="object-contain object-center w-full h-full"
                    placeholder={imageLoader}
                    fill
                    sizes="auto"
                  />
                )}
              </div>
              <div className="max-w-3xl mx-auto text-center">
                {item?.bodyCopy && <Markdown content={item?.bodyCopy} />}
              </div>
            </AnimationProvider>
          </Link>
        )
      )}
    </div>
  )
}

export default Gallery
