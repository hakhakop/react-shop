/** @type {import('next').NextConfig} */

const wordpressUrl = new URL(
  process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL ||
    process.env.WORDPRESS_SITE_URL ||
    "https://cms.webpages.am"
);

const wordpressUploadsPath = `${wordpressUrl.pathname.replace(
  /\/$/,
  ""
)}/wp-content/uploads/**`;

const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: wordpressUrl.protocol.replace(":", ""),
        hostname: wordpressUrl.hostname,
        pathname: wordpressUploadsPath,
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;