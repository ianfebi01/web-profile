import qs from 'qs'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
const STRAPI_URL = envFile.match(/NEXT_PUBLIC_STRAPI_API_URL=(.+)/)?.[1].trim()
const STRAPI_TOKEN = envFile.match(/NEXT_PUBLIC_STRAPI_API_TOKEN=(.+)/)?.[1].trim()

async function fetchStrapi(endpoint: string) {
  const url = `${STRAPI_URL}/api/${endpoint}`
  console.log('Fetching:', url)
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`)
  }
  
  return res.json()
}

async function run() {
  try {
    // Test Skills
    const skillsQuery = qs.stringify({ populate: '*' })
    const skills = await fetchStrapi(`skills?${skillsQuery}`)
    console.log('Skills:', JSON.stringify(skills.data.slice(0, 1), null, 2))

    // Test Projects (Portofolios)
    const projects = await fetchStrapi(`portofolios?${skillsQuery}`)
    console.log('Projects:', JSON.stringify(projects.data.slice(0, 1), null, 2))

    // Test Profile
    const profile = await fetchStrapi(`profile?${skillsQuery}`)
    console.log('Profile:', JSON.stringify(profile.data, null, 2))

  } catch (error) {
    console.error('Error:', error)
  }
}

run()
