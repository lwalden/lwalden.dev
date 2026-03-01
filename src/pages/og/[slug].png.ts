import type { APIRoute } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { SITE } from '@/config';
import { getPublishedPosts, getPostSlug } from '@/lib/utils/posts';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  const projects = await getCollection('projects');

  const postPaths = posts.map((post: CollectionEntry<'posts'>) => ({
    params: { slug: getPostSlug(post) },
    props: { title: post.data.title, description: post.data.description, pubDate: post.data.pubDate },
  }));

  const projectPaths = projects
    .filter((project: CollectionEntry<'projects'>) => !project.data.directLink || !project.data.link)
    .map((project: CollectionEntry<'projects'>) => ({
      params: { slug: project.id },
      props: { title: project.data.title, description: project.data.description, pubDate: null },
    }));

  return [...postPaths, ...projectPaths];
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description, pubDate } = props as {
    title: string;
    description: string;
    pubDate: Date | null;
  };

  // Minimal buffer fetch for a font (Inter Bold)
  const fontData = await fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.0.19/latin-700-normal.woff'
  ).then((res) => res.arrayBuffer());

  const markup = html`
    <div
      style="
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #09090b;
      color: #fafafa;
      font-family: 'Inter';
      padding: 40px;
      text-align: center;
    "
    >
      <div
        style="
        font-size: 64px;
        font-weight: 700;
        color: #fafafa;
        margin-bottom: 24px;
        line-height: 1.1;
      "
      >
        ${title}
      </div>

      <div style="font-size: 32px; color: #a1a1aa;">
        ${description || `A post on ${SITE.title}`}
      </div>

      <div
        style="
        display: flex;
        align-items: center;
        margin-top: 48px;
        font-size: 24px;
        color: #71717a;
      "
      >
        <span style="margin-right: 16px;">${SITE.website.replace(/^https?:\/\//, '')}</span>
        ${pubDate ? html`<span>•</span><span style="margin-left: 16px;">${pubDate.toLocaleDateString('en-US', { dateStyle: 'long' })}</span>` : ''}
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: fontData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });

  const png = resvg.render();

  return new Response(png.asPng(), {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};
