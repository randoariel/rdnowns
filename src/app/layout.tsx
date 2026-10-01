import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font',
});

export const metadata: Metadata = {
  title: 'RDN — Graphic Designer & Video Editor',
  description: 'Portofolio visual dan jasa video editing serta desain grafis profesional untuk tugas sekolah, branding, dan project personal.',
  keywords: ['graphic design', 'video editor', 'videografi', 'tugas sekolah', 'RDN', 'creative portfolio'],
  authors: [{ name: 'RDN' }],
  robots: {
    index: true,
    follow: true,
  },
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
    title: 'RDN — Graphic Designer & Video Editor',
    description: 'Portofolio visual dan jasa video editing serta desain grafis profesional untuk tugas sekolah, branding, dan project personal.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'RDN Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RDN — Graphic Designer & Video Editor',
    description: 'Portofolio visual dan jasa video editing serta desain grafis profesional.',
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
