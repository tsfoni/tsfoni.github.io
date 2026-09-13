import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostSlugs, getPostData } from '@/src/lib/posts';
import PostContent from '@/src/components/PostContent';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((s) => ({
    slug: s.params.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  try {
    const post = await getPostData(params.slug);
    const postUrl = `https://tsfoni.github.io/blog/${params.slug}/`;
    const postDescription = post.summary || post.title;

    // Detect first image if any in post markdown, otherwise use avatar
    const imgMatch = post.contentHtml?.match(/<img[^>]+src="([^">]+)"/);
    let imageUrl = 'https://avatars.githubusercontent.com/u/104026572';
    if (imgMatch && imgMatch[1]) {
      const src = imgMatch[1];
      imageUrl = src.startsWith('http') ? src : `https://tsfoni.github.io${src}`;
    }

    return {
      title: `${post.title} - Harel Tsfoni`,
      description: postDescription,
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        title: post.title,
        description: postDescription,
        url: postUrl,
        siteName: 'Harel Tsfoni',
        type: 'article',
        publishedTime: post.date,
        authors: ['Harel Tsfoni'],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: postDescription,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Post Not Found - Harel Tsfoni',
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  let post;
  try {
    post = await getPostData(params.slug);
  } catch {
    notFound();
  }

  return (
    <article className="pt-2 pb-16">
      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-white transition duration-200 mb-8 zane-link"
      >
        <ArrowLeft size={16} /> Back to blog
      </Link>

      {/* Post Title */}
      <h1 className="font-heading font-semibold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight mb-4">
        {post.title}
      </h1>

      {/* Post Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#888] mb-6 font-normal">
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

      {/* Tags Badges */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-white/10">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded bg-white/5 text-[#aaa] border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Markdown Content with interactive Zoomable Media */}
      <PostContent html={post.contentHtml || ''} />
    </article>
  );
}
