/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/cortes',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '127.0.0.1',
    '*.replit.dev',
    '*.replit.app',
    '*.janeway.replit.dev',
    '*.kirk.replit.dev',
    '*.riker.replit.dev',
    '*.worf.replit.dev',
    '*.picard.replit.dev',
    '*.spock.replit.dev',
  ],
}

export default nextConfig
