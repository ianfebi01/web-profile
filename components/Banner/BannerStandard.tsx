import React from 'react';
import VideoPlayer from '@/components/VideoPlayer'
import { cn } from '@/lib/utils'
import isVideo from '@/utils/is-video'
import { BannerComponentsBannerStandard } from '@/types/generated/components'
import imageUrl from '@/utils/imageUrl'
import Markdown from '../Parsers/Markdown'
import ButtonGroup from '../Buttons/ButtonsGroup'

interface BannerProps {
  sectionData: BannerComponentsBannerStandard['attributes']
}

const BannerStandard: React.FC<BannerProps> = ( { sectionData } ) => {
  return (
    <>
      <section
        className={cn(
          'relative overflow-x-clip min-h-screen xxl:min-h-[710px] items-center',
          'flex md:hidden',
          !(sectionData.background?.data || sectionData.background) && 'bg-grey'
        )}
        style={
          !!(sectionData.background?.data || sectionData.background) &&
          !isVideo( sectionData.background?.data || sectionData.background )
            ? {
              background : `url(${imageUrl(
                sectionData.background?.data || sectionData.background,
                'small'
              )}) no-repeat center center / cover`,
            }
            : undefined
        }
      >
        {!!(sectionData.background?.data || sectionData.background) &&
          isVideo( sectionData.background?.data || sectionData.background ) && (
          <div className="absolute w-full h-full">
            <VideoPlayer
              sources={[
                {
                  location :
                      imageUrl( sectionData.background?.data || sectionData.background, 'original' ) || '',
                  codec : (sectionData.background?.data?.attributes?.mime || (sectionData.background as any)?.mimeType) || '',
                },
              ]}
              isPlaying={true}
              autoplay={true}
              loop={true}
              inline={true}
              dimension="cover"
            />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col pr-6 lg:pr-8 justify-center h-full relative z-10 py-28 xxl:py-48 overflow-x-clip">
          <div className="flex flex-col justify-center items-start max-w-3xl">
            {sectionData.heading && (
              <h1
                className={cn(
                  'font-extra-bold mt-0 w-fit text-white relative z-[1]',
                  'text-3xl lg:text-5xl xxl:text-[4.35rem] xxl:leading-[4.5rem]',
                  'drop-shadow-20-0.5'
                )}
              >
                {sectionData.heading}
              </h1>
            )}
            {!!sectionData.description && (
              <div className="drop-shadow-20-0.5">
                <Markdown content={sectionData.description} />
              </div>
            )}
            {sectionData.buttons?.length && (
              <ButtonGroup buttons={sectionData.buttons} />
            )}
          </div>
        </div>
      </section>
      <section
        className={cn(
          'relative overflow-x-clip min-h-screen xxl:min-h-[710px] items-center',
          'hidden md:flex',
          !(sectionData.background?.data || sectionData.background) && 'bg-grey'
        )}
        style={
          !!(sectionData.background?.data || sectionData.background) &&
          !isVideo( sectionData.background?.data || sectionData.background )
            ? {
              background : `url(${imageUrl(
                sectionData.background?.data || sectionData.background,
                'small'
              )}) no-repeat center center / cover`,
            }
            : undefined
        }
      >
        {!!(sectionData.background?.data || sectionData.background) &&
          isVideo( sectionData.background?.data || sectionData.background ) && (
          <div className="absolute w-full h-full">
            <VideoPlayer
              sources={[
                {
                  location :
                      imageUrl( sectionData.background?.data || sectionData.background, 'original' ) || '',
                  codec : (sectionData.background?.data?.attributes?.mime || (sectionData.background as any)?.mimeType) || '',
                },
              ]}
              isPlaying={true}
              autoplay={true}
              loop={true}
              inline={true}
              dimension="cover"
            />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col pr-6 lg:pr-8 justify-center h-full relative z-10 py-28 xxl:py-48 overflow-x-clip">
          <div className="flex flex-col justify-center items-start max-w-3xl">
            {sectionData.heading && (
              <h1
                className={cn(
                  'font-extra-bold mt-0 w-fit text-white relative z-[1]',
                  'text-3xl lg:text-5xl xxl:text-[4.35rem] xxl:leading-[4.5rem]',
                  'drop-shadow-20-0.5'
                )}
              >
                {sectionData.heading}
              </h1>
            )}
            {!!sectionData.description && (
              <div className="drop-shadow-20-0.5">
                <Markdown content={sectionData.description} />
              </div>
            )}
            {sectionData.buttons?.length && (
              <ButtonGroup buttons={sectionData.buttons} />
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default BannerStandard
