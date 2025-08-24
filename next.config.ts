import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ksewwywdduvmcxdetpxi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/memo-previews/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas');
    }
    return config;
  },
}

export default nextConfig
