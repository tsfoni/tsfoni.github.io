'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navItems = [
  { name: 'home', href: '/' },
  { name: 'blog', href: '/blog' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Header */}
      <header className="w-full max-w-[991px] mx-auto px-6 sm:px-8 pt-8 pb-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-heading font-bold text-xl text-white tracking-tight hover:opacity-80 transition"
        >
          tsfoni<span className="text-[#888]">.</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`zane-link lowercase transition-colors ${
                  isActive ? 'text-white !font-semibold' : 'text-[#888] hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile floating button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden fixed top-5 right-5 z-50 w-12 h-12 rounded-full bg-black/70 backdrop-blur-lg border border-white/15 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition shadow-2xl"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer / Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xl md:hidden flex flex-col justify-center items-center gap-8 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <nav className="flex flex-col items-center gap-6 text-xl">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-[#888] font-heading lowercase tracking-wider transition text-2xl font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
