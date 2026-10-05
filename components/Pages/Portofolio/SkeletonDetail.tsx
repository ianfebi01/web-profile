const SkeletonDetail = () => {
  return (
    <div className="max-w-3xl mx-auto w-full px-6 lg:px-8 mt-20 sm:mt-20 mb-8 flex flex-col gap-4 animate-pulse">
      <div className="my-4 flex flex-col gap-2">
        <div className="h-12 min-w-60 bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        <div className="h-4 max-w-xs bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
      </div>
      <div className="relative aspect-video bg-light-secondary dark:bg-dark-secondary"></div>
      <div className="flex flex-col gap-2 mt-4">
        <div className="h-3 max-w-xs bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        <div className="h-3 w-full bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        <div className="h-3 w-full bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        <div className="h-3 w-full bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        <div className="h-3 w-full bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        <div className="h-3 w-full bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
        <div className="h-3 max-w-xs bg-light-secondary dark:bg-dark-secondary rounded-lg"></div>
      </div>
    </div>
  )
}

export default SkeletonDetail
