/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 👇 This makes Next transpile the TypeScript from packages/shared-api
  transpilePackages: ["shared-api"],
};

export default nextConfig;
