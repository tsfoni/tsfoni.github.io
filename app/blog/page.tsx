import React from 'react';
import Link from 'next/link';
import { getSortedPostsData } from '@/src/lib/posts';

export const metadata = {
  title: 'Blog - Harel Tsfoni',
  description: 'Technical analyses, reverse engineering write-ups, and threat intelligence reports.',
  openGraph: {
    title: 'Blog - Harel Tsfoni',
    description: 'Technical analyses, reverse engineering write-ups, and threat intelligence reports.',
    url: 'https://tsfoni.github.io/blog/',
    siteName: 'Harel Tsfoni',
    images: [
      {
        url: 'https://avatars.githubusercontent.com/u/104026572',
        width: 1200,
        height: 630,
        alt: 'Harel Tsfoni Blog',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Harel Tsfoni',
    description: 'Technical analyses, reverse engineering write-ups, and threat intelligence reports.',
    images: ['https://avatars.githubusercontent.com/u/104026572'],
  },
};

export default function BlogListPage() {
  const posts = getSortedPostsData();

  return (
    <div className="space-y-8 pt-4">
      <div>
        <h1 className="font-heading font-semibold text-4xl sm:text-5xl text-white tracking-tight lowercase">
          blog
        </h1>
        <p className="text-[#888] text-sm sm:text-base mt-2">
          Technical analyses, malware reverse-engineering write-ups, and research findings.
        </p>
      </div>

      <div className="space-y-6 pt-4">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition duration-200"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#888] mb-3">
              <time dateTime={post.date}>{post.formattedDate || post.date}</time>
              <span>•</span>
              <span>{post.readingTime}</span>
              {post.classification && (
                <>
                  <span>•</span>
                  <span className="text-[#3b82f6] font-mono font-medium">
                    {post.classification}
                  </span>
                </>
              )}
            </div>

            <Link href={`/blog/${post.slug}`} className="block group">
              <h2 className="font-heading font-semibold text-xl sm:text-2xl text-white group-hover:text-white transition mb-3 leading-snug">
                <span className="zane-link">{post.title}</span>
              </h2>
            </Link>

            <p className="text-[#aaa] text-sm leading-relaxed mb-4">
              {post.summary}
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded bg-white/5 text-[#aaa] border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
