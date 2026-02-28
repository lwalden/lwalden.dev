# Product Brief & Roadmap — lwalden.dev

> The "why" and "what" behind this project. Claude references this on-demand for decision context.

---

## What & Why

**Problem:** Laurance Walden has 12 years of enterprise C#/.NET/Azure experience but nearly zero online visibility. The current GitHub Pages site is indexed by Google with a stale title from a prior project, has no professional experience section, no structured data, and all writing lives on Medium with no SEO traction. The .NET + AI content niche is underserved — virtually all agentic AI content is Python-centric, leaving a large enterprise .NET audience without practical guidance.

**Vision:** A professional portfolio site at lwalden.dev that establishes Laurance as the go-to practitioner voice for .NET + AI/agentic systems — serving as the canonical home for content, a consulting portfolio, and the hub of an automated multi-platform distribution pipeline.

**Target Users:** (1) Potential consulting clients and hiring managers evaluating technical credibility; (2) Enterprise .NET developers searching for practical AI integration content.

**Brand:** "Senior Software Engineer | .NET & Azure | AI & Agentic Systems" — builder, not hype creator. Working code, honest trade-offs, enterprise context.

---

## MVP Features (Phase 1 — Foundation)

1. **Astro site scaffolded and building** — Acceptance: `npm run build` completes with zero errors; all pages render (homepage, about, projects, blog listing, blog post, 404)
2. **SEO-critical metadata on every page** — Acceptance: Every page has unique `<title>`, `<meta description>`, `<link rel="canonical">`, OG tags, Twitter Card tags; JSON-LD Person schema on homepage; JSON-LD BlogPosting on blog posts
3. **Content collections working** — Acceptance: Blog posts and projects render from markdown files; RSS feed generates valid XML at `/rss.xml`; sitemap generates at `/sitemap-index.xml`
4. **Professional content scaffold** — Acceptance: Homepage hero + CTAs; About page with experience section and skills matrix; Projects page with AI Agent Minder writeup; seed blog post visible
5. **Deployment-ready config** — Acceptance: `staticwebapp.config.json` present with security headers; GitHub Actions workflow configured for Azure Static Web Apps; legacy redirect page generated for lwalden.github.io
6. **GitHub profile artifacts** — Acceptance: Profile README file generated and ready to push; repo description list and pinning instructions documented

**Out of Scope (Phase 1):**
- n8n automation pipeline (Phase 1 Week 3 — after site is live)
- LinkedIn/Medium/X manual optimization (Week 2 — manual work)
- YouTube channel setup (Phase 2+)
- Newsletter/Substack (Phase 3)
- Consulting services page (Phase 4)
- Contact form or Azure Functions backend
- Analytics integration (add Plausible/Umami later)
- Blog comments system
- Content beyond seed/placeholder entries

---

## Technical Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | Astro (blog template) | Static generation, content collections, MDX support, sitemap/RSS built-in, fast builds |
| Language | TypeScript (strict) | Already specified in project identity; type safety on content schemas |
| Styling | Tailwind CSS | Utility-first, no separate CSS files, responsive-first |
| Syntax highlighting | Shiki (github-dark theme) | Built into Astro markdown config, zero runtime cost |
| Deployment | Azure Static Web Apps (free tier) | Custom domain + SSL, GitHub Actions CI/CD, path to Azure Functions, walks the talk |
| Custom domain | lwalden.dev | Already registered |
| Content | Markdown / Astro Content Collections | Type-safe frontmatter via Zod, co-located with source |
| SEO | `astro-seo`, `schema-dts`, `@astrojs/sitemap`, `@astrojs/rss` | Standard Astro SEO stack |

---

## Quality Tier

**Tier:** Lightweight (personal portfolio site, solo developer, static output — no backend logic to test)

**Testing approach:** Build verification (`npm run build` must pass), manual smoke testing of all routes, visual check at 375px mobile width. No unit or E2E test suite — the "test" is a clean production build and a correct rendered page.

---

## Phases

**Phase 1 (Foundation) — ~1-2 sessions:** Scaffold Astro site, implement all SEO infrastructure, build all pages with placeholder/seed content, configure Azure Static Web Apps deployment, generate GitHub profile artifacts. Ends when `npm run build` is green and the site is deployable.

**Phase 2 (Content & Distribution) — ongoing:** Write real blog posts through the full pipeline; set up n8n RSS-to-social automation; LinkedIn/Medium optimization; YouTube channel if desired. Each blog post is a Phase 2 task.

**Phase 3 (Authority Building):** Newsletter setup, conference speaking, Shorts/video content, guest posts to .NET publications.

**Phase 4 (Monetization):** Consulting services page, paid course/digital product, formalized lead generation.

---

## Open Questions

<!-- TODO: Confirm lwalden.dev DNS registrar and whether apex domain ALIAS/ANAME record is supported | WHEN: Before Azure deployment | BLOCKS: custom domain setup -->
<!-- TODO: Professional headshot available? Needed for hero section and OG image | WHEN: Before launch | BLOCKS: final visual polish -->
<!-- TODO: Airdrop Architect — real project description needed for projects page | WHEN: Before launch | BLOCKS: projects page content -->
<!-- TODO: Prior work history entries beyond Columbia Sportswear? | WHEN: Before launch | BLOCKS: About page experience section completeness -->

---

## Human Actions Needed

- **Azure account + Static Web App resource creation** — Before deployment (Claude cannot create Azure resources; use portal or `az staticwebapp create`)
- **Google Search Console setup** — After lwalden.dev is live: add property, verify ownership, submit sitemap `https://lwalden.dev/sitemap-index.xml`, request indexing
- **GitHub profile manual edits** — Fix bio typo (lwalden.guthub.io → lwalden.dev), update bio text, pin correct repos, push generated profile README to `lwalden/lwalden` repo
- **Medium canonical URL update** — After blog has traffic: republish articles on lwalden.dev and update Medium's canonical to point back
- **Legacy redirect deployment** — Copy `legacy-redirect/` contents to `lwalden.github.io` repo and push to main after new site is live
- **Airdrop Architect description** — Provide a real 1-line description for the projects page

---

*Generated by /plan | Last Updated: 2026-02-27*
