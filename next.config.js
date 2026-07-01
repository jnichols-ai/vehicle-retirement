/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // PWA Configuration
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // API configuration
  env: {
    MONDAY_API_KEY: process.env.MONDAY_API_KEY,
    MONDAY_BOARD_ID: process.env.MONDAY_BOARD_ID || '18419998708',
    FL_TRUCKS_BOARD_ID: process.env.FL_TRUCKS_BOARD_ID || '18391343450',
  },
};

module.exports = nextConfig;
