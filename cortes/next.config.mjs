/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — required for Netlify (and any other static host).
  // `next build` will write the fully-rendered site to cortes/out/.
  output: 'export',
  // Generate page-name/index.html instead of page-name.html so that
  // Netlify can serve /cortes/ without extra redirect rules.
  trailingSlash: true,
  basePath: '/cortes',
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable dev overlay — in proxied environments (Replit) the devtools WebSocket
  // can't connect, which causes the overlay to block all click events on the page.
  devIndicators: false,
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
