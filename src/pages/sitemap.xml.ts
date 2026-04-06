import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@/config';
import { getPublishedPosts, getPostSlug } from '@/lib/utils/posts';

function toDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function urlEntry(
  loc: string,
  opts: { lastmod?: string; changefreq: string; priority: string }
): string {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    opts.lastmod ? `    <lastmod>${opts.lastmod}</lastmod>` : null,
    `    <changefreq>${opts.changefreq}</changefreq>`,
    `    <priority>${opts.priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export const GET: APIRoute = async () => {
  const [posts, projects] = await Promise.all([
    getPublishedPosts(),
    getCollection('projects'),
  ]);

  const site = SITE.website;

  const latestPostDate = posts.length
    ? [...posts]
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
        .map(p => p.data.updatedDate ?? p.data.pubDate)[0]
    : new Date();

  const entries = [
    urlEntry(`${site}/`, {
      lastmod: toDate(latestPostDate),
      changefreq: 'weekly',
      priority: '1.0',
    }),
    urlEntry(`${site}/about/`, {
      changefreq: 'monthly',
      priority: '0.7',
    }),
    urlEntry(`${site}/posts/`, {
      lastmod: toDate(latestPostDate),
      changefreq: 'weekly',
      priority: '0.8',
    }),
    urlEntry(`${site}/projects/`, {
      changefreq: 'monthly',
      priority: '0.7',
    }),
    ...posts.map(post =>
      urlEntry(`${site}/posts/${getPostSlug(post)}/`, {
        lastmod: toDate(post.data.updatedDate ?? post.data.pubDate),
        changefreq: 'monthly',
        priority: '0.8',
      })
    ),
    ...projects
      .filter(p => !p.data.directLink)
      .map(project =>
        urlEntry(`${site}/projects/${project.id}/`, {
          changefreq: 'monthly',
          priority: '0.6',
        })
      ),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};
