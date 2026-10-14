const nextConfig = {
  reactStrictMode: true,
  env: {
    // The shared Next.js deployment profile names a second browser API
    // generically. Preserve the application's existing public contract.
    NEXT_PUBLIC_MEPRAM_API_BASE_URL:
      process.env.NEXT_PUBLIC_MEPRAM_API_BASE_URL ??
      process.env.NEXT_PUBLIC_SECOND_API_BASE_URL,
  },
};

export default nextConfig;
