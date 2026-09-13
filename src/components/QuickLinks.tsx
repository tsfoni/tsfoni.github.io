'use client';

import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

interface QuickLinkItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const links: QuickLinkItem[] = [
  {
    name: 'GitHub',
    href: 'https://github.com/tsfoni',
    icon: <Github size={20} />,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/harel-t/',
    icon: <Linkedin size={20} />,
  }
];

export default function QuickLinks() {
  return (
    <section className="my-10">
      <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-white lowercase mb-2">
        quick links
      </h2>
      <p className="text-[#888] text-sm sm:text-base mb-6 font-normal">
        If you&apos;re short on time, or if you&apos;re just trying to get in touch, here are a few quick links:
      </p>

      {/* Grid with hover group effect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 group">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition duration-200 text-[#cccccc] group-hover:text-[#888888] hover:!text-white hover:border-white/20"
          >
            <span className="text-white">{link.icon}</span>
            <span className="font-medium text-sm sm:text-base zane-link">{link.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
