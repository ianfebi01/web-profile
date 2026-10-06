/**
 * Post-processes rendered rich-text HTML for accessibility:
 * - Re-levels headings so they never skip a level and never compete with the
 *   page's own heading (`baseLevel`). e.g. with baseLevel 1 an `<h1>` in the
 *   content becomes `<h2>` and an `<h4>` straight after it becomes `<h3>`.
 * - Makes horizontally scrollable code blocks (`pre > code`, which owns the
 *   overflow) keyboard focusable.
 */
const a11yHtml = ( html: string, baseLevel = 1 ): string => {
  let previous = baseLevel
  // Maps an original heading level to the level it was rewritten to, so the
  // matching closing tag is rewritten the same way
  const stack: number[] = []

  const releveled = html.replace( /<(\/?)h([1-6])(\s[^>]*)?>/gi, ( _match, closing: string, level: string, attrs = '' ) => {
    if ( closing ) {
      return `</h${stack.pop() ?? level}>`
    }

    const next = Math.min( Math.max( Number( level ), baseLevel + 1 ), previous + 1, 6 )
    previous = next
    stack.push( next )

    return `<h${next}${attrs}>`
  } )

  return releveled.replace( /(<pre(?:\s[^>]*)?>\s*)<code(?![^>]*tabindex)(\s[^>]*)?>/gi, ( _match, pre: string, attrs = '' ) => `${pre}<code tabindex="0"${attrs}>` )
}

export default a11yHtml
