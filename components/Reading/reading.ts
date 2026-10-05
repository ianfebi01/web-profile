export const AUTHOR_NAME = 'Ian Febi Sastrataruna'
export const AUTHOR_AVATAR = '/me.png'

const WORDS_PER_MINUTE = 200

export const getReadingTime = ( content?: string | null ) => {
  const words = content?.trim().split( /\s+/ ).length ?? 0

  return Math.max( 1, Math.round( words / WORDS_PER_MINUTE ) )
}
