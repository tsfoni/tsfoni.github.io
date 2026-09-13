import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/src/lib/posts';
import QuickLinks from '@/src/components/QuickLinks';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const posts = getSortedPostsData();
  const recentPosts = posts.slice(0, 3);

  const interests = [
    'Systems & Networking',
    'Reverse Engineering',
    'Malware Analysis',
    'IDA Pro',
    'Ghidra',
    'x64dbg',
    'Procmon & Wireshark',
    'YARA',
    'Python & Go',
    'Low-Level Systems',
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="pt-4 pb-2">
        <div className="flex items-center gap-3">
          <h1 className="font-heading font-semibold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight lowercase">
            hi <span className="inline-block hover:rotate-12 transition-transform duration-200 cursor-default">:)</span>
          </h1>
        </div>

        <p className="font-heading font-normal text-2xl sm:text-3xl text-white mt-4 mb-2">
          I&apos;m Harel.
        </p>

        <p className="text-[#888] text-base sm:text-lg max-w-2xl leading-relaxed mt-2">
          I build programs, reverse engineer things, and tinker with tech. Mostly just building random stuff, experimenting, and sharing what I find.
        </p>
      </section>

      {/* About Story Section with Avatar */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8 items-center border-t border-b border-white/10 py-10">
        <div className="space-y-4 text-[#bbb] text-base leading-relaxed">
          <p>
            Welcome to my personal corner of the web. I don&apos;t stick to just one lane—I reverse engineer malware, write random tools, tinker with infrastructure, and build whatever seems interesting at the time.
          </p>
          <p>
            I love tech and understanding how things work under the hood. Sometimes that means dissecting a suspicious binary in a disassembler; other times it&apos;s building a program from scratch, hacking on servers and network tools, or just working on random side projects.
          </p>
          <p className="text-white font-medium">
            Take a look around, check out what I&apos;ve posted below, or reach out anytime.
          </p>

          <div className="pt-3">
            <h2 className="font-heading font-semibold text-xs text-[#888] uppercase tracking-wider mb-2.5">
              things I mess with
            </h2>
            <div className="flex flex-wrap gap-2">
              {interests.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2.5 py-1 rounded bg-white/5 text-[#aaa] border border-white/5 hover:border-white/20 transition"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
            <Image
              src="https://avatars.githubusercontent.com/u/104026572"
              alt="Harel Tsfoni"
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              priority
            />
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <QuickLinks />

      {/* Recent Posts Section */}
      <section className="my-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-white lowercase">
            recent posts
          </h2>
          <Link
            href="/blog"
            className="text-xs sm:text-sm text-[#888] hover:text-white transition flex items-center gap-1 zane-link"
          >
            view all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-6">
          {recentPosts.map((post) => (
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
                <h3 className="font-heading font-semibold text-xl sm:text-2xl text-white group-hover:text-[#ffffff] transition mb-3 leading-snug">
                  <span className="zane-link">{post.title}</span>
                </h3>
              </Link>

              <p className="text-[#aaa] text-sm leading-relaxed mb-4 line-clamp-2">
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
      </section>
    </div>
  );
}
