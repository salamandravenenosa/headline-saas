/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable server-side only for API
    experimental: {
        serverActions: true,
    },
};

export default nextConfig;
