import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ims/validation'],
  reactStrictMode: true,
};

export default nextConfig;
