import { ApiError, GoogleGenAI } from '@google/genai'
import type { Payload } from 'payload'

import { uploadCoverImage } from './coverImage'

// Tried in order; a later model is used only when the previous one stays overloaded.
// Override with GEMINI_MODEL, comma-separated (e.g. "gemini-3.8-flash,gemini-3.6-flash").
const DEFAULT_MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash']
// Skip generation if an AI article was already created within this window,
// so retried or duplicated workflow runs don't publish twice in one day.
const MIN_HOURS_BETWEEN_ARTICLES = 20

type LocalizedArticle = {
  title: string
  slug: string
  introText: string
  content: string
}

type GeneratedArticle = {
  tags: string[]
  imageQuery: string
  en: LocalizedArticle
  id: LocalizedArticle
}

export type GenerateArticleResult =
  | { status: 'created'; id: string; title: string; slug: string }
  | { status: 'skipped'; reason: string }

const localizedSchema = {
  type       : 'object',
  properties : {
    title     : { type : 'string', description : 'Article title, max 80 characters' },
    slug      : { type : 'string', description : 'URL slug: lowercase, hyphen-separated, ascii only' },
    introText : { type : 'string', description : 'One or two sentence summary, max 200 characters' },
    content   : { type : 'string', description : 'Full article body in Markdown, without the title heading' },
  },
  required : ['title', 'slug', 'introText', 'content'],
}

const responseSchema = {
  type       : 'object',
  properties : {
    tags : {
      type        : 'array',
      items       : { type : 'string' },
      description : 'Slugs chosen only from the provided list of existing tags',
    },
    imageQuery : {
      type        : 'string',
      description : '1 to 3 broad English keywords for a free stock photo search that visually fits the article',
    },
    en : localizedSchema,
    id : localizedSchema,
  },
  required : ['tags', 'imageQuery', 'en', 'id'],
}

const slugify = ( value: string ) =>
  value
    .toLowerCase()
    .normalize( 'NFKD' )
    .replace( /[^a-z0-9\s-]/g, '' )
    .trim()
    .replace( /[\s-]+/g, '-' )
    .slice( 0, 80 )
    .replace( /-+$/, '' )

const uniqueSlug = async ( payload: Payload, slug: string, locale: 'en' | 'id' ) => {
  const base = slugify( slug ) || `article-${Date.now()}`
  const existing = await payload.find( {
    collection : 'articles',
    locale,
    where      : { slug : { equals : base } },
    limit      : 1,
    depth      : 0,
  } )

  return existing.totalDocs ? `${base}-${new Date().toISOString().slice( 0, 10 )}` : base
}

const buildPrompt = ( {
  bio,
  tags,
  recentTitles,
  topicHint,
}: {
  bio: string
  tags: { slug: string; title: string }[]
  recentTitles: string[]
  topicHint?: string
} ) => `You write blog articles for the personal website of a software engineer.

Author bio:
${bio || 'A web developer focused on modern JavaScript, React, Next.js and full-stack development.'}

${topicHint ? `Preferred topic areas: ${topicHint}\n` : ''}
Pick ONE fresh, specific, practical topic relevant to the author's expertise. Do NOT repeat or closely
overlap with these recently published titles:
${recentTitles.length ? recentTitles.map( ( t ) => `- ${t}` ).join( '\n' ) : '- (none yet)'}

Write the article in English ("en") and a natural Indonesian translation ("id"), not a word-for-word one.

Requirements:
- 800 to 1200 words per language.
- Markdown body using ## and ### headings, short paragraphs, lists where useful, and fenced code
  blocks with a language tag when showing code. Do not include the title as a heading.
- Accurate and verifiable; no invented statistics, quotes, links or version numbers you are unsure of.
- First person is fine, but do not invent personal anecdotes, employers or clients.
- Choose 1 to 3 tag slugs from this list only (return an empty array if none fit):
${tags.length ? tags.map( ( t ) => `  - ${t.slug} (${t.title})` ).join( '\n' ) : '  (no tags available)'}`

export type GenerationState = {
  runId: string
  running: boolean
  startedAt: string
  finishedAt?: string
  result?: GenerateArticleResult
  error?: string
}

// Generation outlasts the proxy timeout (Cloudflare: 100s), so the endpoint starts it in the
// background and the workflow polls this state. Module-level state is fine on our single
// long-lived server, and also stops a second run from starting while one is in progress.
let state: GenerationState | null = null

export const getGenerationState = () => state

/** Returns the new run's state, or the current one if a generation is already running. */
export const startGeneration = (
  payload: Payload,
  options: { force?: boolean } = {},
): { state: GenerationState; started: boolean; run?: () => Promise<void> } => {
  if ( state?.running ) return { state, started : false }

  const current: GenerationState = {
    runId     : crypto.randomUUID(),
    running   : true,
    startedAt : new Date().toISOString(),
  }
  state = current

  const run = async () => {
    try {
      current.result = await generateArticle( payload, options )
    } catch ( error ) {
      current.error = error instanceof Error ? error.message : 'Generation failed'
      payload.logger.error( { err : error, msg : 'AI article generation failed' } )
    } finally {
      current.running = false
      current.finishedAt = new Date().toISOString()
    }
  }

  return { state : current, started : true, run }
}

export const generateArticle = async (
  payload: Payload,
  { force = false }: { force?: boolean } = {},
): Promise<GenerateArticleResult> => {

  const apiKey = process.env.GEMINI_API_KEY
  if ( !apiKey ) throw new Error( 'GEMINI_API_KEY is not set' )

  if ( !force ) {
    const since = new Date( Date.now() - MIN_HOURS_BETWEEN_ARTICLES * 60 * 60 * 1000 )
    const recentAi = await payload.find( {
      collection : 'articles',
      where      : {
        and : [
          { aiGenerated : { equals : true } },
          { createdAt : { greater_than : since.toISOString() } },
        ],
      },
      limit : 1,
      depth : 0,
    } )

    if ( recentAi.totalDocs ) {
      return { status : 'skipped', reason : `An AI article was already created in the last ${MIN_HOURS_BETWEEN_ARTICLES}h` }
    }
  }

  const [profile, tagDocs, recent] = await Promise.all( [
    payload.findGlobal( { slug : 'profile', locale : 'en', depth : 0 } ),
    payload.find( { collection : 'tags', limit : 200, depth : 0, pagination : false } ),
    payload.find( { collection : 'articles', locale : 'en', sort : '-createdAt', limit : 50, depth : 0 } ),
  ] )

  const tags = tagDocs.docs.map( ( t ) => ( { id : t.id, slug : t.slug, title : t.title } ) )

  const ai = new GoogleGenAI( {
    apiKey,
    // Retry 429/5xx ("model is experiencing high demand") with backoff: ~10s, 20s, 40s
    httpOptions : { retryOptions : { attempts : 4, initialDelay : 10, maxDelay : 60 } },
  } )
  const prompt = buildPrompt( {
    bio          : profile?.bio || '',
    tags,
    recentTitles : recent.docs.map( ( a ) => a.title ).filter( Boolean ),
    topicHint    : process.env.ARTICLE_TOPICS,
  } )
  const models = process.env.GEMINI_MODEL?.split( ',' ).map( ( m ) => m.trim() ).filter( Boolean ) ?? DEFAULT_MODELS

  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | undefined
  for ( const [index, model] of models.entries() ) {
    try {
      response = await ai.models.generateContent( {
        model,
        contents : prompt,
        config   : {
          responseMimeType   : 'application/json',
          responseJsonSchema : responseSchema,
        },
      } )
      break
    } catch ( error ) {
      const overloaded = error instanceof ApiError && ( error.status === 429 || error.status >= 500 )
      if ( !overloaded || index === models.length - 1 ) throw error
      payload.logger.warn( `Gemini model ${model} unavailable (${error.status}); falling back to ${models[index + 1]}` )
    }
  }

  if ( !response ) throw new Error( 'No Gemini model configured' )

  if ( !response.text ) throw new Error( 'Gemini returned an empty response' )

  const article = JSON.parse( response.text ) as GeneratedArticle
  for ( const locale of ['en', 'id'] as const ) {
    if ( !article[locale]?.title || !article[locale]?.content ) {
      throw new Error( `Gemini response is missing the "${locale}" article` )
    }
  }

  // A missing cover image should never block the daily article
  let heroImage: string | null = null
  try {
    heroImage = await uploadCoverImage( payload, article.imageQuery || article.en.title )
  } catch ( error ) {
    payload.logger.warn( { err : error, msg : 'Cover image lookup failed; publishing without one' } )
  }

  const tagIds = tags.filter( ( t ) => article.tags?.includes( t.slug ) ).map( ( t ) => t.id )

  const created = await payload.create( {
    collection : 'articles',
    locale     : 'en',
    data       : {
      title       : article.en.title,
      slug        : await uniqueSlug( payload, article.en.slug || article.en.title, 'en' ),
      introText   : article.en.introText,
      content     : article.en.content,
      tags        : tagIds,
      aiGenerated : true,
      heroImage,
    },
  } )

  await payload.update( {
    collection : 'articles',
    id         : created.id,
    locale     : 'id',
    data       : {
      title     : article.id.title,
      slug      : await uniqueSlug( payload, article.id.slug || article.id.title, 'id' ),
      introText : article.id.introText,
      content   : article.id.content,
      tags      : tagIds,
      heroImage,
    },
  } )

  return { status : 'created', id : created.id, title : created.title, slug : created.slug }
}
