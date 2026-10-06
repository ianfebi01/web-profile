/* eslint-disable no-console -- the crawl report is printed for CI logs */
import { test, expect, Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'

/**
 * Crawls every page reachable from the locale home pages (plus everything
 * listed in sitemap.xml) and runs axe-core WCAG 2.2 AA checks in both light
 * and dark themes. Also asserts basic on-page SEO requirements.
 */

const SEEDS = ['/en', '/id']
const MAX_PAGES = Number( process.env.A11Y_MAX_PAGES || 200 )
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

const normalize = ( href: string, origin: string ): string | null => {
  try {
    const url = new URL( href, origin )
    if ( url.origin !== origin ) return null
    if ( /^\/(admin|api|_next)/.test( url.pathname ) ) return null
    if ( /\.[a-z0-9]+$/i.test( url.pathname ) ) return null

    return url.pathname.replace( /\/$/, '' ) || '/'
  } catch {
    return null
  }
}

const collectLinks = async ( page: Page, origin: string ) => {
  const hrefs = await page.$$eval( 'a[href]', ( as ) => as.map( ( a ) => a.getAttribute( 'href' ) || '' ) )

  return hrefs.map( ( h ) => normalize( h, origin ) ).filter( Boolean ) as string[]
}

const sitemapPaths = async ( page: Page, origin: string ) => {
  const res = await page.request.get( '/sitemap.xml' )
  if ( !res.ok() ) return []
  const xml = await res.text()

  return [...xml.matchAll( /<loc>([^<]+)<\/loc>/g )]
    .map( ( m ) => {
      try {
        return new URL( m[1] ).pathname
      } catch {
        return null
      }
    } )
    .map( ( p ) => ( p ? normalize( p, origin ) : null ) )
    .filter( Boolean ) as string[]
}

const discoverPages = async ( page: Page, origin: string ) => {
  const queue = [...SEEDS, ...( await sitemapPaths( page, origin ) )]
  const seen = new Set<string>()

  while ( queue.length && seen.size < MAX_PAGES ) {
    const path = queue.shift() as string
    if ( seen.has( path ) ) continue
    const res = await page.goto( path, { waitUntil : 'domcontentloaded' } )
    if ( !res || res.status() >= 400 ) {
      seen.add( path )
      continue
    }
    seen.add( path )
    for ( const link of await collectLinks( page, origin ) ) {
      if ( !seen.has( link ) ) queue.push( link )
    }
  }

  return [...seen]
}

test( 'crawl site: accessibility (axe) + on-page SEO', async ( { page, baseURL } ) => {
  const origin = new URL( baseURL as string ).origin
  const paths = await discoverPages( page, origin )
  const report: string[] = []
  const brokenLinks: string[] = []
  const details: unknown[] = []

  for ( const path of paths ) {
    for ( const theme of ['light', 'dark'] as const ) {
      await page.emulateMedia( { colorScheme : theme, reducedMotion : 'reduce' } )
      await page.addInitScript( ( t ) => {
        try {
          localStorage.setItem( 'theme', t )
        } catch {}
      }, theme )
      const res = await page.goto( path, { waitUntil : 'networkidle' } )
      if ( !res || res.status() >= 400 ) {
        if ( theme === 'light' ) brokenLinks.push( `${path} -> ${res?.status()}` )
        continue
      }
      // Let entrance animations settle so contrast is measured on final styles
      await page.waitForTimeout( 1500 )

      const results = await new AxeBuilder( { page } )
        .withTags( WCAG_TAGS )
        .exclude( '#nextjs-toploader' )
        .analyze()

      for ( const v of results.violations ) {
        details.push( {
          path, theme, id     : v.id, impact : v.impact, help   : v.help,
          nodes  : v.nodes.map( ( n ) => ( { target : n.target, html : n.html, summary : n.failureSummary } ) ),
        } )
        const targets = v.nodes.slice( 0, 5 ).map( ( n ) => `      - ${n.target.join( ' ' )}` ).join( '\n' )
        report.push( `[${theme}] ${path}\n  ${v.impact} ${v.id}: ${v.help} (${v.nodes.length})\n${targets}` )
      }

      if ( theme === 'light' ) {
        const seo = await page.evaluate( () => ( {
          lang        : document.documentElement.lang,
          title       : document.title,
          description : document.querySelector( 'meta[name="description"]' )?.getAttribute( 'content' ) || '',
          canonical   : document.querySelector( 'link[rel="canonical"]' )?.getAttribute( 'href' ) || '',
          h1          : document.querySelectorAll( 'h1' ).length,
          jsonLd      : [...document.querySelectorAll( 'script[type="application/ld+json"]' )].map( ( s ) => s.textContent || '' ),
        } ) )
        const problems: string[] = []
        if ( !seo.lang ) problems.push( 'missing <html lang>' )
        if ( !seo.title ) problems.push( 'missing <title>' )
        if ( !seo.description ) problems.push( 'missing meta description' )
        if ( !seo.canonical ) problems.push( 'missing canonical' )
        if ( seo.h1 !== 1 ) problems.push( `expected 1 <h1>, found ${seo.h1}` )
        if ( !seo.jsonLd.length ) problems.push( 'missing JSON-LD structured data' )
        for ( const json of seo.jsonLd ) {
          try {
            JSON.parse( json )
          } catch {
            problems.push( 'invalid JSON-LD' )
          }
        }
        if ( problems.length ) report.push( `[seo] ${path}\n  ${problems.join( '\n  ' )}` )
      }
    }
  }

  mkdirSync( 'test-results', { recursive : true } )
  writeFileSync( 'test-results/a11y-report.json', JSON.stringify( details, null, 2 ) )

  console.log( `\nCrawled ${paths.length} pages:\n  ${paths.join( '\n  ' )}\n` )
  if ( brokenLinks.length ) console.log( `Broken links:\n  ${brokenLinks.join( '\n  ' )}\n` )
  if ( report.length ) console.log( report.join( '\n\n' ) )

  expect( brokenLinks, 'broken internal links' ).toEqual( [] )
  expect( report, 'accessibility / SEO violations' ).toEqual( [] )
} )
