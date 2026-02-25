import sharp from 'sharp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { seoPlugin } from '@payloadcms/plugin-seo';
import { Media } from '../collections/Media';
import { cloudinaryStorage } from 'payload-cloudinary';

export default buildConfig({
    // If you'd like to use Rich Text, pass your editor here
    editor: lexicalEditor(),
    localization: {
        locales: ['en', 'id'], // Matching your next-intl locales
        defaultLocale: 'en',
        fallback: true, // If a translation is missing, it will fall back to English
    },

    // Define and configure your collections in this array
    collections: [Media],

    // Your Payload secret - should be a complex and secure string, unguessable
    secret: process.env.PAYLOAD_SECRET || '',
    // Whichever Database Adapter you're using should go here
    // Mongoose is shown as an example, but you can also use Postgres
    db: mongooseAdapter({
        url: process.env.DATABASE_URL || '',
    }),
    // If you want to resize images, crop, set focal point, etc.
    // make sure to install it and pass it to the config.
    // This is optional - if you don't need to do these things,
    // you don't need it!
    sharp,
    plugins: [
        seoPlugin({
            collections: [
                'pages',
            ],
            uploadsCollection: 'media',
            generateTitle: ({ doc }) => `${doc.title} | Ian Febi S`,
            generateDescription: ({ doc }) => doc.excerpt
        }),
        cloudinaryStorage({
            config: {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
                api_key: process.env.CLOUDINARY_API_KEY || '',
                api_secret: process.env.CLOUDINARY_API_SECRET || ''
            },
            collections: {
                media: true,
            },
            folder: process.env.CLOUDINARY_FOLDER || 'web-profile-payload',
        })
    ]
})