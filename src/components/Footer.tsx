import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full max-w-[991px] mx-auto px-6 sm:px-8 py-12 border-t border-white/10 mt-16 text-center text-xs text-[#666]">
      <p>
        © {new Date().getFullYear()} Harel Tsfoni. All rights reserved.
      </p>
    </footer>
  );
}
