// Dates are rendered on the server and again in the browser during hydration.
// Pinning the time zone keeps both renders identical regardless of where the
// server runs or where the visitor is, avoiding hydration mismatches.
export const DISPLAY_TIME_ZONE = 'Asia/Jakarta'

const formatDate = (
  date: string | number | Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = { month : 'short', day : 'numeric', year : 'numeric' }
) => new Date( date ).toLocaleDateString( locale, { timeZone : DISPLAY_TIME_ZONE, ...options } )

export default formatDate

/** Calendar year and month (0-11) of a date in DISPLAY_TIME_ZONE */
export const getYearMonth = ( date: string | number | Date ) => {
  const parts = new Intl.DateTimeFormat( 'en-US', { timeZone : DISPLAY_TIME_ZONE, year : 'numeric', month : 'numeric' } )
    .formatToParts( new Date( date ) )
  const get = ( type: string ) => Number( parts.find( ( part ) => part.type === type )?.value )

  return { year : get( 'year' ), month : get( 'month' ) - 1 }
}
