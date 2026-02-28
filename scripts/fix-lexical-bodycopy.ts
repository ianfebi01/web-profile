import fs from 'fs'
import { MongoClient } from 'mongodb'

const envFile = fs.readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

// Extract string from currently mangled AST
function extractText(data: any): string {
  if (typeof data === 'string') return data
  if (data?.root?.children) {
    return data.root.children.map((c: any) => {
      if (c.children) {
        return c.children.map((t: any) => t.text || '').join('')
      }
      return ''
    }).join('\n')
  }
  return ''
}

function parseTextWithModes(text: string) {
  const children = []
  const regex = /(\*\*.*?\*\*)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      children.push({
        mode: "normal",
        text: text.substring(lastIndex, match.index),
        type: "text",
        style: "",
        detail: 0,
        format: 0,
        version: 1
      });
    }
    const boldText = match[0].substring(2, match[0].length - 2);
    children.push({
      mode: "normal",
      text: boldText,
      type: "text",
      style: "",
      detail: 0,
      format: 1, // bold
      version: 1
    });
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    children.push({
      mode: "normal",
      text: text.substring(lastIndex),
      type: "text",
      style: "",
      detail: 0,
      format: 0,
      version: 1
    });
  }
  return children.length ? children : [{
    mode: "normal",
    text: "",
    type: "text",
    style: "",
    detail: 0,
    format: 0,
    version: 1
  }];
}

function convertMarkdownToLexical(markdown: string) {
  const lines = markdown.split('\n').map(l => l.trim())
  const rootChildren = []
  let currentList: any = null

  for (const line of lines) {
    if (!line) continue

    if (line.startsWith('## ')) {
      if (currentList) { rootChildren.push(currentList); currentList = null }
      rootChildren.push({
        type: "heading",
        tag: "h2",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: parseTextWithModes(line.replace(/^##\s*/, ''))
      })
    }
    else if (line.startsWith('### ')) {
      if (currentList) { rootChildren.push(currentList); currentList = null }
      rootChildren.push({
        type: "heading",
        tag: "h3",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: parseTextWithModes(line.replace(/^###\s*/, ''))
      })
    }
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!currentList) {
        currentList = {
          type: "list",
          listType: "bullet",
          tag: "ul",
          start: 1,
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: []
        }
      }
      currentList.children.push({
        type: "listitem",
        value: currentList.children.length + 1,
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: parseTextWithModes(line.replace(/^[*|-]\s*/, ''))
      })
    }
    else {
      if (currentList) { rootChildren.push(currentList); currentList = null }
      rootChildren.push({
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: parseTextWithModes(line)
      })
    }
  }

  if (currentList) { rootChildren.push(currentList); currentList = null }

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: rootChildren
    }
  }
}

async function run() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL not found')
  
  console.log('Connecting to MongoDB...')
  const client = new MongoClient(dbUrl)
  await client.connect()
  const db = client.db()

  console.log('Connected. Running proper Markdown -> Lexical migration...')

  let updatedCount = 0
  
  const pages = await db.collection('pages').find({}).toArray()
  for (const doc of pages) {
    let needsUpdate = false
    const updatePayload: any = {}
    
    if (doc.blocks && typeof doc.blocks === 'object') {
      const newBlocks = JSON.parse(JSON.stringify(doc.blocks))
      
      for (const locale of ['en', 'id']) {
        if (Array.isArray(newBlocks[locale])) {
          newBlocks[locale].forEach((block: any) => {
            if (block.blockType === 'content-components.text-left-image-right') {
              if (block.bodyCopy) {
                const text = extractText(block.bodyCopy)
                if (text) {
                  console.log(`Converting text-left-image-right for ${doc.slug?.en || doc.title?.en} [${locale}]`)
                  block.bodyCopy = convertMarkdownToLexical(text)
                  needsUpdate = true
                }
              }
            } else if (block.blockType === 'content-components.body-copy') {
              if (block.content) {
                const text = extractText(block.content)
                if (text) {
                  console.log(`Converting body-copy for ${doc.slug?.en || doc.title?.en} [${locale}]`)
                  block.content = convertMarkdownToLexical(text)
                  needsUpdate = true
                }
              }
            }
          })
        }
      }
      
      if (needsUpdate) {
        updatePayload.blocks = newBlocks
      }
    }

    if (needsUpdate) {
      await db.collection('pages').updateOne(
        { _id: doc._id },
        { $set: updatePayload }
      )
      updatedCount++
    }
  }

  console.log(`Done fixing data! Updated ${updatedCount} pages.`)
  process.exit(0)
}

run()
