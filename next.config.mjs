/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.logoyogo.com",
      },
      {
        protocol: "http",
        hostname: "15.165.123.108",
      },
    ],
  },
}

export default nextConfig
