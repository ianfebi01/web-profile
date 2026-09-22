import React from 'react'

const SkeletonCard = () => (
  <article className="h-64 md:h-64 p-4 border border-none rounded-lg flex gap-2 animate-pulse bg-dark-secondary">
    <div className="basis-1/2 w-full flex flex-col justify-center gap-2">
      <div className="h-6 bg-dark-secondary max-w-40" />
      <div className="h-4 bg-dark-secondary" />
      <div className="h-4 bg-dark-secondary max-w-52" />
    </div>
    <div className="basis-1/2 w-full">
      <div className="h-full w-full bg-dark-secondary"></div>
    </div>
  </article>
)

export default SkeletonCard
