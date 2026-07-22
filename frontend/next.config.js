/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  allowedDevOrigins: [
    'localhost:3000',
    '*.loca.lt',
    '*.pinggy.link',
    '*.pinggy.net',
    '*.localhost.run'
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
