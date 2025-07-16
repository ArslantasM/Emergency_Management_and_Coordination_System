import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Cron service'i başlat (sadece server-side)
if (typeof window === 'undefined') {
  import('../lib/services/cron.service').then(({ cronService }) => {
    console.log('🚀 Cron service başlatıldı');
  }).catch(error => {
    console.error('❌ Cron service başlatılamadı:', error);
  });
}

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Emergency Management System',
  description: 'Acil Durum Yönetim Sistemi',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
