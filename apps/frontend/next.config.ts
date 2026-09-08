import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ims/validation'],
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/vendors',
        destination: '/job-work/vendors',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
