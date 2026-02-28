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
  const menu = await payload.findGlobal({ slug: "main-menu", locale: "en", depth: 2 })
  console.log(JSON.stringify(menu, null, 2))
  process.exit(0)
}
run()
