# DECISIONS.md - Architectural Decision Log

> Record significant decisions to prevent re-debating them later.
> Claude reads this before making architectural choices.
>

> **When to log:** choosing a library/framework, designing an API, selecting an auth approach, changing a data model, making a build/deploy decision.

---

## ADR Format

Format: Lightweight

**Lightweight:**
```
### [Title] | Date | Status: Active
Chose: [X] over [alternatives considered]. Why: [rationale]. Tradeoff: [what you gave up].
```

**Formal:**
```
### [Title]
- **Date:** [date]
- **Status:** Active | Superseded | Revisit
- **Context:** [what prompted this decision]
- **Options considered:** [option A, option B, option C]
- **Decision:** [what was chosen]
- **Tradeoffs:** [what was given up or accepted as risk]
- **Consequences:** [what this means going forward]
```

**Status values:** Active | Superseded | Revisit

---

### Astro (blog template) as framework | 2026-02-27 | Status: Active
Chose: Astro over Next.js, Hugo, Eleventy. Why: native content collections with type-safe Zod schemas, MDX, sitemap/RSS built-in, zero-JS by default, and the blog starter gives 80% of needed structure. Tradeoff: smaller ecosystem than Next.js; if dynamic server features (API routes, auth) are added later, evaluate adding Netlify/Vercel adapters or Azure Functions as a sidecar.

### Azure Static Web Apps over GitHub Pages | 2026-02-27 | Status: Active
Chose: Azure Static Web Apps (free tier) over GitHub Pages or Vercel. Why: native custom domain + auto SSL, built-in GitHub Actions CI/CD, path to Azure Functions for future API endpoints, aligns with the .NET/Azure brand ("walks the talk"). Tradeoff: more Azure-specific; Vercel would have simpler DX but doesn't reinforce the brand.

### Tailwind CSS (utility classes only, no separate CSS files) | 2026-02-27 | Status: Active
Chose: Tailwind utility classes in components over a CSS module approach or a separate stylesheet. Why: spec-mandated, consistent with Astro blog template conventions, keeps styling co-located with markup. Tradeoff: verbose class strings in templates; mitigated by Astro's component model.

### lwalden.dev as canonical domain (not lwalden.github.io) | 2026-02-27 | Status: Active
Chose: Move all canonical URLs to lwalden.dev immediately, even before the domain is live. Why: SEO authority accumulates on the domain — the sooner `<link rel="canonical">` and `site` config point to lwalden.dev, the sooner Google builds authority there. Tradeoff: local dev builds reference a domain that isn't yet live; acceptable since `site` only affects canonical/sitemap/RSS output, not local preview.
