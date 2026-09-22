import createNextIntlPlugin from 'next-intl/plugin'
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode : false,

  output : 'standalone',
  // async rewrites() {
  //   return [
  //     {
  //       source      : '/api-web/:path*',
  //       destination : `${process.env.BASE_URL}/:path*`,
  //     },
  //   ]
  // },
  images : {
    remotePatterns : [
      {
        protocol : 'https',
        hostname : 'avatars.githubusercontent.com',
        port     : '',
        pathname : '/u/**',
      },
      {
        protocol : 'https',
        hostname : 'res.cloudinary.com',
        port     : '',
        pathname : '/*/image/upload/**',
      },
      {
        protocol : 'http',
        hostname : 'localhost',
        port     : '1337',
        pathname : '/uploads/**',
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin( './i18n/request.ts' )
export default withPayload( withNextIntl( nextConfig ) ) 