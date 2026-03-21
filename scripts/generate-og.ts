/**
 * Generate a static fallback og.png for pages without dynamic OG images.
 * Matches the visual style of src/pages/og/[slug].png.ts exactly.
 *
 * Usage: npx tsx scripts/generate-og.ts
 */
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const TITLE = 'Laurance Walden';
const DESCRIPTION =
  'Senior Software Engineer | .NET, Azure, AI';
const SITE_URL = 'lwalden.dev';

async function main() {
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
        ${TITLE}
      </div>

      <div style="font-size: 32px; color: #a1a1aa;">
        ${DESCRIPTION}
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
        <span>${SITE_URL}</span>
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

  const outDir = resolve(import.meta.dirname!, '..', 'site', 'assets');
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const outPath = resolve(outDir, 'og.png');
  writeFileSync(outPath, png.asPng());
  console.log(`Generated ${outPath} (${png.width}x${png.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
