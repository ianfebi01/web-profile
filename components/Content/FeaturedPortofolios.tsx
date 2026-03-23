import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Button2 from '../Buttons/Button2'
import { Link } from '@/i18n/navigation'
import NoDataFound from '../NoDataFound'
import { getLocale } from 'next-intl/server'
import PortofoliosWrapper from '../PortofoliosWrapper'

const FeaturedPortofolios = async () => {
  const locale = await getLocale()

  const payload = await getPayload({ config: configPromise })
  const responseData = await payload.find({
    collection: 'projects',
    locale: locale as 'en' | 'id',
    limit: 3,
    sort: '-createdAt',
    depth: 2
  })

  if ( responseData.docs?.length === 0 ) return <NoDataFound />

  return (
    <div className="flex flex-col gap-4">
      <PortofoliosWrapper
        portofolios={responseData?.docs}
      />
      <Link className="no-underline"
        href={'/portofolio'}
      >
        <Button2 variant="secondary"
          className="w-fit"
        >
          Show more
        </Button2>
      </Link>

                {/* 
        1. .magnet-zone acts as the large invisible bounding box. 
           Hovering anywhere in here (even over the word "Menu") triggers the physics.
      */}
      <div 
        className="magnet-zone flex items-center gap-4 p-4 -m-4 cursor-pointer group" 
        data-name="burger" 
      >
        {/* The text sits inside the zone, but isn't the physical magnet target */}
        <span className="text-[15px] font-bold text-white group-hover:text-[#F26B50] transition-colors">
          Menu
        </span>

        {/* 
          2. .magnet-target is the physical element that gets pulled. 
          The cursor magically maps its position exactly to the center of THIS element
          instead of your raw mouse coordinates! 
        */}
        <button 
          className="magnet-target flex items-center justify-center w-12 h-12 rounded-full bg-dark text-white"
          aria-label="Menu"
        >
          {/* Burger 3 Dots */}
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          </div>
        </button>
      </div>


    </div>
  )
}

export default FeaturedPortofolios
