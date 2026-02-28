import fs from 'fs'
import { MongoClient } from 'mongodb'

const envFile = fs.readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

async function run() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL not found')
  
  console.log('Connecting to MongoDB...')
  const client = new MongoClient(dbUrl)
  await client.connect()
  const db = client.db()


  console.log('Connected. Running data migration for localized fields...')

  const collectionsToFix = {
    'articles': ['title', 'slug', 'introText', 'content'],
    'experiences': ['companyName', 'role', 'description'],
    'pages': ['title', 'slug', 'banner', 'blocks'],
    'projects': ['title', 'slug', 'description', 'content'],
    'skills': [],
  }

  for (const [colName, fields] of Object.entries(collectionsToFix)) {
    if (fields.length === 0) continue
    console.log(`\nChecking collection: ${colName}`)
    const col = db.collection(colName)
    const docs = await col.find({}).toArray()
    let updatedCount = 0

    for (const doc of docs) {
      let needsUpdate = false
      const updatePayload: any = {}

      for (const field of fields) {
        if (doc[field] !== undefined && typeof doc[field] !== 'object') {
          // It's a raw unlocalized value (string, array, etc.)
          updatePayload[field] = { en: doc[field] } // Fallback ID locale later if they want
          needsUpdate = true
        } else if (doc[field] && !doc[field].en && !doc[field].id && typeof doc[field] === 'object' && Array.isArray(doc[field])) {
          // It's an array (like blocks array), we need to wrap it in `{ en: [...] }`
          updatePayload[field] = { en: doc[field] }
          needsUpdate = true
        }
      }

      if (needsUpdate) {
        await col.updateOne({ _id: doc._id }, { $set: updatePayload })
        updatedCount++
      }
    }
    console.log(`Updated ${updatedCount} documents in ${colName}`)
  }

  // Also fix Globals
  console.log('\nChecking globals...')
  const globalsCol = db.collection('globals')
  
  // Profile
  const profileDoc = await globalsCol.findOne({ globalType: 'profile' })
  if (profileDoc) {
    let needsUpdate = false
    const updatePayload: any = {}
    for (const field of ['name', 'bio', 'socialPlatformLinks']) {
      if (profileDoc[field] !== undefined && (typeof profileDoc[field] !== 'object' || Array.isArray(profileDoc[field]))) {
        updatePayload[field] = { en: profileDoc[field] }
        needsUpdate = true
      }
    }
    if (needsUpdate) {
      await globalsCol.updateOne({ _id: profileDoc._id }, { $set: updatePayload })
      console.log('Updated Profile global')
    }
  }

  // HomePage
  const hpDoc = await globalsCol.findOne({ globalType: 'home-page' })
  if (hpDoc) {
    let needsUpdate = false
    const updatePayload: any = {}
    if (hpDoc.title !== undefined && typeof hpDoc.title !== 'object') {
      updatePayload.title = { en: hpDoc.title }
      needsUpdate = true
    }
    if (needsUpdate) {
      await globalsCol.updateOne({ _id: hpDoc._id }, { $set: updatePayload })
      console.log('Updated HomePage global')
    }
  }

  console.log('\nDone fixing data!')
  process.exit(0)
}

run()
