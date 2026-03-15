---
title: "I Shipped Eight Versions of My AI Tool in Six Weeks. Half of Them Deleted the Previous Version's Best Feature."
description: "AIAgentMinder started as a memory system for Claude Code, with some up front planing, and some guardrails for Claude. Then Anthropic shipped native memory. Then they shipped rules. Then they shipped plan mode. Here's what survived, what didn't, and what I learned about building tools on a platform that moves faster than you do."
pubDate: 2026-03-14
slug: "aiagentminder-evolution-building-on-quicksand"
tags: ["AIAgentMinder", "Claude Code", "AI tooling", "building-in-public", "context engineering", "AI governance"]
draft: false
series:
  id: "aiagentminder-codeveloping"
  order: 3
---

I've been shipping a new version of [AIAgentMinder](https://github.com/lwalden/AIAgentMinder) almost every week since early February. Eight versions. Each one built on what came before — except for the parts where it ripped out what came before.

That sounds chaotic. Which is the point.

AIAgentMinder is a project governance framework for Claude Code. Plain markdown files and slash commands, no CLI, no database. It adds structured planning, sprint workflows, decision tracking, and scope enforcement to single-agent Claude sessions — the kind of structure you need when a project spans weeks of AI-assisted development, not a single afternoon.

The problem is that every week, either Anthropic ships something new, or the open source community does, and the ground shifts. Features I built become redundant. Naming conventions collide. Entire categories of tooling appear overnight. So every week I ask the same question: *does this feature still earn its place, or is the platform doing it better now?*

Here's how that played out across eight versions.

## Where it started (v0.5)

The original pitch was session continuity. Claude Code was essentially stateless between sessions — you'd close the window, open it again, and Claude had no idea what you were working on. My solution was a set of git-tracked markdown files and Node.js hooks that injected context at every session start.

The architecture was straightforward: four hooks fired at different points in the session lifecycle. A SessionStart hook read `PROGRESS.md`, `DECISIONS.md`, sprint state, and guidance files, then printed all of it into Claude's context. A Stop hook auto-committed state files. A PreCompact hook saved progress before context compression. A timestamp hook updated `PROGRESS.md` on every session end.

It worked. But it also shipped with a 132-line permissions file that pre-approved `curl:*`, `docker:*`, every cloud CLI, and system package managers. A 239-line kitchen-sink `.gitignore` covering Python, Rust, Java, Ruby, Go, Terraform, and frameworks I'd never touch. Placeholder CI/CD workflows that would run, do nothing, and report "passed." An `.env.example` with `APP_NAME=my-project`.

I asked Claude Opus 4.6 for an [exhaustive review](/posts/aiagentminder-opus-review-part1). The response was blunt: the permissions file was "counterproductive" and the scaffolding was "dead weight." Fair enough. The core — the four-file context system, the `/plan` command, the lifecycle hooks — was solid. Everything else was scope creep from trying to be a full DevOps scaffolder instead of a governance tool.

## The first pivot: native memory eats 80% of the project (v0.7)

Then Anthropic shipped native memory.

Auto-memory landed in February — Claude writing its own persistent notes to `MEMORY.md`. Session Memory followed, with structured summaries extracted in the background and injected at session start. The `.claude/rules/` directory appeared with glob-scoped file targeting. The `@import` syntax for `CLAUDE.md`. The `--continue` flag.

Each feature individually nibbled at what AIAgentMinder did. Together, they converged on the same problem I'd solved with handcrafted hooks — but natively, with lower context cost, and zero maintenance.

In just weeks **80% of my tool had been absorbed by the platform.** My proudest feature — the SessionStart injection hook — was identified as the single most damaging thing in the project. At every session start, Claude Code already loads the CLAUDE.md hierarchy, all rules files, auto-memory, and Session Memory summaries. My hook was piling more context on top of all that. Every redundant token is a token not available for actual work.

v0.7 went from four hook scripts to two. Three hooks deleted. The entire Session Protocol section stripped from CLAUDE.md. `PROGRESS.md` demoted from auto-managed artifact to optional human document.

I wrote about this at the time — [the strange gratification of deletion](/posts/aiagentminder-v070-native-memory-migration). The remaining 20% — structured planning, sprint workflows, development discipline rules — was the part that actually *extended* Claude's capabilities rather than patching around limitations.

The settings.json after the surgery:

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "node .claude/hooks/session-end-commit.js",
        "timeout": 30
      }]
    }],
    "SessionStart": [{
      "matcher": "compact",
      "hooks": [{
        "type": "command",
        "command": "node .claude/hooks/compact-reorient.js",
        "timeout": 10
      }]
    }]
  }
}
```

Two hooks. One auto-commits on feature branches at session end. The other re-orients Claude after context compaction — not at every session start, just when the context window gets compressed and Claude might lose its place in a sprint.

## Building what the platform won't ship (v0.8–v0.9)

With the memory layer gone, the question became: what governance do solo developers actually need that Claude Code doesn't provide?

**v0.8** introduced the scope guardian — an always-active rule that checks proposed work against the roadmap before Claude starts writing code:

```markdown
## Scope Guardian

Before implementing any feature or significant change:

1. Read `docs/strategy-roadmap.md`
2. Check the proposed work against MVP Features:
   - **In MVP Features** → proceed
   - **In Out of Scope** → stop, notify user
   - **Not listed** → ask user for placement before proceeding
3. During sprint execution: flag any work not in the current sprint's
   issue list as a scope addition
```

Simple. Passive. Fires every session because it's in `.claude/rules/`. I'd been watching Claude cheerfully build features that weren't on the roadmap — nice-to-haves that burned tokens and pushed real priorities down the queue. The scope guardian catches that before the first line of code.

Same version introduced **quality gates** — tiered pre-PR checks that match the project's declared quality tier:

- **Lightweight:** Build passes.
- **Standard:** Tests exist and pass. No debug statements left behind.
- **Rigorous:** Standard plus coverage delta, linter clean, no `any` types.
- **Comprehensive:** Rigorous plus secret scan, error handling audit, security review.

The idea is that a weekend prototype doesn't need the same pre-PR discipline as a production API. You declare a tier in your roadmap, and `/aam-quality-gate` enforces that tier — nothing more, nothing less.

**v0.8 also brought the decision forcing function.** During the `/aam-brief` planning interview, after gathering your tech stack choices, Claude now surfaces hard-to-reverse decisions before they get locked in:

> **JWT for auth** → no server-side session revocation without a token blacklist. If that matters, consider opaque tokens.
>
> **PostgreSQL** → excellent for relational data, but you'll need a search strategy (pg_trgm, full-text, or Elasticsearch) once content grows.
>
> **NoSQL (MongoDB)** → flexible schema, but joins require application-level logic. If cross-collection queries are common, reconsider.

These get logged to `DECISIONS.md` with alternatives and reversal cost. The goal is that architectural choices surface *during planning*, not three sprints in when reversing them is expensive.

**v0.9** added the heavier governance tools: `/aam-self-review` runs specialist subagents (security, performance, API design) against your diff before PR creation. `/aam-milestone` assesses project health across five dimensions — phase progress, timeline, scope drift, dependency growth, and a complexity budget tracking file count and largest files. `/aam-retrospective` generates sprint metrics with adaptive sizing: if your first sprint completed 5 of 5 issues, it suggests planning 6-7 next time.

These are the features that justify the project's existence. No generic AI coding assistant ships opinionated sprint governance, because it's not one-size-fits-all. That's exactly the space I want to occupy.

## The naming collision (v1.0–v1.1)

v1.0 added two rules that came from real pain:

**`approach-first.md`** — Before executing architecture changes, multi-file refactors, or new dependencies, Claude states its intended approach and waits:

```
Approach: Add a refresh token endpoint by creating
src/routes/auth/refresh.ts, updating src/middleware/auth.ts
to validate refresh tokens, and adding a refresh_tokens table
migration. Assuming the existing JWT secret is reused for
refresh tokens — let me know if that should be separate.
```

This prevents the "Claude just rewrote six files using an approach I wouldn't have chosen" problem. Two sentences of alignment before execution saves 20 minutes of undoing.

**`debug-checkpoint.md`** — After three consecutive failed attempts at the same error, Claude stops, summarizes what's been tried, states its current hypothesis, and asks for help. Before this rule, Claude would sometimes enter a debugging spiral — trying increasingly creative (and wrong) fixes in a loop, burning tokens and making a mess. Three strikes and you ask the human.

Then came the naming problem. My `/plan` command collided with Claude Code's built-in `/plan`. My `/checkpoint` competed with native concepts. As the plugin ecosystem grew, unnamespaced commands were a liability.

v1.1 renamed everything with an `aam-` prefix. `/plan` became `/aam-brief`. `/handoff` became `/aam-handoff`. Breaking change for early users, but necessary. Lesson learned: If you're building a plugin for someone else's platform, namespace your commands.

## Plans that change (v1.2)

The latest version — shipped today — adds `/aam-revise`. The motivation: `docs/strategy-roadmap.md` was created once during `/aam-brief` and then treated as a static artifact. But real projects pivot. You do research and discover a competitor already solved a problem you were going to build. A user need shifts. A dependency doesn't work the way you expected.

`/aam-revise` handles five scenarios: fold in research findings, add a requirement, change a requirement, drop a requirement, reprioritize between phases. Each action updates the roadmap directly and logs the decision in `DECISIONS.md` with rationale.

The design philosophy: **a roadmap that can't change is dead weight.** The governance system must support living plans, not just initial plans.

## What's on the roadmap now

AIAgentMinder is stable at v1.2. The framework covers planning (brief, revise), execution (sprint workflows, scope enforcement, approach-first), quality (quality gates, self-review), and visibility (milestone health checks, retrospectives, known debt tracking).

What's next:

**SDD integration.** Spec-Driven Development tools — Spec-Kit, cc-sdd, GSD — are the latest thing. And  get it. They answer "how do I plan this feature?" AIAgentMinder answers "how do I govern this project?" The two are complementary. The plan is to generate a `constitution.md` from `/aam-brief` output that SDD tools can consume, so project-level governance feeds into feature-level specs.

**Evaluating the last hook.** `compact-reorient.js` is the only hook left. As Claude Code's native Session Memory improves, the post-compaction sprint reorientation may become redundant. If removing it doesn't degrade sprint continuity, the entire Node.js dependency goes away. The project would be pure markdown.

**Distribution polish.** `/aam-update` dry-run mode. Plugin marketplace improvements. HTTP hook support once Claude Code ships it.

## The scorecard

Here's what didn't survive and why:

| Feature | Lifespan | Killed by |
|---------|----------|-----------|
| SessionStart injection hook | v0.5–v0.7 | Claude Code's native Session Memory + rules loading |
| PROGRESS.md auto-management | v0.5–v1.0 | Session Memory + `--continue` |
| `.claude/guidance/` directory | v0.6–v0.7 | Native `.claude/rules/` directory |
| PreCompact state save | v0.5–v0.7 | Compact-matcher SessionStart pattern |
| Auto-commit Stop hook | v0.5–v0.8 | `git-workflow.md` rule (commits should be intentional) |
| 132-line permissions file | v0.5–v0.5.3 | Claude Opus 4.6's code review |
| Agent-agnostic mode | Experimented, never shipped | Feature parity across agents is an illusion |
| `/plan` command name | v0.5–v1.1 | Claude Code's built-in `/plan` |
| CI/CD scaffolding | v0.5–v0.5.3 | Claude generates better workflows from scratch |

And what earned its place:

| Feature | Since | Why it persists |
|---------|-------|----------------|
| Structured planning interview (`/aam-brief`) | v0.5 | Nothing native does this — takes you from rough idea to product brief with MVP decomposition |
| Decision logging (`DECISIONS.md`) | v0.5 | Prevents re-debating resolved architectural choices |
| Scope enforcement (scope guardian + `/aam-scope-check`) | v0.8 | Claude will happily build things that aren't on the roadmap |
| Sprint workflows with approval gates | v0.6 | Opinionated process the platform won't ship |
| Quality gates (tiered pre-PR checks) | v0.8 | Adjustable rigor per project |
| Debug checkpoint rule | v1.0 | Three strikes, then ask the human |
| Approach-first rule | v1.0 | Two sentences of alignment saves 20 minutes of undoing |
| Living plan revision (`/aam-revise`) | v1.2 | Plans change; governance must support that |

## What I'd tell someone building tools in this space

**Follow the platform, don't fight it.** My hooks were great - they solved a big problem - so big that Anthropic had to fix it too. Every hook I wrote that duplicated a native feature eventually got deleted. The ones that survived extend capabilities the platform doesn't have — opinionated workflows, domain-specific governance, process structure. Build those. Let the platform own the plumbing.

**Design for your own obsolescence.** I built AIAgentMinder because Claude Code had gaps. Some of those gaps closed. That's not a failure — that's the ecosystem maturing. If you're emotionally attached to features that the platform now does better, you'll end up maintaining dead weight instead of building what's actually useful.

**Namespace from day one.** I didn't, and it cost me a breaking rename at v1.1. If you're building commands for someone else's platform, prefix them.

**Rules beat hooks for behavioral governance.** A markdown file in `.claude/rules/` loads every session, costs minimal tokens, and requires no runtime. A hook needs Node.js, a settings.json entry, and debugging when it doesn't fire. Four of my most effective governance features — scope guardian, approach-first, debug checkpoint, git workflow — are plain markdown rules. Zero infrastructure.

**Your target user isn't everyone.** AIAgentMinder is for solo developers and small teams building projects over weeks with Claude Code. Not for multi-agent orchestration teams. Not for people who need 50 open issues on a kanban board. Not for a project that fits in one session. Being clear about who this isn't for has been more useful than defining who it's for.

---

*AIAgentMinder is open source under MIT. If you use Claude Code for projects that span more than a few sessions, check it out at [github.com/lwalden/AIAgentMinder](https://github.com/lwalden/AIAgentMinder).*
