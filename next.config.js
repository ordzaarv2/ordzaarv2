/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/v1/:path*' // Proxy to backend
      }
    ]
  }
}

module.exports = nextConfig 