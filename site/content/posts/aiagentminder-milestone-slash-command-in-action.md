---
title: "11 'Sprints', Zero Lines of Human Written Code, and a Working MVP"
description: "I spent more hours building AIAgentMinder than I did on the 11 sprints where I used it to ship a real product. A quick look at what that means — and what a two-minute slash command told me about the state of my project."
pubDate: 2026-03-22
slug: "aiagentminder-milestone-slash-command-in-action"
tags:
  [
    "AIAgentMinder",
    "building-in-public",
    "Claude Code",
    "AI tooling",
    "developer-productivity",
  ]
draft: true
series:
  id: "aiagentminder"
  title: "Building AIAgentMinder"
  order: 5
---

I worked on too many different things yesterday and legit could not recall where I was at with my top priority project. So I ran `/aam-milestone` in Claude Code. A minute later I had a complete picture of where the project stood. Before looking at the output, two things to note: the MVP is fully live, and I didn't write a single line of this code by hand.

Here's Claude's response, verbatim:

```text
Milestone Health Check — S11 / Phase 1
Date: 2026-03-22

Phase Progress:    7/7 MVP features complete (100%)
  All roadmap MVP features shipped (scanner, remediation, dashboard,
  compliance docs, monitoring, billing, Formspree pipeline).
  S10 (pre-launch hardening) + S11 (post-launch polish) are refinement work.

Sprint S11:        5/7 issues done (71%)
  Done:    S11-001, S11-002, S11-004, S11-005 (PR #87), S11-006 (PR #88)
  Remaining: S11-003 (scan status polling/SignalR), S11-007 (Stripe webhook delivery)

Timeline:          On track — MVP feature-complete 5+ weeks ahead of target

Scope Drift:       None detected
  S10/S11 work is all from the pre-launch readiness audit findings
  or roadmap items. APP_BASE_URL refactor was infrastructure needed
  for local E2E testing — not feature creep.

Dependency count:  10 direct NuGet packages (no change from S10)

Complexity Budget: Watch
  C# source files: 84 (exceeds Phase 1 threshold of 50)
  Total files:     3,717 (includes static assets, migrations, configs)
  Largest files:
    Program.cs:              404 lines  (under 500)
    ScanBackgroundService.cs: 370 lines (under 500)
    EF Migration designers:  ~600 lines (auto-generated, expected)

Known Debt:        3 items — all from this week, all low-urgency

Summary: Project health is strong. All 7 MVP features shipped,
5 weeks ahead of target. Sprint S11 is 71% done with 2 issues
remaining. No scope drift, no surprise dependencies, no stale debt.
```

One minute read. Full picture. Back to work. I really like this feature.

Full disclosure: it was overly optimistic about the "5 weeks ahead of target" line. It referenced an important date in the marketplace for this product, but our actual go-live was about a week late due to my focus being spread too thin and missed early requirements. Claude wanted to go live well before I was comfortable taking someone's money — or spending my own on ads.

## What "zero code" actually means

I should be precise about this, because the claim sounds bigger than it is — and also smaller.

Across 11 sprints[^1], the agent produced 275 commits, 92 merged pull requests, and roughly 19,500 lines of code. I wrote none of it. Not the C#, not the Razor pages, not the EF migrations, not the JavaScript. What I did was give requirements, debate implementation plans, ask for features, verify test results, discover gaps through testing, and add new requirements when I found them. The agent wrote the code, created the PRs, and handled most of the configuration and secret wiring.

That doesn't mean I wasn't working. I spent the vast majority of my time initiating automated work, running end-to-end tests, asking questions, and prioritizing what came next. I stopped reading PR diffs pretty quickly and automated PR review to a separate Claude agent instead. The work shifted — from typing implementation code to directing, validating, and deciding.

I also spent far more hours building n8n workflows and AIAgentMinder itself — the governance tool — than I did on those 11 sprints. The tool went through dozens of iterations, prompt rewrites, and architecture changes. That's the part people don't see: the investment in the tooling that makes this workflow possible.

## What the slash command actually tested

`/aam-milestone` is one of several skills that AIAgentMinder adds to Claude Code. It reads the project's roadmap, sprint file, decisions log, git history, and codebase structure, then produces a structured health assessment.

The real test wasn't whether it could parse files — it was whether two minutes with a command could get me re-focused on a project I'd lost track of. It did. I went from "what was I working on again?" to "got it, let's finish this sprint" in the time it took to read the output.

## Two observations

**The complexity flag was useful.** 84 C# source files exceeds the Phase 1 threshold of 50 that I set in the roadmap. The tool flagged it, checked the two largest files, confirmed they're under the 500-line limit, and concluded that no decomposition was needed — the project is functionally post-MVP in a hardening phase. That's the kind of judgment call I want from a governance tool: flag the number, but don't panic about it.

**Scope drift tracking earned its keep.** Eleven sprints is a lot of opportunities for feature creep. The tool checked every sprint's work against the roadmap and pre-launch audit findings. "None detected" is the best possible output there — and it's not because I was disciplined. It's because the tool caught drift attempts early in earlier sprints and I course-corrected before they landed.

## Where it breaks

I don't want to leave the impression this was smooth. It wasn't.

The AI is optimistic by default. It will tell you the project is ahead of schedule while you're staring at a feature that doesn't actually work yet. It produces bugs — lots of them — the same way any developer does, except faster. Requirements I thought were obvious got missed entirely. Things I assumed would "just work" needed three rounds of back-and-forth to get right.

The difference isn't that AI development produces fewer defects. It's that with proper governance — a roadmap, sprint scope, acceptance criteria, automated quality gates — those defects get filtered out during development and validation, the same way they do in professional human development. Some inevitably make it through, just like they always have.

The real risk isn't buggy code. It's ungoverned code. "Vibe coding" without structure produces exactly the mess people warn about. But that's not an AI problem — it's a process problem. Ungoverned human development produces the same result; we just spent decades building processes to prevent it. AI development needs the same discipline. The tools are different, but the principle is identical: professional-grade software requires professional-grade governance, regardless of who — or what — is writing the code.

Software development is transforming. Love it or hate it, it's time to get on board — and to bring your engineering standards with you.

---

[^1]: An AIAgentMinder "sprint" borrows the name but not the ceremony. No standup, no two-week timebox, no retro meeting, no velocity chart. The agent proposes 4-6 work items from the roadmap with acceptance criteria. I review and approve the scope. The agent works each item, creates PRs, and asks me when it's stuck. I review and merge. When the sprint closes, the agent documents what shipped and updates the roadmap. Two roles — agent works, human decides.

---

AIAgentMinder is open source and free.

[github.com/lwalden/AIAgentMinder](https://github.com/lwalden/AIAgentMinder)
