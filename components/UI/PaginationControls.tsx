'use client'

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: ( page: number ) => void
  previousLabel: string
  nextLabel: string
  pageLabel: string
}

const PaginationControls = ( {
  currentPage,
  totalPages,
  onPageChange,
  previousLabel,
  nextLabel,
  pageLabel,
}: Props ) => {
  if ( totalPages <= 1 ) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="m-0 text-sm text-white/70 sm:text-base">
        {pageLabel} {currentPage} / {totalPages}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onPageChange( currentPage - 1 )}
          disabled={currentPage <= 1}
          className="button button-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{previousLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange( currentPage + 1 )}
          disabled={currentPage >= totalPages}
          className="button button-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{nextLabel}</span>
        </button>
      </div>
    </div>
  )
}

export default PaginationControls