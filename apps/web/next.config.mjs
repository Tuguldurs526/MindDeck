/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🚫 Do not run ESLint as part of `next build`
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
