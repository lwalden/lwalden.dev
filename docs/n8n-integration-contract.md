# n8n Integration Contract — lwalden.dev RSS-to-Social Pipeline

> Hand this file to a Claude instance working in `n8n-automation-hub`. It contains everything needed to implement the RSS-to-social distribution workflow following the hub's established conventions.

---

## Context

The site [lwalden.dev](https://lwalden.dev) is a personal portfolio and blog. New blog posts are published by merging to `main`, which triggers a GitHub Actions deploy to Azure Static Web Apps. The site generates an RSS feed and per-post OG images at build time.

The goal is an n8n workflow that detects new posts via RSS and distributes them to LinkedIn, Medium, and X/Twitter — with AI-generated platform-specific copy.

---

## What lwalden.dev Provides

### RSS Feed

- **URL:** `https://lwalden.dev/rss.xml`
- **Format:** RSS 2.0 (valid XML)
- **Content:** All published blog posts, newest first
- **Fields per `<item>`:**

| Field | Example |
| ----- | ------- |
| `<title>` | `I Shipped 8 Versions of My AI Tool in 6 Weeks...` |
| `<link>` | `https://lwalden.dev/posts/aiagentminder-evolution-building-on-quicksand/` |
| `<guid isPermaLink="true">` | Same as `<link>` |
| `<description>` | 1-2 sentence summary from frontmatter |
| `<pubDate>` | RFC 2822 date, e.g. `Sat, 14 Mar 2026 00:00:00 GMT` |
| `<category>` | Multiple elements per post (e.g., `AIAgentMinder`, `Claude Code`, `building-in-public`) |

- **Note:** There is no `<content:encoded>` field. The feed contains descriptions only, not full HTML. For Medium cross-posting, the full post content would need to be fetched from the canonical URL.
- **Update frequency:** On deploy only (not on a timer). New posts appear in the feed within minutes of a merge to `main`.

### OG Images

- **Per-post:** `https://lwalden.dev/og/{slug}.png` — the slug is the last path segment of the post URL
  - Example: post at `/posts/aiagentminder-evolution-building-on-quicksand/` → OG image at `/og/aiagentminder-evolution-building-on-quicksand.png`
- **Fallback:** `https://lwalden.dev/og.png` — static branded image
- These are 1200x630 PNG images suitable for social card previews

### Author Info (for composing social posts)

- **Name:** Laurance Walden
- **Title:** Senior Software Engineer | .NET & Azure | AI & Agentic Systems
- **Site:** lwalden.dev
- **Brand voice:** Practitioner, not hype. Working code, honest trade-offs, enterprise context.

---

## What n8n-automation-hub Must Build

### Deliverables (3 files per hub convention)

| File | Path |
| ---- | ---- |
| Generator script | `scripts/gen-rss-to-social.js` |
| Workflow JSON | `workflows/rss-to-social.json` |
| Runbook | `docs/runbooks/rss-to-social.md` |

### Node ID Series

Use `00000000-0000-4000-8000-000000000701` through `...07XX` for this workflow (next available series after existing workflows).

---

## Workflow Design

### Trigger

**Schedule Trigger** polling every 15 minutes. RSS polling is simpler than a deploy webhook and doesn't require changes to the site's GitHub Actions.

### Node Flow

```text
[Schedule Trigger]
    → [Fetch RSS] (HTTP Request GET https://lwalden.dev/rss.xml)
    → [Parse & Deduplicate] (Code node)
    → [If: Has New Posts] (If node)
        ├─ TRUE → [Generate Social Copy] (Execute Workflow → call-claude)
        │         → [Post to LinkedIn] (HTTP Request)
        │         → [Post to X/Twitter] (HTTP Request)
        │         → [Log Success] (Code node)
        │         → [Notify Success] (HTTP Request → Resend email)
        ├─ FALSE → [No New Posts] (NoOp)
    (on any platform error)
        → [Format Error Email] (Code node)
        → [Send Error Notification] (HTTP Request → Resend email)
```

### Node Details

#### 1. Fetch RSS

- HTTP Request node, GET `https://lwalden.dev/rss.xml`
- Response format: text (not JSON — it's XML)
- No authentication required

#### 2. Parse & Deduplicate (Code Node)

- Parse XML to extract `<item>` elements (use regex or DOMParser — n8n Code nodes have no xml2js by default, but string parsing works fine for simple RSS)
- For each item, extract: `title`, `link` (canonical URL), `description`, `pubDate`, `categories` (array of strings from `<category>` elements)
- Derive `slug` from the link: last path segment before trailing slash
- Construct OG image URL: `https://lwalden.dev/og/${slug}.png`
- **Deduplication:** Use n8n's static data (`$getWorkflowStaticData('global')`) to store an array of previously processed `<link>` values. Only pass through items whose link is not in the stored set. After processing, add new links to the set.

#### 3. Generate Social Copy (Execute Workflow → call-claude)

Call the existing `call-claude` sub-workflow for each new post. Pass:

```json
{
  "systemPrompt": "You write social media posts for a senior software engineer's blog. Voice: practitioner, direct, no hype. Never use hashtags excessively — max 3 per platform. Never use emojis in LinkedIn posts.",
  "userMessage": "Write social posts for this blog article:\n\nTitle: {title}\nDescription: {description}\nURL: {link}\nCategories: {categories}\n\nGenerate:\n1. LINKEDIN: A professional post (2-3 paragraphs, include the URL, max 3 hashtags)\n2. TWITTER: A concise tweet (under 280 chars including URL)\n\nReturn as JSON: {\"linkedin\": \"...\", \"twitter\": \"...\"}",
  "model": "claude-sonnet-4-6",
  "maxTokens": 1024
}
```

Parse Claude's JSON response in a follow-up Code node.

#### 4. Post to LinkedIn

- HTTP Request node, POST to LinkedIn's UGC API
- Credential: `"LinkedIn OAuth"` (genericCredentialType, httpHeaderAuth — Bearer token)
- The LinkedIn API requires an OAuth access token with `w_member_social` scope
- Include the OG image URL in the share content so LinkedIn renders the card
- **Important:** LinkedIn API details (endpoint URL, payload format) depend on which API version is current. The implementor should check LinkedIn's current API docs.

#### 5. Post to X/Twitter

- HTTP Request node, POST to X API v2 tweet endpoint (`https://api.twitter.com/2/tweets`)
- Credential: `"X API Key"` (OAuth 1.0a — this may need a custom credential type rather than httpHeaderAuth, depending on n8n's X/Twitter node availability)
- Payload: `{ "text": "{twitter_copy}" }`
- The OG image will render automatically from the URL's meta tags — no image upload needed

#### 6. Medium Cross-Post (Optional / Phase 2)

- Not required for initial implementation
- Would POST to `https://api.medium.com/v1/users/{userId}/posts`
- **Critical:** Must set `canonicalUrl` to the lwalden.dev post URL so Google attributes SEO to the original
- Since the RSS feed only contains descriptions (not full HTML), the workflow would need to fetch and parse the full post from the canonical URL, or this can wait until `<content:encoded>` is added to the RSS feed

---

## Credentials Required

| Credential Name | Type | Used By | Notes |
| --------------- | ---- | ------- | ----- |
| `LinkedIn OAuth` | httpHeaderAuth (Bearer) | Post to LinkedIn | Requires OAuth app with `w_member_social` scope |
| `X API Key` | OAuth 1.0a | Post to X/Twitter | Requires X developer app with tweet write access |
| `Resend API Key` | httpHeaderAuth (Bearer) | Error/success notifications | Already exists in n8n credential store |

The `call-claude` sub-workflow handles its own credentials (Anthropic API Key). No additional Claude credentials needed.

---

## Email Notifications

Follow the hub's existing Resend pattern:

```javascript
// Success notification
return [{
  json: {
    from: "notifications@YOUR_DOMAIN.com",  // UPDATE: use your verified Resend domain
    to: "YOUR_EMAIL@example.com",           // UPDATE: your notification email
    subject: `[lwalden.dev] Published: ${title}`,
    html: `<h2>New post distributed</h2>
           <p><strong>${title}</strong></p>
           <p>LinkedIn: ✓ | Twitter: ✓</p>
           <p><a href="${link}">View post</a></p>`
  }
}];
```

```javascript
// Error notification
return [{
  json: {
    from: "notifications@YOUR_DOMAIN.com",  // UPDATE: use your verified Resend domain
    to: "YOUR_EMAIL@example.com",           // UPDATE: your notification email
    subject: `[lwalden.dev] Distribution failed: ${title}`,
    html: `<h2>Social distribution failed</h2>
           <p><strong>${title}</strong></p>
           <p>Platform: ${platform}</p>
           <p>Error: ${error}</p>`
  }
}];
```

---

## Deduplication Strategy

Use `$getWorkflowStaticData('global')` — this persists across executions in n8n's database:

```javascript
const staticData = $getWorkflowStaticData('global');
if (!staticData.processedLinks) {
  staticData.processedLinks = [];
}

const newPosts = parsedItems.filter(item => !staticData.processedLinks.includes(item.link));

// After successful distribution:
for (const post of newPosts) {
  staticData.processedLinks.push(post.link);
}

// Cap the list to prevent unbounded growth (keep last 100)
if (staticData.processedLinks.length > 100) {
  staticData.processedLinks = staticData.processedLinks.slice(-100);
}
```

---

## Testing Checklist

Before activating:

1. Run the generator: `node scripts/gen-rss-to-social.js > workflows/rss-to-social.json`
2. Import: `.\scripts\sync.ps1 import workflows/rss-to-social.json`
3. Test RSS fetch manually — confirm XML parses and items extract correctly
4. Test deduplication — run twice, confirm second run produces no new items
5. Test Claude copy generation — confirm JSON response parses cleanly
6. Test with a single platform first (LinkedIn) before enabling X/Twitter
7. Verify error notification fires when a platform API returns non-2xx

---

## Human Actions Required Before This Workflow Can Run

These are things the repo owner must do manually — the implementing Claude instance cannot do them:

1. **LinkedIn:** Create a LinkedIn OAuth app, obtain access token with `w_member_social` scope, add as n8n credential named `"LinkedIn OAuth"`
2. **X/Twitter:** Create an X developer app with tweet write access, add credentials to n8n
3. **Resend:** Verify a sending domain if not already done (existing `Resend API Key` credential should work)
4. **n8n credential setup:** After importing the workflow, manually map credential names to stored credentials in the n8n UI

---

## lwalden.dev-Side Work Needed

No changes to lwalden.dev are required for the initial implementation. The RSS feed, OG images, and sitemap are all live and functional.

**Future enhancement (optional):** If a deploy webhook is preferred over 15-minute polling, a GitHub Actions step can POST to an n8n webhook URL after successful deploy. This would require:

- Adding a webhook URL to GitHub Secrets for the lwalden.dev repo
- Adding a `curl` step to `.github/workflows/azure-static-web-apps.yml` after the deploy step

---

Created: 2026-03-18 | Updated: 2026-03-20
