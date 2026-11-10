import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/context/AuthContext';
import { CartProvider } from '@/components/context/CartContext';
import { WishlistProvider } from '@/components/context/WishlistContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import PromoMarquee from '@/components/layout/PromoMarquee';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingMobileCartBar from '@/components/cart/FloatingMobileCartBar';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import BackToTop from '@/components/layout/BackToTop';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';
import InstallPrompt from '@/components/pwa/InstallPrompt';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#102d1c',
};

export const metadata: Metadata = {
  title: 'دار العسل والزيتون | DAR EL ASAL & OLIVE — فخامة الطبيعة بأنقى صورها',
  description:
    'متجر دار العسل والزيتون: أفخر أنواع عسل النحل الطبيعي والسدر الجبلي، وزيت الزيتون البكر الممتاز المعصور على البارد مباشرة من المناحل والمعاصر المعتمدة.',
  keywords: [
    'دار العسل والزيتون',
    'عسل سدر جبلي',
    'عسل نحل طبيعي',
    'زيت زيتون بكر ممتاز',
    'زيت زيتون سيوة',
    'عسل بالمكسرات',
  ],
  applicationName: 'دار العسل',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'دار العسل',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cairo bg-[#fcfaf6] text-[#1d1d1f] min-h-screen flex flex-col antialiased overflow-x-hidden w-full max-w-full">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:right-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-[#143823] focus:text-[#f5ebd2] focus:text-xs focus:font-bold focus:shadow-lg"
        >
          تخطي إلى المحتوى الرئيسي
        </a>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnnouncementBar />
              <PromoMarquee />
              <Header />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
              <FloatingMobileCartBar />
              <MobileBottomBar />
              <BackToTop />
              <InstallPrompt />
              <ServiceWorkerRegister />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
