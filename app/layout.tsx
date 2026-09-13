import type { Metadata } from 'next';
import { Inter, Figtree } from 'next/font/google';
import './globals.css';
import TopProgressBar from '@/src/components/TopProgressBar';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tsfoni.github.io'),
  title: {
    default: 'Harel Tsfoni - Tech, Systems & Security',
    template: '%s - Harel Tsfoni',
  },
  description:
    'Building random programs, reverse engineering, and tinkering with systems and infrastructure.',
  icons: {
    icon: 'https://avatars.githubusercontent.com/u/104026572',
    apple: 'https://avatars.githubusercontent.com/u/104026572',
  },
  openGraph: {
    title: 'Harel Tsfoni - Tech, Systems & Security',
    description:
      'Building random programs, reverse engineering, and tinkering with systems and infrastructure.',
    url: 'https://tsfoni.github.io',
    siteName: 'Harel Tsfoni',
    images: [
      {
        url: 'https://avatars.githubusercontent.com/u/104026572',
        width: 1200,
        height: 630,
        alt: 'Harel Tsfoni',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harel Tsfoni - Tech, Systems & Security',
    description:
      'Building random programs, reverse engineering, and tinkering with systems and infrastructure.',
    images: ['https://avatars.githubusercontent.com/u/104026572'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${figtree.variable}`}>
      <body className="bg-black text-[#cccccc] font-sans min-h-screen selection:bg-white selection:text-black">
        <TopProgressBar />
        <Navbar />
        <main className="max-w-[991px] mx-auto px-6 sm:px-8 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
