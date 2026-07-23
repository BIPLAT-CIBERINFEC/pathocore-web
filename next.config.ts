/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/api/v1/:path*",
      },
      {
        source: "/api/clinical/:path*",
        destination: "http://localhost:8100/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
