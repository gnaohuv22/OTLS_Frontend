import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '**'
      }
    ]
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    
    if (!config.resolve) {
      config.resolve = {};
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': false,
      'path': false,
      'stream': false,
    };
    
    return config;
  }
};

export default config;
