import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Realize E-Commerce storefront and content platform.',
  images: [
    {
      url: '/og-image.svg',
    },
  ],
  siteName: 'Realize E-Commerce',
  title: 'Realize E-Commerce',
}

export const mergeOpenGraph = (og?: Partial<Metadata['openGraph']>): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
