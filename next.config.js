/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["bootcamp-zachery.s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
