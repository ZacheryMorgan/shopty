/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["bootcamp-zachery.s3.amazonaws.com"],
  },
};

module.exports = nextConfig;
