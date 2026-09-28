import {withAlinea} from 'alinea/next'
import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Alinea resolves content through its local build handler. Thousands of
    // catalog routes can otherwise overwhelm it when Next prerenders with the
    // machine-wide worker count.
    staticGenerationMaxConcurrency: 2,
    staticGenerationRetryCount: 3,
    staticGenerationMinPagesPerWorker: 100
  },
  async redirects() {
    return [
      ...['pt', 'pt_br', 'br'].map(source => ({
        source: `/collections/pokemon/${source}/:path*`,
        destination: '/collections/pokemon/pt-br/:path*',
        permanent: true
      })),
      ...['en-us', 'en_us', 'us'].map(source => ({
        source: `/collections/pokemon/${source}/:path*`,
        destination: '/collections/pokemon/en/:path*',
        permanent: true
      }))
    ]
  }
}

export default withAlinea(nextConfig)
