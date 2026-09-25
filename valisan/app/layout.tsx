import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/layout/StoreProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: { default: 'والیسان | استودیو پیلاتس، یوگا و سلامت بانوان', template: '%s | والیسان' },
  description: 'استودیوی تخصصی و لوکس بانوان: پیلاتس ریفرمر، یوگا، حرکات اصلاحی و بازتوانی پس از زایمان با مربیان حرفه‌ای.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { themeColor: '#E8A598', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa-IR" dir="rtl">
      <head>
        <link rel="preload" href="/fonts/Vazirmatn[wght].woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-dvh flex flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
