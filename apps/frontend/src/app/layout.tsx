import type { Metadata } from 'next';
import './globals.css';
import ReactQueryProvider from '@/providers/react-query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'Shri Lathikka Surgicals | Premier Surgical Disposables & Medical Supplies',
  description:
    'Leading retailer & manufacturer of Medi Bath Body Wipes, Surgical Cotton Rolls, Gauze Bandages, Gamjee Rolls, and Medical Surgical Clothing in Rajapalayam, Tamil Nadu.',
  keywords: [
    'Shri Lathikka Surgicals',
    'Rajapalayam',
    'Surgical Cotton Roll',
    'Medi Bath Wipes',
    'Gauze Bandage Roll',
    'Gamjee Roll',
    'Medical Clothing',
    'Tamil Nadu Surgical Manufacturer',
    'IndiaMART Seller',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full font-sans antialiased bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-600">
        <ThemeProvider>
          <ToastProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
