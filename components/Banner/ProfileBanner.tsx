'use client'
import LinkOpenNewTab from '@/components/Buttons/LinkOpenNewTab'
import InstagramIcon from '@/components/Icons/InstagramIcon'
import LinkedinIcon from '@/components/Icons/LinkedinIcon'
import CopyToClipboard from '@/components/Inputs/CopyToClipboard'
import Shape from '@/components/Shape'
import Image from 'next/image'
import React, { FunctionComponent, useRef } from 'react'
import { scalePow } from 'd3-scale'
import { cn } from '@/lib/utils'
import { BannerComponentsProfileBanner } from '@/types/generated/components'
import imageUrl from '@/utils/imageUrl'
import sanitize from '@/utils/sanitize'
import parseMd from '@/utils/parseMd'
import { ApiSocialSocial } from '@/types/generated/contentTypes'
import imageLoader from '@/lib/constans/image-loader'

interface Props {
  sectionData: BannerComponentsProfileBanner['attributes']
  myposy?: number
  winheight?: number
}

const ProfileBanner: FunctionComponent<Props> = ( props ) => {
  const { sectionData, myposy } = props

  const ref = useRef<HTMLElement>( null )

  const translate = scalePow().domain( [-2000, 2000] ).range( [-100, 100] )
  const opacity = scalePow()
    .domain( [
      0,
      ref.current?.offsetHeight ? ref.current?.offsetHeight - 40 : 1000,
    ] )
    .range( [1, 0] )

  return (
    <section
      ref={ref}
      id="home"
      className={cn( 'main__section !px-0 sm:px-0 md:px-0 bg-dark relative' )}
      style={{
        opacity : opacity.exponent( 1 )( myposy ? -myposy : 1 ),
      }}
    >
      <Shape myposy={myposy ? myposy : 0} />
      <div
        className={cn(
          'flex w-full h-56 relative bg-cover bg-center bg-no-repeat md:hidden',
        )}
        style={{
          backgroundImage : `url(${imageUrl( sectionData.bannerImage?.data || sectionData.bannerImage, 'small' )})`
        }}
      >
        <div
          className="aspect-square w-48 border border-none rounded-full overflow-hidden inset-x-0 mx-auto absolute -bottom-24"
          style={{
            transform : `translate(0, ${translate.exponent( 1 )(
              myposy ? -myposy : 0
            )}px)`,
          }}
        >
          <Image
            src={imageUrl( sectionData.avatar?.data || sectionData.avatar, 'small' ) || ''}
            alt="Profile image"
            fill
            priority
            sizes="auto"
            className="object-cover"
            placeholder={imageLoader}
          />
        </div>
      </div>
      <div
        className={cn(
          'w-full h-56 relative bg-cover bg-center bg-no-repeat hidden md:flex',
        )}
        style={{
          backgroundImage : `url(${imageUrl( sectionData.bannerImage?.data || sectionData.bannerImage, 'medium' )})`
        }}
      >
        <div
          className="aspect-square w-48 border border-none rounded-full overflow-hidden inset-x-0 mx-auto absolute -bottom-24"
          style={{
            transform : `translate(0, ${translate.exponent( 1 )(
              myposy ? -myposy : 0
            )}px)`,
          }}
        >
          <Image
            src={imageUrl( sectionData.avatar?.data || sectionData.avatar, 'medium' ) || ''}
            alt="Profile image"
            fill
            priority
            sizes="auto"
            className="object-cover"
            placeholder={imageLoader}
          />
        </div>
      </div>
      <div
        className="w-full grow-[1] max-w-3xl relative overflow-hidden mt-32 mb-20 flex flex-col gap-4 sm:px-4 px-4 md:px-4 lg:px-0 xl:px-0 2xl:px-0"
        style={{
          transform : `translate(0, ${translate.exponent( 1 )(
            myposy ? -myposy : 0
          )}px)`,
        }}
      >
        <h1 className="text-center m-0">{sectionData.name}</h1>
        <div
          className="text-center text-white/75 body-copy"
          dangerouslySetInnerHTML={{
            __html : sanitize( parseMd( sectionData.bio ), 'richtext' ),
          }}
        ></div>
        <div className="text-lg flex gap-4 text-center w-full justify-center items-center flex-wrap">
          {( (sectionData.socials?.data || sectionData.socials) as any[] ).map( ( item, i ) => {
            const platform = item?.attributes?.social?.platform || item?.platform
            const url = item?.attributes?.social?.url || item?.url

            switch ( platform ) {
            case 'LinkedIn':
              return (
                <React.Fragment key={`linkedin-${i}`}>
                  <LinkOpenNewTab
                    url={url}
                    label="LinkedIn"
                    className="text-md"
                    icon={<LinkedinIcon size={20} />}
                  />
                  <span key={`dot-linkedin-${i}`}
                    className="last:hidden"
                  >
                      •
                  </span>
                </React.Fragment>
              )

            case 'Instagram':
              return (
                <React.Fragment key={`instagram-${i}`}>
                  <LinkOpenNewTab
                    url={url}
                    label="Instagram"
                    className="text-md"
                    icon={<InstagramIcon size={20} />}
                  />
                  <span key={`dot-instagram-${i}`}
                    className="last:hidden"
                  >
                      •
                  </span>
                </React.Fragment>
              )

            case 'Email':
              return (
                <React.Fragment key={`email-${i}`}>
                  <div className="flex flex-row items-center gap-2">
                    <CopyToClipboard copyText={url}
                      className="text-md"
                    />
                  </div>
                  <span key={`dot-email-${i}`}
                    className="last:hidden"
                  >
                      •
                  </span>
                </React.Fragment>
              )

            default:
              return null
            }
          } )}
        </div>
      </div>
    </section>
  )
}

export default ProfileBanner
