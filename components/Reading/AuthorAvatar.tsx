import { cn } from '@/lib/utils'
import { AUTHOR_INITIALS } from './reading'

interface Props {
  size?: 'sm' | 'md'
}

const sizeClass = {
  sm : 'size-6 text-[8px]',
  md : 'size-11 text-sm',
}

// Initials badge used in place of an author photo
const AuthorAvatar = ( { size = 'md' }: Props ) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight leading-none select-none',
      'bg-black text-white dark:bg-white dark:text-dark',
      sizeClass[size]
    )}
  >
    {AUTHOR_INITIALS}
  </span>
)

export default AuthorAvatar
