import type { NextConfig } from 'next'

/**
 * Next.js configuration overriding the default source-map behaviour so that
 * both browser and server chunks include their corresponding .map files in
 * production, eliminating the "missing a sourcemap” warnings seen in DevTools.
 */
const nextConfig: NextConfig = {
  /* ---------------------------------------------------------------------- */
  /*                               IMAGES                                   */
  /* ---------------------------------------------------------------------- */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },

  /* ---------------------------------------------------------------------- */
  /*                         EXPERIMENTAL FEATURES                           */
  /* ---------------------------------------------------------------------- */
  experimental: {
    /** Partial prerendering (app-router) */
    ppr: true,
  },

  /* ---------------------------------------------------------------------- */
  /*                        SOURCE-MAP GENERATION                            */
  /* ---------------------------------------------------------------------- */
  /**
   * Emit client-side (.js) maps so the browser can locate original source.
   * This has no runtime cost in production because the .map files are only
   * downloaded when DevTools is open.
   */
  productionBrowserSourceMaps: true,

  /**
   * Ensure all server chunks get external .map files in production; without
   * this, Next.js strips them out which leads to the error:
   *   "chunk/module '.../_*.js' is missing a sourcemap”
   */
  webpack(config, { isServer, dev }) {
    if (isServer && !dev) {
      // Generate separate source maps for Node-side bundles
      config.devtool = 'source-map'
    }
    return config
  },

  /* ---------------------------------------------------------------------- */
  /*                         SECURITY RESPONSE HEADERS                       */
  /* ---------------------------------------------------------------------- */
  /**
   * Attach COOP/COEP headers so the runtime checker receives the expected
   * values instead of a 404, eliminating the console warning about missing
   * Cross-Origin-Opener-Policy.
   */
  async headers() {
    const common = [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }]

    return [
      {
        // Internal Next.js assets (cross-origin isolation may be required)
        source: '/_next/:path*',
        headers: [...common, { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' }],
      },
      {
        // API routes – still safe to isolate
        source: '/api/:path*',
        headers: [...common, { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' }],
      },
      {
        // Public pages – **NO COEP** so <iframe src="https://…"> works
        source: '/:path*',
        headers: common,
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/demo-video', // <──  the local path
        destination: 'https://youtu.be/a5nw0fbJv2Y', // where to send the user
        permanent: false, // 307 at build-time / 308 in prod if true
      },
      {
        source: '/pitch-deck',
        destination: 'https://www.canva.com/design/xxxxxxx/view',
        permanent: false,
      },
      // add any future redirects here
    ]
  },
}

export default nextConfig
