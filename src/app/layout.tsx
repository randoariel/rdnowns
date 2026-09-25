import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font',
});

export const metadata: Metadata = {
  title: 'RDN — Videografi & Video Editing',
  description: 'Jasa videografi dan video editing untuk tugas sekolah dan project personal. Lihat portofolio dan pilih paket.',
  keywords: ['videografi', 'video editing', 'tugas sekolah', 'RDN'],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'RDN — Videografi & Video Editing',
    description: 'Jasa videografi dan video editing untuk tugas sekolah.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
