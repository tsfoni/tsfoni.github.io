'use client';

import React, { useEffect, useState } from 'react';
import { ZoomIn, X } from 'lucide-react';

interface PostContentProps {
  html: string;
}

interface ModalState {
  isOpen: boolean;
  src: string;
  alt: string;
  caption?: string;
}

export default function PostContent({ html }: PostContentProps) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    src: '',
    alt: '',
    caption: '',
  });

  useEffect(() => {
    // Process images inside .blog-content to add zoom buttons and lightbox trigger
    const container = document.querySelector('.blog-content');
    if (!container) return;

    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      // Avoid wrapping twice
      if (img.parentElement?.classList.contains('media-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'media-wrapper relative group my-8 max-w-[620px] mx-auto overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0d] cursor-zoom-in';

      // Check if next sibling is a caption (like an <em> tag)
      let captionText = img.getAttribute('alt') || '';
      const parentP = img.parentElement;
      if (parentP && parentP.tagName === 'P') {
        const nextElem = parentP.nextElementSibling;
        if (nextElem && (nextElem.tagName === 'EM' || nextElem.querySelector('em'))) {
          captionText = nextElem.textContent || captionText;
        }
      }

      // Clone image and set styling
      const newImg = img.cloneNode(true) as HTMLImageElement;
      newImg.className = 'w-full h-auto block transition duration-300 group-hover:scale-[1.01]';
      wrapper.appendChild(newImg);

      // Create zoom icon badge
      const zoomBadge = document.createElement('div');
      zoomBadge.className = 'absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur border border-white/20 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 transition shadow-lg pointer-events-none';
      zoomBadge.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;
      wrapper.appendChild(zoomBadge);

      // Add click listener
      wrapper.addEventListener('click', () => {
        setModal({
          isOpen: true,
          src: newImg.src,
          alt: newImg.alt,
          caption: captionText,
        });
      });

      // Replace old img with wrapper
      img.parentNode?.replaceChild(wrapper, img);
    });

    // Close on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [html]);

  return (
    <>
      <div
        className="blog-content leading-relaxed text-[#cccccc] text-[1.05rem]"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Lightbox Modal */}
      {modal.isOpen && (
        <div
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
        >
          {/* Close button */}
          <button
            onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition focus:outline-none"
            aria-label="Close image modal"
          >
            <X size={20} />
          </button>

          {/* Centered Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modal.src}
              alt={modal.alt}
              className="max-h-[80vh] w-auto object-contain rounded-lg border border-white/15 shadow-2xl"
            />
            {modal.caption && (
              <p className="text-[#aaa] text-sm text-center mt-3 max-w-xl font-normal">
                {modal.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
