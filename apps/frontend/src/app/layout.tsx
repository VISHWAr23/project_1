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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full font-sans antialiased bg-background text-foreground selection:bg-blue-500/20 selection:text-blue-600">
        <ThemeProvider>
          <ToastProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
