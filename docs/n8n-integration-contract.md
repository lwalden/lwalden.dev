# n8n Integration Contract — lwalden.dev RSS-to-Social Pipeline

> This contract defines what lwalden.dev provides and what n8n-automation-hub must implement to enable automated content distribution.

---

## lwalden.dev Provides

### RSS Feed

- **URL:** `https://lwalden.dev/rss.xml`
- **Format:** RSS 2.0 (valid XML)
- **Content:** All published blog posts, newest first
- **Fields per item:**
  - `<title>` — post title
  - `<link>` — canonical URL (e.g., `https://lwalden.dev/posts/my-post-slug/`)
  - `<description>` — post description from frontmatter
  - `<pubDate>` — RFC 2822 date
  - `<content:encoded>` — full HTML content of the post
  - `<author>` — `lwalden77@gmail.com (Laurance Walden)`
- **Update frequency:** On deploy (GitHub Actions push to main triggers Azure SWA build)

### OG Images

- **Per-post:** `https://lwalden.dev/og/{slug}.png` — dynamically generated at build time via satori
- **Fallback:** `https://lwalden.dev/og.png` — static branded image for non-post pages
- These can be used as social card images when posting to platforms

### Sitemap

- **URL:** `https://lwalden.dev/sitemap-index.xml`
- **Format:** Standard XML sitemap index

---

## n8n-automation-hub Must Implement

### Workflow: RSS-to-Social Distribution

**Trigger:** Poll `https://lwalden.dev/rss.xml` on a schedule (e.g., every 15 minutes) or via webhook on deploy

**For each new post detected:**

1. **LinkedIn post** — Extract title, description, and canonical URL from the RSS item. Compose a professional post with the link. Include the OG image URL for the social card preview.

2. **Medium cross-post** (optional) — Republish the `<content:encoded>` HTML to Medium via their API. Set the `canonicalUrl` field to the lwalden.dev URL so Google attributes SEO to the original.

3. **X/Twitter post** (optional) — Compose a concise tweet with title + link. The OG image will auto-preview from the URL's meta tags.

### Deduplication

- Track which RSS `<link>` values have already been processed to avoid duplicate posts
- Use n8n's built-in deduplication or a simple data store

### Error Handling

- If a social platform API fails, send a notification email rather than silently failing
- Log which platforms succeeded/failed per post

---

## Integration Points Summary

| Direction | What | How |
|-----------|------|-----|
| lwalden.dev → n8n | New blog post signal | RSS feed poll or deploy webhook |
| lwalden.dev → n8n | Post content | RSS `<content:encoded>` |
| lwalden.dev → n8n | Social card image | `https://lwalden.dev/og/{slug}.png` |
| n8n → LinkedIn | Professional post | LinkedIn API |
| n8n → Medium | Cross-post with canonical | Medium API |
| n8n → X/Twitter | Tweet with link | X API |

---

## lwalden.dev-Side Work Needed

- None currently. RSS feed, OG images, and sitemap are all live and functional.
- If a deploy webhook is preferred over RSS polling, a GitHub Actions step can POST to an n8n webhook URL after successful deploy. This would require adding a webhook URL (stored in GitHub Secrets) to the deploy workflow.

---

*Created: 2026-03-18*
