import { getPayload } from 'payload'
import configPromise from '../app/payload.config'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { getHomePage } from '../utils/get-home-page'

async function downloadMedia(url: string, name: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}`)
  const buffer = await res.arrayBuffer()
  const filePath = path.join(os.tmpdir(), name)
  fs.writeFileSync(filePath, new Uint8Array(buffer))
  return filePath
}

async function run() {
  const payload = await getPayload({ config: configPromise })

  async function uploadMedia(strapiMedia: any) {
    if (!strapiMedia) return null
    const { url, name, alternativeText } = strapiMedia.attributes
    try {
      const filePath = await downloadMedia(url, name)
      const media = await payload.create({
        collection: 'media',
        data: { alt: alternativeText || name },
        filePath,
      })
      return media.id
    } catch (e) {
      console.error(`=> Failed to upload media ${name}:`, e)
      return null
    }
  }

  // Fetch Home Page to get Profile
  console.log('--- Migrating Profile from Home Page ---')
  try {
     const hpRes = await getHomePage('id')

     if (hpRes.data) {
       const bannerBlocks = hpRes.data.attributes.page.data.attributes.banner || []
       const profileBlock = bannerBlocks.find((b: any) => b.__component === 'banner-components.profile-banner')
       
       if (profileBlock) {
         console.log('Found profile block:', profileBlock.name)
         const bannerImage = await uploadMedia(profileBlock.bannerImage?.data)
         const avatar = await uploadMedia(profileBlock.avatar?.data)
         
         await payload.updateGlobal({
           slug: 'profile',
           data: {
             name: profileBlock.name || 'Admin',
             bio: profileBlock.bio || '',
             bannerImage: bannerImage as any,
             avatar: avatar as any,
             socialPlatformLinks: profileBlock.socials?.data?.map((s:any) => ({ platform: s.attributes.social.platform, url: s.attributes.social.url })) || []
           }
         })
         console.log('Successfully updated Profile global!')
       } else {
         console.log('No profile block found in home page banner.')
       }
     }
  } catch(e: any) { console.log('Skipping Profile:', e.message) }

  process.exit(0)
}

run()
