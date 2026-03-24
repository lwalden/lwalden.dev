# CLAUDE.md - Project Instructions

> Claude reads this file automatically at the start of every session.
> Keep it concise — every line costs context tokens.
> Use `claude --continue` to restore the previous session's full message history.

## Project Identity

**Project:** lwalden-site
**Description:** Personal portfolio site and blog for Laurance Walden — Senior Software Engineer specializing in .NET, Azure, and AI-integrated enterprise systems, deployed to Azure Static Web Apps at lwalden.dev
**Type:** web-app
**Stack:** Astro (blog template), TypeScript (strict), Tailwind CSS, Azure Static Web Apps, Shiki syntax highlighting
**MCP Servers:** context7 (Astro/Tailwind live docs), sequential-thinking (complex task planning)

**Developer Profile:**
- Senior software engineer, 12 years C#/.NET/Azure enterprise experience
- Aggressive autonomy — Claude may scaffold, build, install, branch, and PR without asking

## MVP Goals

- Astro site builds clean (`npm run build` zero errors), all pages render (homepage, about, projects, blog, 404)
- Every page has unique `<title>`, `<meta description>`, canonical URL, OG tags, JSON-LD schema
- Content collections working: RSS at `/rss.xml`, sitemap at `/sitemap-index.xml`, seed blog post renders
- Azure Static Web Apps config + GitHub Actions workflow in place; legacy redirect page generated
- GitHub profile README artifact generated and ready to push

## Behavioral Rules

### Git Workflow

See `.claude/rules/git-workflow.md` — loaded natively by Claude Code each session.

### Credentials

Never store credentials in code. Use `.env` files (gitignored).

### Autonomy Boundaries

**You CAN autonomously:** Create files, install packages, run builds/tests, create branches and PRs, scaffold code, install and use CLI tools, query cloud services and APIs

**Only when explicitly asked:** Merge PRs

**Ask the human first:** Create GitHub repos, sign up for services, provide API keys, approve major architectural changes

**Tool-first rule:** See `.claude/rules/tool-first.md` — never ask the user to do something you can do with a tool

### Verification-First Development

- Confirm requirements before implementing
- Write tests appropriate to the project's quality tier (see strategy-roadmap.md)
- When Standard tier or above: write failing tests first, then implement
- Apply `fixing-metadata` and `fixing-accessibility` skills when creating or modifying pages or components

### Decision Recording

- Record significant architectural decisions in DECISIONS.md (library choices, API contracts, auth approach, data model changes, deploy decisions)
- Record known shortcuts and workarounds in the Known Debt section of DECISIONS.md
- Include alternatives considered — a decision without alternatives is an assertion, not a record
- To auto-load DECISIONS.md every session, add `@DECISIONS.md` to this file

## Context Budget

> Use `/context` for real-time context usage and optimization tips.

**Always loaded:** CLAUDE.md — keep under ~50 lines; don't add without removing something

**On-demand:** DECISIONS.md — add `@DECISIONS.md` here to auto-load; delete superseded entries
