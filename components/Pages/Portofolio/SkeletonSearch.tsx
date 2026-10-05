import SkeletonCard from './SkeletonCard'

const SkeletonSearch = () => {
  /**
   *  fake array
   */
  const mockLoop = new Array( 9 ).fill( 0 )

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20 sm:mt-20 flex flex-col gap-4 animate-pulse w-full">
      <div className="flex gap-4">
        <div className="h-8 w-8 bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        <div className="h-8 w-full max-w-xs bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
      </div>
      <div className="flex flex-col gap-8 h-full pb-4">
        <div className="h-8 max-w-xs bg-light-secondary dark:bg-dark-secondary rounded-lg" />
        <div className="flex flex-col gap-8">
          <ul className="list-none ml-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockLoop.map( ( _item, i ) => (
              <li key={i}>
                <SkeletonCard />
              </li>
            ) )}
          </ul>
          <div className="h-8 w-20 bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonSearch
