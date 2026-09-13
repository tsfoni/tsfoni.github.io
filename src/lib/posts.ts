import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  formattedDate?: string;
  author?: string;
  classification?: string;
  tags?: string[];
  summary?: string;
  contentHtml?: string;
  readingTime?: string;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getAllPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => ({
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    }));
}

export function getSortedPostsData(): PostData[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      // Estimate reading time
      const wordCount = matterResult.content.split(/\s+/g).length;
      const readingMinutes = Math.ceil(wordCount / 200);

      // Generate summary if not provided
      let summary = matterResult.data.summary || matterResult.data.description;
      if (!summary) {
        const cleanContent = matterResult.content
          .replace(/^#+\s+.*$/gm, '')
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/[*_`]/g, '')
          .trim();
        summary = cleanContent.slice(0, 180) + '...';
      }

      // Default tags if not present
      const tags = matterResult.data.tags || [
        'security',
        'malware-analysis',
        'reverse-engineering',
      ];

      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date ? String(matterResult.data.date) : '',
        formattedDate: formatDisplayDate(matterResult.data.date ? String(matterResult.data.date) : ''),
        author: matterResult.data.author || 'Harel Tsfoni',
        classification: matterResult.data.classification || '',
        tags,
        summary,
        readingTime: `${readingMinutes} min read`,
      };
    });

  // Sort posts by date descending
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(slug: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  // Convert markdown into HTML string with GFM support
  const processedContent = await remark()
    .use(gfm)
    .use(html, { sanitize: false })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  const wordCount = matterResult.content.split(/\s+/g).length;
  const readingMinutes = Math.ceil(wordCount / 200);

  const tags = matterResult.data.tags || [
    'security',
    'reverse-engineering',
    'malware-analysis',
    'threat-intelligence',
  ];

  return {
    slug,
    contentHtml,
    title: matterResult.data.title || slug,
    date: matterResult.data.date ? String(matterResult.data.date) : '',
    formattedDate: formatDisplayDate(matterResult.data.date ? String(matterResult.data.date) : ''),
    author: matterResult.data.author || 'Harel Tsfoni',
    classification: matterResult.data.classification || '',
    tags,
    readingTime: `${readingMinutes} min read`,
  };
}
