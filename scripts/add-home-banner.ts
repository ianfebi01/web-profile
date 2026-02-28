import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf-8')
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

async function run() {
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../app/payload.config')
  const payload = await getPayload({ config: configPromise })

  const pages = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } } })
  if (pages.docs.length === 0) {
    console.error('Home page not found!')
    process.exit(1)
  }

  const page = pages.docs[0]
  console.log(`Found home page: ${page.title} (${page.id})`)

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      banner: [
        {
          blockType: 'banner-components.profile-banner',
          title: 'Profile Banner',
        },
      ],
    },
  })

  console.log('✓ Added profile-banner to home page banner field')
  process.exit(0)
}
run()
