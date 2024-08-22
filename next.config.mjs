/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'wordpress-1319603-4821825.cloudwaysapps.com',
        },
      ],
    },
  }
  
  export default nextConfig