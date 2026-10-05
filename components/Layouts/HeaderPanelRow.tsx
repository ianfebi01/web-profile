// Shared row styling for the menu panel items
export const panelRowClass =
  'group flex items-baseline gap-4 w-full px-3 py-3 rounded-2xl no-underline transition-colors duration-200 hover:bg-light-secondary dark:hover:bg-dark-secondary'

export const PanelIndex = ( { index }: { index: number } ) => (
  <span className="w-6 shrink-0 font-code text-xs text-black/35 dark:text-white/35 group-hover:text-orange transition-colors">
    {String( index + 1 ).padStart( 2, '0' )}
  </span>
)

export const panelLabelClass = 'text-2xl md:text-[28px] font-bold tracking-tight leading-tight'
