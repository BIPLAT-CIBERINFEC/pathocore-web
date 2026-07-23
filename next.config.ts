const pathocoreApiProxyTarget =
  process.env.PATHOCORE_API_PROXY_TARGET || "http://127.0.0.1:8000";
const mepramOmopApiProxyTarget =
  process.env.MEPRAM_OMOP_API_PROXY_TARGET || "http://127.0.0.1:8100";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${pathocoreApiProxyTarget}/api/v1/:path*`,
      },
      {
        source: "/api/clinical/:path*",
        destination: `${mepramOmopApiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
