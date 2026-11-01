import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/context/AuthContext';
import { CartProvider } from '@/components/context/CartContext';
import { WishlistProvider } from '@/components/context/WishlistContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingMobileCartBar from '@/components/cart/FloatingMobileCartBar';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
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
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnnouncementBar />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingMobileCartBar />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
