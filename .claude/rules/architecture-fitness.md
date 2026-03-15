---
description: Architecture fitness rules — structural constraints for this project
---

# Architecture Fitness Rules
# AIAgentMinder-managed. Customize the rules below to match your project's architecture.
# Delete this file to opt out of architecture fitness enforcement.

## How to Use This File

These rules are enforced by Claude during code review, PR creation, and when writing new code.
Each rule is specific enough to check mechanically.

---

## Structural Constraints

### Layer Boundaries

This project follows a strict directed acyclic graph (DAG) of imports:

```
Pages → Layouts → Components → Lib (utils, schemas, state)
  ↓                                        ↓
  └──────────────────────────→ Config (site/config.ts)
```

- `src/pages/` may import from layouts, components, lib, and config.
- `src/layouts/` may import from components, lib, and config. Must not import from pages.
- `src/components/` may import from `src/lib/` and config. Must not import from pages or layouts.
- `src/lib/utils/` must be pure functions only — no imports from pages, layouts, components, or config.
- `site/config.ts` is read-only global config. It must never import from `src/`.

Path aliases: `@/*` → `src/*`, `@/config` → `site/config.ts`, `$lib` → `src/lib`.

### External API Calls

The project is statically generated — all data comes from Astro's `getCollection()` at build time.

- Runtime `fetch()` calls are not allowed in pages, layouts, or components.
- Build-time `fetch()` is only allowed in `src/pages/api/*.ts` endpoints or OG image generation (`src/pages/og/`).
- The only current exception: `src/pages/og/[slug].png.ts` fetches the Inter font from jsDelivr at build time for satori.

If a new external call is needed at runtime, it must go in a `src/pages/api/` endpoint — not inline in a page or component.

### Content Schema Changes

Content collection schemas are defined in `src/content.config.ts`.

- Any new frontmatter field added to a markdown file must be added to the schema first.
- Optional fields must have a `.optional()` or default value in the schema.
- Do not access frontmatter fields that aren't in the schema.

### Styles

- Global styles belong in `src/styles/global.css`.
- Component-scoped styles belong in Astro `<style>` blocks or Svelte `<style>` blocks within the component file.
- Do not create additional standalone `.css` files.
- Tailwind utility classes are preferred over new scoped styles wherever possible.

### File Size Limits

- Pages (`src/pages/`): flag if over 300 lines — look for component extraction opportunities.
- Components (`src/components/`): flag if over 200 lines — consider splitting responsibilities.
- `src/styles/global.css` is currently 491 lines; do not add to it without removing something.

---

## Enforcement

When writing or reviewing code:

1. Check each constraint above before creating or modifying a file in scope.
2. If a constraint would be violated: explain the rule, show the compliant alternative, and implement the compliant version.
3. If there's a legitimate exception: document it in a code comment (`// Architecture exception: [reason]`) and note it in DECISIONS.md.
