import type { Metadata } from 'next';
import './globals.css';
import ReactQueryProvider from '@/providers/react-query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'Enterprise IMS | Supabase SaaS Interface',
  description: 'Enterprise Inventory Management System with Supabase Dashboard Styling',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full font-sans antialiased bg-background text-foreground selection:bg-[#3ECF8E]/30 selection:text-[#3ECF8E]">
        <ThemeProvider>
          <ToastProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
