'use client'
import Image from 'next/image'
import { FunctionComponent, useEffect, useRef } from 'react'
import { useInView, useAnimation } from 'framer-motion'
import AnimationProvider from '@/components/Context/AnimationProvider'
import { cn } from '@/lib/utils'
import Button from '../Buttons/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'nextjs-toploader/app'
import { Project, Skill } from '@/payload-types'
import sanitize from '@/utils/sanitize'
import parseMd from '@/utils/parseMd'
import imageUrl from '@/utils/imageUrl'
// import MacbookMockup from '../Atoms/MacbookMockup'

interface Props {
  color?: 'bg-dark-secondary' | 'bg-green' | 'bg-white'
  data: Project
  index: number
  once?: boolean
  loading?: boolean
  onClickEdit?: () => void
  onClickDelete?: () => void
  disabled?: boolean
  showEditButton?: boolean
  showDeleteButton?: boolean
  transitionIn?: boolean
  transitionHover?: boolean
  link?: boolean
}
const CardPortofolio: FunctionComponent<Props> = ( props ) => {
  const {
    color = 'dark-secondary',
    data,
    once = true,
    loading = false,
    onClickEdit = () => null,
    onClickDelete = () => null,
    disabled = false,
    showEditButton = false,
    showDeleteButton = false,
    transitionIn = false,
    transitionHover = false,
    link = false,
    index
  } = props

  const router = useRouter()

  /**
   *  Animation
   */
  const cardRef = useRef<HTMLDivElement>( null )
  const isInView = useInView( cardRef as any, {
    once : true,
  } )
  const animationControl = useAnimation()

  useEffect( () => {
    if ( isInView ) {
      animationControl.start( 'visible' )
    }
  }, [isInView] )

  return (
    <div
      className={cn(
        'relative group overflow-hidden',
        transitionHover && 'hover:scale-95 transition-default'
      )}
      onClick={() => ( link ? router.push( `/portofolio/${data.slug}` ) : '' )}
    >
      <div className="flex gap-2 absolute top-0 w-full opacity-0 -translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 group-hover:delay-300 delay-300  transition-default px-4 py-2 z-10">
        <Button
          disabled
          theme={color === 'bg-white' ? 'light' : 'dark'}
          className="backdrop-blur-md shadow-sm"
        >
          {data.title}
        </Button>
        <Button
          disabled
          theme={color === 'bg-white' ? 'light' : 'dark'}
          className="backdrop-blur-md shadow-sm"
        >
          {(data as any).year}
        </Button>
        <div className="flex items-center justify-center gap-2 ml-auto">
          {showEditButton ? (
            <Button
              variant="icon"
              theme={color === 'bg-white' ? 'light' : 'dark'}
              className="backdrop-blur-md shadow-sm"
              disabled={disabled || loading}
              onClick={() => onClickEdit()}
            >
              <FontAwesomeIcon icon={faPen}
                size="sm"
              />
            </Button>
          ) : (
            ''
          )}
          {showDeleteButton ? (
            <Button
              variant="icon"
              theme={color === 'bg-white' ? 'light' : 'dark'}
              className="backdrop-blur-md shadow-sm"
              disabled={disabled || loading}
              onClick={() => onClickDelete()}
            >
              <FontAwesomeIcon icon={faTrash}
                size="sm"
              />
            </Button>
          ) : (
            ''
          )}
        </div>
      </div>
      {transitionIn ? (
        <AnimationProvider
          className={cn(
            'border border-none rounded-lg w-full overflow-hidden h-52 sm:h-64 md:h-64 items-center relative cursor-pointer',
            'flex flex-row gap-2',
            color,
            color === 'bg-white' && 'text-dark'
          )}
          once={once}
          delay={0.2 + ( index * 0.1 )}
        >
          {/* @ NOTE Text */}
          <div
            className={cn( 'flex flex-col basis-1/2 gap-2 py-6 pl-3 sm:gap-6' )}
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold">{data.title}</h3>
              <div
                className="line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html : sanitize( parseMd( data.description || '' ), 'richtext' ),
                }}
              ></div>
            </div>
            <div className="grow-[1]" />
            <div className="flex gap-1">
              {( data.skills as Skill[] )?.map( ( item, i ) => (
                <div
                  className={`w-4 h-4  border border-none rounded-sm relative overflow-hidden ${
                    color === 'bg-white' && 'shadow-skill'
                  }`}
                  key={i}
                >
                  <Image
                    src={
                      imageUrl( item.image as any, 'thumbnail' ) || ''
                    }
                    style={{
                      objectFit : 'contain',
                    }}
                    sizes="auto"
                    alt="Icon"
                  />
                </div>
              ) )}
            </div>
          </div>
          {data.thumbnail && (
            <div className="basis-1/2 h-full">
              <div className={cn( 'w-full h-full relative' )}>
                <Image
                  src={imageUrl(data.thumbnail as any, 'small') || ''}
                  alt={data.title}
                  fill
                  priority
                  sizes="auto"
                  style={{
                    objectFit : 'contain',
                  }}
                />
              </div>
            </div>
          )}
        </AnimationProvider>
      ) : (
        <div
          className={cn(
            'border border-none rounded-lg w-full overflow-hidden h-52 sm:h-64 md:h-64 items-center relative cursor-pointer transition-default',
            'flex flex-row gap-2',
            color,
            color === 'bg-white' && 'text-dark'
          )}
        >
          {/* @ NOTE Text */}
          <div
            className={cn( 'flex flex-col basis-1/2 gap-2 py-6 pl-3 sm:gap-6' )}
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold">{data.title}</h3>
              <div
                className="line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html : sanitize( parseMd( data.description || '' ), 'richtext' ),
                }}
              ></div>
            </div>
            <div className="grow-[1]" />
            <div className="flex gap-1">
              {( data.skills as Skill[] )?.map( ( item, i ) => (
                <div
                  className={`w-4 h-4  border border-none rounded-sm relative overflow-hidden ${
                    color === 'bg-white' && 'shadow-skill'
                  }`}
                  key={i}
                >
                  <Image
                    src={
                      imageUrl(
                        item.image,
                        'thumbnail'
                      ) || ''
                    }
                    fill
                    style={{
                      objectFit : 'contain',
                    }}
                    sizes="auto"
                    alt="Icon"
                  />
                </div>
              ) )}
            </div>
          </div>
          {data.thumbnail && (
            <div className="basis-1/2 h-full">
              <div className={cn( 'w-full h-full relative' )}>
                <Image
                  src={imageUrl(data.thumbnail as any, 'small') || ''}
                  alt={data.title}
                  fill
                  priority
                  sizes="auto"
                  style={{
                    objectFit : 'contain',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CardPortofolio
