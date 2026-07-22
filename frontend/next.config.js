/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:5001/socket.io/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
