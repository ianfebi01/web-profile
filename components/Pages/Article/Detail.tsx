'use client'
import Image from 'next/image'
import imageUrl from '@/utils/imageUrl'
import Markdown from '@/components/Parsers/Markdown'
import imageLoader from '@/lib/constans/image-loader'
import SkeletonDetail from '../Portofolio/SkeletonDetail'
import Header from '@/components/Layouts/Header'
import Chip from '@/components/Chip'
import { useTranslations } from 'next-intl'
import { Article } from '@/payload-types'

interface Props {
  data: Article | null
  isFetching?: boolean
}

const Detail = ( { data, isFetching }: Props ) => {
  const t = useTranslations();

  return (
    <section
      id="portofolio"
      className="w-full flex flex-col items-center bg-dark grow-[1]"
    >
      {isFetching || !data ? (
        <SkeletonDetail />
      ) : (
        <div className="w-full h-full grow-[1] max-w-5xl px-6 lg:px-8 mt-20 sm:mt-20 mb-8 flex flex-col gap-4">
          <Header text={t( 'back' )}
            link={'/article'}
          />
          <div className="flex flex-col w-full max-w-3xl gap-4 mx-auto">
            <div className="relative w-full aspect-video">
              {!!data?.heroImage && (
                <>
                  <Image
                    className="hidden object-cover object-center w-full h-full md:block"
                    src={imageUrl(data.heroImage as any, 'xlarge') || ''}
                    fill
                    sizes="auto"
                    alt={`${data.title} Image`}
                    loading="eager"
                    placeholder={imageLoader}
                  />
                  <Image
                    className="object-cover object-center w-full h-full md:hidden"
                    src={imageUrl(data.heroImage as any, 'small') || ''}
                    fill
                    sizes="auto"
                    alt={`${data.title} Image`}
                    loading="lazy"
                    placeholder={imageLoader}
                  />
                </>
              )}
            </div>

            <h1 className="mt-4 mb-0">{data?.title}</h1>

            <div className="flex flex-col w-full gap-4">
              {!!data?.createdAt && (
                <Chip label={new Date(data.createdAt).toLocaleDateString()}
                  bg="dark-secondary"
                />
              )}
              {!!data?.content && (
                <div className="flex flex-col gap-4 p-4 border border-none rounded-lg bg-dark-secondary text-white/90">
                  <Markdown content={data.content} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Detail
