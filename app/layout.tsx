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
  title: 'Harel Tsfoni - Tech, Systems & Security',
  description:
    'Building random programs, reverse engineering malware, and tinkering with systems and infrastructure.',
  icons: {
    icon: 'https://avatars.githubusercontent.com/u/104026572',
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
