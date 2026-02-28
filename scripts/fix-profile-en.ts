import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

async function run() {
  const { getPayload } = await import('payload')
  const { default: configPromise } = await import('../app/payload.config')
  const payload = await getPayload({ config: configPromise })

  console.log('--- Fixing Profile (en) ---')
  await payload.updateGlobal({
    slug: 'profile',
    locale: 'en',
    data: {
      name: 'Ian Febi Sastrataruna',
      bio: 'Frontend Developer & Web Developer based in Indonesia.',
      socialPlatformLinks: [
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/ianfebi01' },
        { platform: 'GitHub', url: 'https://github.com/ianfebi01' }
      ]
    }
  })
  console.log(' ✓ Updated Profile (en) successfully!')

  process.exit(0)
}

run()
