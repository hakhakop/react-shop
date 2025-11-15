/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.webpages.am",
      },
      {
        protocol: "https",
        hostname: "webpages.am",
      }
    ],
  },
};

export default nextConfig;