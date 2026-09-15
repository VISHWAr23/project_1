import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shri Lathikka Surgicals',
    short_name: 'Shri Lathikka',
    description:
      'Leading retailer & manufacturer of Medi Bath Body Wipes, Surgical Cotton Rolls, Gauze Bandages, Gamjee Rolls, and Medical Surgical Clothing in Rajapalayam, Tamil Nadu.',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0F1117',
    theme_color: '#0F1117',
    dir: 'ltr',
    lang: 'en',
    categories: ['business', 'productivity', 'medical'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View production and inventory metrics',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Gamjee Production',
        short_name: 'Gamjee',
        description: 'Manage Gamjee production and batches',
        url: '/gamjee-production',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Job Work',
        short_name: 'Job Work',
        description: 'Track job work batches & challans',
        url: '/job-work',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Raw Materials',
        short_name: 'Materials',
        description: 'Manage raw materials inventory',
        url: '/raw-materials',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
