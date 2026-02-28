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

  // Find the landing page
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'landing-page-development-for-your-bussiness' } },
  })

  if (pages.docs.length === 0) {
    console.error('Landing page not found!')
    process.exit(1)
  }

  const page = pages.docs[0]
  const blocks = (page as any).blocks || []

  // Update sectionSettings for each block based on Strapi data
  const updatedBlocks = blocks.map((block: any) => {
    switch (block.blockType) {
      case 'content-components.text-left-image-right':
        return {
          ...block,
          sectionSettings: {
            bgColour: 'dark-secondary',
            heading: 'What You Get with Our Landing Pages',
            description: null,
            centreText: false,
            largeHeading: true,
          },
        }
      case 'content-components.simple-cards':
        return {
          ...block,
          sectionSettings: {
            heading: 'Choose Your Package',
            centreText: true,
            largeHeading: true,
          },
        }
      case 'content-components.body-copy':
        return {
          ...block,
          sectionSettings: {
            heading: 'Get in Touch:',
            centreText: true,
            largeHeading: true,
          },
        }
      default:
        return block
    }
  })

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      blocks: updatedBlocks,
    },
  })

  console.log('✓ Updated sectionSettings for landing page blocks')
  process.exit(0)
}

run()
