'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Reset and quickly pulse on route change
    setScrollProgress(100);
    const timeout = setTimeout(() => {
      setScrollProgress(0);
    }, 300);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  return (
    <div
      className="bprogress-bar pointer-events-none"
      style={{
        width: `${scrollProgress}%`,
        opacity: scrollProgress > 0 ? 1 : 0,
        transition: 'width 100ms ease-out, opacity 200ms ease',
      }}
      aria-hidden="true"
    />
  );
}
