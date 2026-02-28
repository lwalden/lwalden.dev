# SPEC: Part 1 — Foundation Repair

## Objective

Build a new personal portfolio site in a **new repository** (`lwalden-site`) as a modern Astro-based static site with an integrated Markdown blog, optimized SEO, structured data, and professional content. The site will be deployed to **Azure Static Web Apps** with a custom domain: **lwalden.dev**. The existing `lwalden.github.io` repo will be reduced to a redirect page. This spec covers everything Claude Code needs to execute the "Part 1: Current profile audit and critical fixes" phase of the professional positioning plan.

---

## Context: Who Is This For?

**Laurance Walden** — Senior Software Engineer with 12 years of C#/.NET/Azure enterprise experience (most recently at Columbia Sportswear). Currently building AI-integrated systems and positioning as a thought leader in the .NET + AI/agentic systems space. The site serves two audiences: (1) potential consulting clients and hiring managers evaluating technical credibility, and (2) .NET developers searching for AI integration content.

**Brand positioning:** "Senior Software Engineer | .NET & Azure | AI & Agentic Systems"

**Tone:** Professional but approachable. Builder, not hype creator. Shows working code, discusses trade-offs honestly. Has a whimsical side — the site should feel like a real person, not a corporate template.

---

## 1. Project Scaffolding

### 1.1 Initialize Astro Project

```bash
npm create astro@latest lwalden-site -- --template blog --typescript strict
cd lwalden-site
```

Use the official `blog` starter template as the base. It provides:
- Markdown/MDX content collections for blog posts
- RSS feed generation
- Sitemap generation
- Basic SEO-friendly structure

### 1.2 Install Required Dependencies

```bash
# Core
npm install @astrojs/sitemap @astrojs/rss

# SEO & structured data
npm install astro-seo schema-dts

# Styling
npm install @astrojs/tailwind tailwindcss

# Image optimization
npm install @astrojs/image sharp
```

### 1.3 Project Structure Target

```
lwalden-site/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/
│       ├── headshot.jpg          # Professional photo (user will provide)
│       └── og-default.png        # Default Open Graph image (1200x630)
├── src/
│   ├── components/
│   │   ├── BaseHead.astro        # <head> with SEO meta, JSON-LD, OG tags
│   │   ├── Header.astro          # Site navigation
│   │   ├── Footer.astro          # Footer with links
│   │   ├── ProjectCard.astro     # For featured projects
│   │   ├── ExperienceItem.astro  # For work history entries
│   │   ├── SkillBadge.astro      # Tech stack visual badges
│   │   └── BlogPostCard.astro    # Blog listing card
│   ├── content/
│   │   ├── config.ts             # Content collection schemas
│   │   ├── blog/
│   │   │   └── .gitkeep          # Blog posts go here as .md files
│   │   └── projects/
│   │       ├── ai-agent-minder.md
│   │       └── airdrop-architect.md
│   ├── data/
│   │   ├── experience.ts         # Work history data
│   │   ├── skills.ts             # Tech stack data
│   │   └── siteConfig.ts         # Global site configuration
│   ├── layouts/
│   │   ├── BaseLayout.astro      # Root layout with BaseHead
│   │   ├── BlogPost.astro        # Blog post layout with reading time, TOC
│   │   └── Page.astro            # Generic page layout
│   ├── pages/
│   │   ├── index.astro           # Homepage
│   │   ├── about.astro           # About + experience + skills
│   │   ├── projects.astro        # Featured projects
│   │   ├── blog/
│   │   │   ├── index.astro       # Blog listing page
│   │   │   └── [...slug].astro   # Individual blog post pages
│   │   ├── rss.xml.ts            # RSS feed endpoint
│   │   └── 404.astro             # Custom 404 page
│   └── styles/
│       └── global.css            # Global styles / Tailwind base
```

---

## 2. Site Configuration

### 2.1 `src/data/siteConfig.ts`

```typescript
export const siteConfig = {
  title: "Laurance Walden",
  description: "Senior Software Engineer specializing in .NET, Azure, and AI-integrated enterprise systems. 12 years of building production software. Writing about agentic AI, Semantic Kernel, and the future of .NET.",
  siteUrl: "https://lwalden.dev",
  author: "Laurance Walden",
  authorTitle: "Senior Software Engineer | .NET & Azure | AI & Agentic Systems",
  social: {
    github: "https://github.com/lwalden",
    linkedin: "https://www.linkedin.com/in/laurancewalden/",
    medium: "https://medium.com/@lwalden",
  },
  ogImage: "/images/og-default.png",
  locale: "en_US",
};
```

### 2.2 `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lwalden.dev',
  integrations: [
    tailwind(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
```

**IMPORTANT:** Set `site` to `https://lwalden.dev` from day one. Before the custom domain is live, the site will still build correctly — the `site` value is used for canonical URLs, sitemap, and RSS, not for local dev.

---

## 3. SEO & Metadata (Critical Fixes)

This is the highest-priority section. The current site is indexed by Google with a stale title from a previous project. Every page must have correct, unique metadata.

### 3.1 `BaseHead.astro` Component

This component goes in `<head>` on every page. It must include:

**Standard meta tags:**
- `<title>` — unique per page, format: `{pageTitle} | Laurance Walden` (homepage just: `Laurance Walden — Senior Software Engineer | .NET, Azure & AI`)
- `<meta name="description">` — unique per page, 150-160 characters, keyword-rich
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical" href="{full URL of this page}">`
- `<meta name="author" content="Laurance Walden">`

**Open Graph tags:**
- `og:title`, `og:description`, `og:url`, `og:image` (1200x630px), `og:type` (website for pages, article for blog posts), `og:site_name`, `og:locale`

**Twitter Card tags:**
- `twitter:card` = `summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image`

**JSON-LD Person Schema (homepage only):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Laurance Walden",
  "url": "https://lwalden.dev",
  "jobTitle": "Senior Software Engineer",
  "description": "Senior Software Engineer specializing in .NET, Azure, and AI-integrated enterprise systems with 12 years of experience.",
  "knowsAbout": [
    "C#", ".NET", "Azure", "AI", "Agentic Systems",
    "Semantic Kernel", "MCP", "Azure AI Foundry",
    "Software Architecture", "Enterprise Systems"
  ],
  "sameAs": [
    "https://github.com/lwalden",
    "https://www.linkedin.com/in/laurancewalden/",
    "https://medium.com/@lwalden"
  ],
  "alumniOf": [],
  "worksFor": {
    "@type": "Organization",
    "name": "Independent"
  }
}
</script>
```

**JSON-LD BlogPosting Schema (blog posts only):**

Each blog post page should include a `BlogPosting` schema with `headline`, `datePublished`, `dateModified`, `author`, `description`, and `url`.

### 3.2 `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://lwalden.dev/sitemap-index.xml
```

### 3.3 RSS Feed

Implement at `src/pages/rss.xml.ts` using `@astrojs/rss`. Include all blog posts. The RSS feed URL (`https://lwalden.dev/rss.xml`) is the trigger point for the n8n automation pipeline described in later phases of the plan.

---

## 4. Page Specifications

### 4.1 Homepage (`src/pages/index.astro`)

**Purpose:** First impression. Communicate who Laurance is, what he does, and why you should care — in 5 seconds.

**Layout (top to bottom):**

1. **Hero Section**
   - Name: "Laurance Walden"
   - Tagline: "Senior Software Engineer | .NET & Azure | AI & Agentic Systems"
   - 1-2 sentence hook: Something like "I build AI-integrated enterprise systems and write about making .NET work with the agentic future. 12 years of shipping production software."
   - CTA buttons: "Read the Blog" and "View Projects"
   - Social links (GitHub, LinkedIn, Medium) as icons

2. **Featured Projects Section** (2-3 cards)
   - Pull from `content/projects/` collection
   - Each card: project name, one-line description, tech stack badges, link to repo/details

3. **Latest Blog Posts** (3 most recent)
   - Pull from `content/blog/` collection
   - Each card: title, date, reading time, 1-line excerpt

4. **Brief About Blurb**
   - 2-3 sentences + "Read more →" link to /about

### 4.2 About Page (`src/pages/about.astro`)

**Purpose:** The missing professional experience section. This is where 12 years of enterprise work becomes visible.

**Layout (top to bottom):**

1. **Professional Summary** (3-4 paragraphs)
   - Paragraph 1: Hook + specialization (enterprise .NET + AI integration)
   - Paragraph 2: Career highlights — 12 years, Columbia Sportswear, the kind of systems built (quantify where possible: scale, users, transactions)
   - Paragraph 3: Current focus — agentic AI, Semantic Kernel, MCP, AIAgentMinder project, what problems are being solved
   - Paragraph 4: What's next — consulting, content creation, building in public

2. **Professional Experience Section**
   - Use the `ExperienceItem` component
   - Structure each entry as: Company name, title, date range, 2-4 bullet points of achievements/responsibilities
   - **Data source:** Create `src/data/experience.ts` with placeholder entries. User will fill in actual details. Structure:

   ```typescript
   export interface ExperienceEntry {
     company: string;
     title: string;
     startDate: string;  // "Jan 2013"
     endDate: string;     // "Present" or "Dec 2024"
     description: string; // Brief role summary
     highlights: string[]; // 2-4 achievement bullets
     technologies: string[]; // Key tech used
   }
   ```

   Include **placeholder entries** that the user can customize:
   - Columbia Sportswear (most recent, longest tenure — ~12 years, Senior Software Engineer)
   - Any prior roles (user will add)

3. **Skills & Technology Matrix**
   - Use `SkillBadge` components grouped by category
   - Categories: Languages & Frameworks, Cloud & Infrastructure, AI & Machine Learning, Tools & Practices
   - Visual badges, not just a text list
   - **Data source:** `src/data/skills.ts`

   ```typescript
   export interface Skill {
     name: string;
     category: "languages" | "cloud" | "ai" | "tools";
     proficiency: "expert" | "advanced" | "intermediate";
   }

   export const skills: Skill[] = [
     { name: "C#", category: "languages", proficiency: "expert" },
     { name: ".NET / ASP.NET Core", category: "languages", proficiency: "expert" },
     { name: "Azure", category: "cloud", proficiency: "expert" },
     { name: "Azure DevOps", category: "cloud", proficiency: "expert" },
     { name: "Azure AI Foundry", category: "cloud", proficiency: "advanced" },
     { name: "SQL Server", category: "languages", proficiency: "expert" },
     { name: "JavaScript / TypeScript", category: "languages", proficiency: "advanced" },
     { name: "Semantic Kernel", category: "ai", proficiency: "advanced" },
     { name: "MCP (Model Context Protocol)", category: "ai", proficiency: "advanced" },
     { name: "OpenAI / Claude APIs", category: "ai", proficiency: "advanced" },
     { name: "Git", category: "tools", proficiency: "expert" },
     { name: "Docker", category: "tools", proficiency: "advanced" },
     { name: "CI/CD Pipelines", category: "tools", proficiency: "expert" },
     // User should review and adjust
   ];
   ```

4. **Certifications** (if any — leave a placeholder section)

### 4.3 Projects Page (`src/pages/projects.astro`)

**Purpose:** Showcase the builder brand. Every project is a consulting portfolio piece.

**Content Collection:** `src/content/projects/`

Each project markdown file has frontmatter:

```yaml
---
title: "AI Agent Minder"
description: "A governance and lifecycle management tool for AI agents built with C# and .NET."
repo: "https://github.com/lwalden/AIAgentMinder"
demo: ""  # Optional live demo URL
technologies: ["C#", ".NET", "Azure", "AI Agents", "Semantic Kernel"]
featured: true
sortOrder: 1
status: "active"  # active | complete | archived
---
```

Body of the markdown: 2-4 paragraphs explaining what the project does, why it exists, architectural decisions, and what was learned. This is content marketing disguised as project documentation.

**Seed with two projects:**

1. **AI Agent Minder** — Governance and lifecycle management for AI agents. C#/.NET. Directly relevant to the industry's emerging need for agent oversight. Link to GitHub repo.

2. **Airdrop Architect** — (User needs to provide a real description. Placeholder: "A tool for [description]. Built with [tech].")

### 4.4 Blog Section

**Blog listing page** (`src/pages/blog/index.astro`):
- List all posts reverse-chronologically
- Each entry: title, date, reading time (calculated from word count), excerpt, tags
- Paginate if > 10 posts (use Astro's built-in pagination)

**Blog post layout** (`src/layouts/BlogPost.astro`):
- Post title, date, reading time, tags
- Auto-generated table of contents from headings (use Astro's built-in `remarkPluginFrontmatter` or a rehype TOC plugin)
- Author bio card at the bottom with links
- "Share on LinkedIn / X" buttons
- Previous/Next post navigation
- `<link rel="canonical">` — this is critical for cross-posting. The canonical URL must always point to `https://lwalden.dev/blog/{slug}` even when the content appears on Medium or Dev.to.

**Blog post content collection schema** (`src/content/config.ts`):

```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    canonicalUrl: z.string().url().optional(),
  }),
});

const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    technologies: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    sortOrder: z.number().default(99),
    status: z.enum(["active", "complete", "archived"]).default("active"),
  }),
});

export const collections = {
  blog: blogCollection,
  projects: projectCollection,
};
```

**Seed blog content:** Create one placeholder post to verify the pipeline works:

```markdown
---
title: "Hello World — Why I'm Building in Public"
description: "After 12 years of enterprise software engineering, I'm making my work visible. Here's why, and what I'll be writing about."
pubDate: 2026-02-26
tags: [".NET", "AI", "career", "building-in-public"]
draft: false
---

<!-- User writes this content. Placeholder below. -->

After 12 years of building enterprise systems with C# and Azure, most of my work has been invisible to the outside world. That changes now.

This blog is where I'll document what I'm learning, building, and thinking about at the intersection of .NET and AI — particularly agentic systems, Semantic Kernel, MCP, and the Microsoft Agent Framework.

More coming soon.
```

### 4.5 404 Page

Simple, on-brand 404 page. Brief message, link back to homepage. Nothing elaborate.

---

## 5. Design & Styling Guidelines

### 5.1 Visual Direction

**Do NOT make this look like a generic developer portfolio template.** The plan emphasizes authenticity and a "builder" brand. The site should feel:
- Clean and readable (content-first, not design-first)
- Technically competent but warm
- Light mode by default with a dark mode toggle (respect `prefers-color-scheme`)
- Good typography — use a system font stack or a high-quality variable font (Inter, JetBrains Mono for code)

### 5.2 Color Palette (suggestion — user can adjust)

Use Tailwind's built-in palette. Suggested starting point:
- Primary: slate/gray tones (professional)
- Accent: a single pop color for links, CTAs, and highlights — something like `blue-600` / `blue-400` in dark mode, or `emerald-600` for a slightly less corporate feel
- Code blocks: dark background (`gray-900`) with syntax highlighting via Shiki

### 5.3 Typography

- Body: `font-sans` (system stack) at 16-18px base
- Headings: Same family, bolder weight
- Code: `font-mono` (JetBrains Mono if loading a web font, otherwise system monospace)
- Line height: 1.6-1.75 for body text (readability)

### 5.4 Responsive

Mobile-first. The site must look great on phones — recruiters and LinkedIn visitors will often land on mobile. Test navigation, blog reading experience, and project cards at 375px width.

---

## 6. Deployment: Azure Static Web Apps

### 6.1 Why Azure Static Web Apps (not GitHub Pages)

- Free tier covers personal sites
- Native custom domain support with automatic SSL
- Built-in CI/CD via GitHub Actions
- Path to adding Azure Functions backend later (for API endpoints, contact forms, etc.)
- Aligns with Laurance's Azure expertise (walking the talk)

### 6.2 Setup Steps

1. **Create Azure Static Web App resource** in the Azure portal (or via Azure CLI):
   ```bash
   az staticwebapp create \
     --name lwalden-site \
     --resource-group personal-site \
     --source https://github.com/lwalden/lwalden-site \
     --location "westus2" \
     --branch main \
     --app-location "/" \
     --output-location "dist" \
     --login-with-github
   ```

2. **GitHub Actions workflow** will be auto-generated by Azure. It should:
   - Trigger on push to `main`
   - Run `npm install` and `npm run build`
   - Deploy the `dist/` folder

3. **Custom domain configuration:**
   - In Azure portal → Static Web App → Custom domains → Add `lwalden.dev`
   - Create a CNAME record at your domain registrar pointing to the Azure-provided hostname
   - For apex domain (`lwalden.dev` without `www`): use an ALIAS/ANAME record if your registrar supports it, or redirect `www` → apex
   - SSL certificate is provisioned automatically

4. **Redirect `lwalden.github.io` to `lwalden.dev`:**
   - See Section 13 for the full redirect page. After the new site is live at `lwalden.dev`, replace the old `lwalden.github.io` repo contents with the redirect page.
   - The redirect uses both `<meta http-equiv="refresh">` and JavaScript `window.location.replace()` for maximum browser coverage.
   - The `<meta name="robots" content="noindex, follow">` tells Google to stop indexing the old domain and follow the redirect to the new one.

### 6.3 `staticwebapp.config.json`

Place in the project root:

```json
{
  "navigationFallback": {
    "rewrite": "/404.html"
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/404.html",
      "statusCode": 404
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
  },
  "routes": [
    {
      "route": "/rss.xml",
      "headers": {
        "Content-Type": "application/rss+xml"
      }
    }
  ]
}
```

---

## 7. GitHub Profile Fixes

These are separate from the Astro site but are part of the Part 1 execution. Claude Code should generate the files; the user will push them manually.

### 7.1 GitHub Profile README

Create a file that the user can place in a new `lwalden/lwalden` repository as `README.md`:

```markdown
# Hey, I'm Laurance 👋

**Senior Software Engineer** with 12 years of building enterprise systems in C#, .NET, and Azure. Currently exploring the intersection of .NET and agentic AI.

## What I'm Working On

🔧 **[AI Agent Minder](https://github.com/lwalden/AIAgentMinder)** — Governance and lifecycle management for AI agents, built in C#/.NET

✍️ **[Blog](https://lwalden.dev/blog)** — Writing about .NET + AI integration, Semantic Kernel, MCP, and building agentic systems for the enterprise

## Tech Stack

![C#](https://img.shields.io/badge/C%23-239120?style=flat&logo=csharp&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?style=flat&logo=dotnet&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-0078D4?style=flat&logo=microsoftazure&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

## Find Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/laurancewalden/)
[![Medium](https://img.shields.io/badge/Medium-000000?style=flat&logo=medium&logoColor=white)](https://medium.com/@lwalden)
[![Website](https://img.shields.io/badge/lwalden.dev-000?style=flat&logo=astro&logoColor=white)](https://lwalden.dev)
```

### 7.2 Repository Descriptions (user applies manually)

Provide suggested descriptions for each repo:

| Repo | Suggested Description |
|------|----------------------|
| **AIAgentMinder** | Governance and lifecycle management framework for AI agents. C# / .NET. |
| **airdrop-architect** | *(User to provide a real 1-line description of what this project does)* |
| **lwalden.github.io** | Legacy portfolio site — now redirects to lwalden.dev |
| **life** | *(Keep or update as appropriate — user decides)* |
| **dice-roller** | *(Do NOT pin this. Leave description as-is or archive.)* |
| **HostingOnGitHub** | *(Do NOT pin this. Leave description as-is or archive.)* |

### 7.3 Pinned Repos (user applies manually)

Pin exactly these four: **AIAgentMinder**, **airdrop-architect**, **lwalden-site** (the new Astro repo), **life**

Unpin: **dice-roller**, **HostingOnGitHub**, **lwalden.github.io** (now just a redirect)

### 7.4 GitHub Bio

Set the GitHub bio text to:
> Senior Software Engineer | C#/.NET/Azure | Building AI-integrated systems | lwalden.dev

Set the website URL to: `https://lwalden.dev` (fixing the current `lwalden.guthub.io` typo)

---

## 8. Content Migration

### 8.1 Migrating Content (NOT Design)

The old `lwalden.github.io` site contains some useful *text content* that should inform (not dictate) the new site. **Do not replicate the old site's HTML structure, CSS, layout, or visual design in any way.** Only the factual substance is relevant:

1. **About section text** → Use as raw material when writing the professional summary for `src/pages/about.astro`. Rewrite and expand — don't copy/paste.
2. **AI Agent Minder project description** → Use as a starting point for `src/content/projects/ai-agent-minder.md`. Expand with architectural details.
3. **Links to Medium articles** → Include as blog post entries with `canonicalUrl` pointing to Medium (until the articles can be republished on the new site as canonical source).

### 8.2 Medium Article Strategy

The two existing Medium articles should eventually be republished on the new blog as the canonical versions. For now:

1. Create blog entries that link to the Medium versions
2. Once the blog has organic traffic, republish the full content on `lwalden.dev/blog/` and update Medium's canonical URL setting to point back to the new site

---

## 9. Google Search Console Submission

After deployment, the user must manually:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property `https://lwalden.dev`
3. Verify ownership via DNS TXT record or HTML file upload
4. Submit the sitemap URL: `https://lwalden.dev/sitemap-index.xml`
5. Request indexing of the homepage
6. After a few days, check that the old "MiSnap 4.2.0" title is no longer appearing

**Claude Code cannot do this step** — it requires browser authentication. Document it clearly as a manual step.

---

## 10. Checklist: Definition of Done

The Part 1 foundation is complete when ALL of the following are true:

### Site Build
- [ ] Astro project initializes and builds without errors
- [ ] All pages render: homepage, about, projects, blog listing, blog post, 404
- [ ] Content collections work for both blog posts and projects
- [ ] RSS feed generates valid XML at `/rss.xml`
- [ ] Sitemap generates at `/sitemap-index.xml`
- [ ] JSON-LD Person schema is present on the homepage
- [ ] JSON-LD BlogPosting schema is present on blog post pages
- [ ] Every page has unique `<title>`, `<meta description>`, and `<link rel="canonical">`
- [ ] Open Graph and Twitter Card tags are present on every page
- [ ] `robots.txt` exists and references the sitemap
- [ ] Dark mode toggle works and respects `prefers-color-scheme`
- [ ] Site is fully responsive down to 375px width
- [ ] Code blocks have syntax highlighting
- [ ] Blog posts calculate and display reading time

### Content
- [ ] Homepage hero section with name, tagline, hook, and CTAs
- [ ] About page has professional summary (placeholder text is fine — user will customize)
- [ ] About page has experience section with at least one placeholder entry
- [ ] About page has skills/technology matrix
- [ ] Projects page displays AI Agent Minder with full writeup
- [ ] At least one seed blog post exists and renders correctly
- [ ] GitHub profile README file is generated and ready to push

### Deployment
- [ ] Project lives in a NEW repo (`lwalden-site`), not in `lwalden.github.io`
- [ ] `staticwebapp.config.json` is present in project root
- [ ] GitHub Actions workflow is configured for Azure Static Web Apps deployment
- [ ] Instructions for custom domain setup (`lwalden.dev`) are documented in the repo README
- [ ] Instructions for Google Search Console submission are documented

### Legacy Redirect
- [ ] `legacy-redirect/index.html` is generated with meta + JS redirect to `lwalden.dev`
- [ ] `legacy-redirect/README.md` is generated explaining the redirect
- [ ] Instructions for replacing old repo contents are documented

### Files Generated for Manual GitHub Fixes
- [ ] GitHub profile README (`README.md` for `lwalden/lwalden` repo)
- [ ] List of suggested repo descriptions
- [ ] List of repos to pin
- [ ] Bio text and website URL to set on GitHub profile

---

## 11. What This Spec Does NOT Cover

These are future phases and should NOT be implemented now:

- n8n automation pipeline setup (Phase 1, Week 3)
- LinkedIn/Medium/X optimization (Phase 1, Week 2 — manual work)
- YouTube channel setup (Phase 2+)
- Newsletter/Substack setup (Phase 3)
- Consulting services page (Phase 4)
- Contact form or Azure Functions backend
- Analytics integration (add later — Plausible or Umami for privacy-respecting analytics)
- Comments system on blog posts (add later if desired — giscus is a good option)

---

## 12. Notes for Claude Code Execution

- **This is a NEW repository** (`lwalden-site`). Do NOT clone or modify `lwalden.github.io`. That repo gets a redirect page (see Section 13).
- **Do NOT reference the existing site's HTML, CSS, or visual design.** The old site at `lwalden.github.io` is not a template, starting point, or design reference. Build the new site's structure, layout, and styling entirely from scratch based on the specifications in this document. Claude Code should not fetch, inspect, or reverse-engineer the old site.
- **Build the complete Astro project from scratch.** Use the blog starter template, then customize.
- **Use TypeScript throughout.** The project was scaffolded with `--typescript strict`.
- **Tailwind CSS for all styling.** No separate CSS files beyond the Tailwind base. Use utility classes directly in components.
- **All placeholder content should be clearly marked** with comments like `<!-- TODO: Replace with actual content -->` or `// TODO: User to customize` so Laurance knows exactly what to fill in.
- **Test the build** — run `npm run build` and verify zero errors before considering the task complete.
- **Generate the GitHub profile README as a separate file** in the project root (e.g., `github-profile-readme.md`) so it can be copied to the `lwalden/lwalden` repo.

---

## 13. Redirect Page for Old Repository (`lwalden.github.io`)

The existing `lwalden.github.io` repo must continue to serve content during the transition so that existing links (from LinkedIn, GitHub profile, Google's index) don't 404. Once the new site is live at `lwalden.dev`, replace the old repo's content with this single redirect page.

**Generate this as a separate file** in the project root: `legacy-redirect/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting to lwalden.dev</title>
  <meta http-equiv="refresh" content="0; url=https://lwalden.dev">
  <link rel="canonical" href="https://lwalden.dev">
  <meta name="robots" content="noindex, follow">
  <meta name="description" content="This site has moved to lwalden.dev">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #0f172a;
      color: #e2e8f0;
    }
    a { color: #60a5fa; }
  </style>
</head>
<body>
  <p>This site has moved to <a href="https://lwalden.dev">lwalden.dev</a>.</p>
  <script>window.location.replace("https://lwalden.dev");</script>
</body>
</html>
```

Also generate a `legacy-redirect/CNAME` file (empty — the user deletes the existing CNAME if present) and a `legacy-redirect/README.md`:

```markdown
# lwalden.github.io (Legacy)

This repository previously hosted my portfolio site. It now redirects to [lwalden.dev](https://lwalden.dev).

The active site source lives in the [lwalden-site](https://github.com/lwalden/lwalden-site) repository.
```

**Instructions for the user:** Copy the contents of `legacy-redirect/` into the `lwalden.github.io` repo, replacing all existing files. Push to `main`. GitHub Pages will serve the redirect.

---

## 14. Recommended MCP Servers for Claude Code

After evaluating available MCP servers for this project, here is what's worth setting up and what isn't.

### Recommended: Context7 MCP

**What it does:** Fetches up-to-date, version-specific documentation for libraries directly into Claude Code's context. Instead of relying on training data (which may have stale Astro, Tailwind, or other API patterns), Context7 pulls current docs at query time.

**Why it matters for this project:** Astro's API surface changes frequently between versions. Content Collections, the `@astrojs/sitemap` integration, and Tailwind v4 configuration have all shifted recently. Context7 prevents Claude Code from generating code against deprecated APIs.

**Setup:**
```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

Or add to `.claude/settings.json` or the project's `.mcp.json`:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

**Usage:** When prompting Claude Code about Astro, Tailwind, or any library, append `use context7` to the prompt to trigger live doc lookup. Example:
- "Set up Astro content collections for blog posts. use context7"
- "Configure @astrojs/sitemap integration. use context7"

### Optional but Useful: Sequential Thinking MCP

**What it does:** Gives Claude Code a structured reasoning tool for breaking down complex multi-step tasks.

**Why it might help:** This spec has many interconnected pieces (SEO, schema markup, content collections, deployment config). Sequential Thinking can help Claude Code plan its execution order rather than jumping in and discovering dependency issues mid-build.

**Setup:**
```bash
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
```

### NOT Recommended for This Project

| MCP Server | Why Not |
|---|---|
| **GitHub MCP** | Claude Code already has native git and GitHub CLI integration. Adding the MCP server adds complexity without benefit for this task. |
| **Filesystem MCP** | Claude Code already has full filesystem access in VS Code. Redundant. |
| **Playwright/Browser MCP** | No browser testing needed during the build phase. Add later if you want automated visual regression testing. |
| **VSCode MCP** | Adds LSP diagnostics for Claude Code, which is useful for large TypeScript projects but overkill for an Astro site build. |
| **Perplexity/Web Search MCP** | Claude Code can already search the web. Not needed. |

### Third-Party Skill Files

There are no third-party Claude Code skill files specifically for Astro or Azure Static Web Apps that would meaningfully improve execution quality. The Context7 MCP server covers the "current documentation" need more effectively than a static skill file would.

**Summary:** Install Context7. Optionally install Sequential Thinking. Skip everything else for this project.

---

## 15. Reference Document: The Broader Plan

The file `Laurance_Walden__Professional_Positioning_Plan_for_the_AI_Era.md` contains the full professional positioning strategy that this spec is derived from. It should be available in the project directory for Claude Code to reference.

**⚠️ IMPORTANT: This document is READ-ONLY CONTEXT. Do NOT implement anything from it unless explicitly called for in this spec.**

The broader plan covers content strategy, LinkedIn/Medium/X optimization, YouTube channel setup, automation pipelines, a 24-month roadmap, and monetization — none of which are in scope for this build. It exists so that if Claude Code needs to understand *why* a particular design decision was made (e.g., why RSS matters, why canonical URLs are critical, why the blog architecture is structured this way), it can find the reasoning there.

**How to make it available:** Place the plan file in the project root or a `/docs` directory:
```
lwalden-site/
├── docs/
│   └── positioning-plan.md    # The full plan — context only, do not execute
├── SPEC-Part1-Foundation-Repair.md  # THIS file — the executable spec
├── src/
│   └── ...
```

Claude Code should treat this spec as the **only source of truth** for what to build. The plan document answers "why" questions; this spec answers "what" and "how."
