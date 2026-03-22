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

I worked on too many different things yesterday and legit could not recall where I was at with my top priority project. So I ran `/aam-milestone` in Claude Code. A minute later I had a complete picture of where the project stood. It's all below. I do want to mention a couple things before I go forward: a) The MVP is live and working. b) I didn't write any code by hand, not one line.

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

## The numbers that matter

I spent far more hours building AIAgentMinder — the governance tool — than I did on the 11 sprints* of the product I built with it. That's not an exaggeration. The tool itself went through dozens of iterations, prompt rewrites, and architecture changes.

But here's the thing: during those 11 sprints, I didn't write code. I gave requirements. I debated implementation plans. I asked for features. I reviewed pull requests. I set up accounts, and helped wire up billing. The AI agent wrote the code. It did 80% of the configuration and secret handling. It did 90% of the End2End testing. And now there's a working MVP deployed and live.

## What the slash command actually tested

`/aam-milestone` is one of several slash commands (skills) that AIAgentMinder adds to Claude Code. It reads the project's roadmap, sprint file, decisions log, git history, and codebase structure — then produces a structured health assessment across six dimensions.

Running it on a real, in-flight project was the test I needed. Not "does it parse the files correctly" — I knew that. The test was: **does two-minutes with a command actually get me re-focused and up to date on a project at a critical stage that I've lost track of?**

It did. I went from "what was I working on again?" to "got it, lets finish this sprint, then I need to add a couple things to the backlog" in the time it took to read the output. Yes.

## Two observations

**The complexity flag was useful.** 84 C# source files exceeds the Phase 1 threshold of 50 that I set in the roadmap. The tool flagged it, checked the two largest files, confirmed they're under the 500-line limit, and concluded that no decomposition was needed — the project is functionally post-MVP in a hardening phase. That's the kind of judgment call I want from a governance tool: flag the number, but don't panic about it.

**Scope drift tracking earned its keep.** Eleven sprints is a lot of opportunities for feature creep. The tool checked every sprint's work against the roadmap and pre-launch audit findings. "None detected" is the best possible output there — and it's not because I was disciplined. It's because the tool caught drift attempts early in earlier sprints and I course-corrected before they landed.

---

\* An AIAgentMinder "sprint" borrows the name but not the ceremony. There's no standup, no 2 week timebox (sprint ends when all items are resovled), no retro meeting, no velocity chart. The agent proposes 4-6 work items from the roadmap with acceptance criteria. I review and approve the scope. Then the agent works each item, creates PRs, and asks me when it's stuck. I review and merge. When the sprint is done, the agent documents what shipped and updates the roadmap. The whole cycle is two roles — agent works, human decides — not a team process.

---

AIAgentMinder is open source and free.

[github.com/lwalden/AIAgentMinder](https://github.com/lwalden/AIAgentMinder)
