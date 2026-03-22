# Product Brief & Roadmap — lwalden.dev

> The "why" and "what" behind this project. Claude references this on-demand for decision context.

---

## What & Why

**Problem:** Laurance Walden has 12 years of enterprise C#/.NET/Azure experience but limited online visibility. The .NET + AI content niche is underserved — virtually all agentic AI content is Python-centric, leaving a large enterprise .NET audience without practical guidance.

**Vision:** A professional portfolio site at lwalden.dev that establishes Laurance as a practitioner voice for .NET + AI/agentic systems — serving as the canonical home for content, a consulting portfolio, and the hub of an automated multi-platform distribution pipeline.

**Target Users:** (1) Potential consulting clients and hiring managers evaluating technical credibility; (2) Enterprise .NET developers searching for practical AI integration content.

**Brand:** "Senior Software Engineer | .NET & Azure | AI & Agentic Systems" — builder, not hype creator. Working code, honest trade-offs, enterprise context.

---

## Phase 1 (Foundation) — Complete

All MVP items shipped. Site is live at lwalden.dev on Azure Static Web Apps.

1. ~~Astro site scaffolded and building~~ — 21 pages, zero build errors
2. ~~SEO-critical metadata on every page~~ — titles, descriptions, canonical, OG, Twitter cards, JSON-LD (Person, BlogPosting, BreadcrumbList, Organization)
3. ~~Content collections working~~ — 4 blog posts, 2 projects, RSS at `/rss.xml`, sitemap at `/sitemap-index.xml`
4. ~~Professional content scaffold~~ — homepage hero, about page with experience section, projects page with AI Agent Minder
5. ~~Deployment-ready config~~ — `staticwebapp.config.json` with security headers, GitHub Actions CI/CD
6. ~~GitHub profile artifacts~~ — README pushed to lwalden.github.io

---

## Phase 2 (Content & Distribution) — In Progress

### Done

- 4 blog posts published (AIAgentMinder series)
- Dynamic per-post OG images generated via satori
- Static fallback OG image for non-post pages
- Blog series grouping (section headers on blog listing page)

### Planned — Not Yet Implemented

- **Google Search Console setup** — add property, verify ownership, submit sitemap, request indexing *(human action — reminder active)*
- **n8n RSS-to-social automation** — poll RSS feed, post to LinkedIn/Medium/X on new publish. Integration contract at [docs/n8n-integration-contract.md](n8n-integration-contract.md). n8n-side work to be implemented in n8n-automation-hub.
- **Remove Airdrop Architect project page** — delete `site/content/projects/airdrop-architect.md` and replace with a more representative showcase project. Repo is now private and mothballed.
- **OptiTrade project page** — add to `site/content/projects/`. Algorithmic options trading system (Python) with backtesting and AI-assisted decision gates.
- **n8n automation blog series** — practical posts on building developer automation with n8n. Topics: RSS-to-social publishing pipelines, GitHub webhook workflows (PR review notifications, health monitors), email notification patterns with Resend, HMAC webhook security, and orchestrating multi-repo CI signals. Draws from real n8n-automation-hub workflows without exposing the private repo.
- **Blog content diversification** — posts beyond the AIAgentMinder series. Topics: .NET + AI integration patterns, Azure architecture, trading system design, Claude Code workflow.
- **LinkedIn/Medium optimization** — update profiles to point to lwalden.dev, set canonical URLs on Medium cross-posts
- **Analytics integration** — add Plausible or Umami for privacy-respecting traffic data

### Out of Scope (Phase 2)

- YouTube channel setup (Phase 3)
- Newsletter/Substack (Phase 3)
- Consulting services page (Phase 4)
- Contact form or Azure Functions backend
- Blog comments system

---

## Phase 3 (Authority Building)

Newsletter setup, conference speaking, video content, guest posts to .NET publications, YouTube channel.

---

## Phase 4 (Monetization)

Consulting services page, paid course/digital product, formalized lead generation.

---

## Technical Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | Astro (blog template) | Static generation, content collections, MDX support, sitemap/RSS built-in, fast builds |
| Language | TypeScript (strict) | Type safety on content schemas |
| Styling | Tailwind CSS | Utility-first, responsive-first |
| Syntax highlighting | Shiki (github-dark theme) | Built into Astro markdown config, zero runtime cost |
| Deployment | Azure Static Web Apps (free tier) | Custom domain + SSL, GitHub Actions CI/CD, path to Azure Functions |
| Custom domain | lwalden.dev | Live |
| Content | Markdown / Astro Content Collections | Type-safe frontmatter via Zod, co-located with source |
| SEO | `astro-seo`, `schema-dts`, `@astrojs/sitemap`, `@astrojs/rss` | Standard Astro SEO stack |
| OG Images | satori + @resvg/resvg-js | Build-time generation, per-post + static fallback |

---

## Quality Tier

**Tier:** Lightweight (personal portfolio site, solo developer, static output — no backend logic to test)

**Testing approach:** Build verification (`npm run build` must pass), manual smoke testing of all routes, visual check at 375px mobile width. No unit or E2E test suite — the "test" is a clean production build and a correct rendered page.

---

## Active Project Portfolio

Projects showcased or eligible for the site's projects page:

| Project | Status | Public | On Site |
| ------- | ------ | ------ | ------- |
| AI Agent Minder | Active | Yes | Yes |
| Airdrop Architect | Mothballed | Private | Remove from site |
| OptiTrade | Active | Yes | Planned |
| accessi-shield | Active | Private (commercial) | No |
| n8n-automation-hub | Active | Private (security concerns — blog series instead) | No |
| mcp-server (Bitwarden) | Moderate | Private (review needed before publish) | No |
| TradingSystem | Being merged into OptiTrade | Yes | No |

### Security Review Notes — Repos Considered for Public

**n8n-automation-hub:** Staying private. Security scan (2026-03-18) found: (1) live API keys (N8N_API_KEY JWT, RESEND_API_KEY) in local `.env` — rotate these regardless, (2) hardcoded email `lwalden77@gmail.com` in 4 workflow JSON files, (3) internal URLs (`api.accessishield.app`, `climbonco.com`) in workflow files that reveal commercial infrastructure, (4) localhost references in 7 files. Decision: write about n8n patterns in the blog series instead of open-sourcing the repo.

**mcp-server:** Safe to publish. No credentials in code or history. One minor fix: remove `C:\Users\lwald\.claude` path from `.claude/settings.json` before publishing.

---

## Human Actions Needed

- **Google Search Console setup** — Add property for lwalden.dev, verify ownership, submit sitemap `https://lwalden.dev/sitemap-index.xml`, request indexing. *Site is live — do this soon for SEO indexing.*
- **Medium canonical URL update** — After blog has traffic: republish articles on lwalden.dev and update Medium's canonical to point back
- **n8n API key rotation** — Rotate N8N_API_KEY and RESEND_API_KEY in local `.env` as a precaution (live keys found on disk during security scan 2026-03-18)
- **mcp-server public decision** — Remove local path from `.claude/settings.json`, then make public if desired

---

Last Updated: 2026-03-18
