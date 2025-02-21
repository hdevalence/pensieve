/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        STORAGE_PATH: process.env.STORAGE_PATH,
    },
}

module.exports = nextConfig
