---
title: "A One-Line CSS Fix, Three Layers of Governance, and Why It Matters"
description: "My AI agent tried to edit a CSS file and got blocked by its own governance rules. That's not overhead — that's the system working. Here's what real AI throughput looks like when you stop babysitting and start governing."
pubDate: 2026-03-27
slug: "ai-governance-real-throughput"
tags:
  [
    "AIAgentMinder",
    "AI governance",
    "Claude Code",
    "building-in-public",
    "developer-productivity",
  ]
draft: true
series:
  id: "aiagentminder"
  title: "Building AIAgentMinder"
  order: 6
---

A few days ago I noticed a minor UI defect in one of my projects. During a page transition, a skip-link target was receiving programmatic focus and an unintended CSS rule was painting a black border around the main content area. Tiny cosmetic issue. I logged it in the backlog and moved on.

Today I prompted Claude: "start a new sprint."

Claude read the roadmap, scanned the backlog, and proposed seven issues — including that CSS defect. It summarized each item with acceptance criteria, flagged risk levels, suggested implementation approaches with trade-offs where multiple paths existed, and proposed new tests: unit, integration, and end-to-end as appropriate. A few sentences of feedback on a different story, and I typed "approved."

Then I watched it work.

## The moment that matters

Claude got to the CSS defect. Here's what I watched happen in the transcript, trimmed for length but unedited:

```
● Read the CSS to find where to add the rule

● No CSS test infrastructure exists. For this fix, the test is a
  content assertion that the CSS rule exists.

● Write(tests\...\SkipLinkFocusTests.cs)
  Wrote 32 lines

● Bash(dotnet test --filter "SkipLinkFocusTests")
    Assert.Contains() Failure: Sub-string not found

● TDD RED confirmed — tabindex_minus1_focus_suppression fails,
  regression test passes. Now apply the fix:

● Update(src\...\wwwroot\css\app.css)
  BLOCKED: Cannot edit UI file 'app.css' without accessibility
  review. You MUST first delegate to accessibility-lead using the
  Agent tool. After the accessibility review completes, this file
  will be unblocked automatically.

● accessibility-lead(A11y review skip-link focus)
  Done (8 tool uses · 38.5k tokens · 1m 4s)

● Accessibility review approved. Good catch on the existing
  redundant rules at lines 336 and 517.

● Update(app.css) — Added: [tabindex="-1"]:focus { outline: none; }
● Update(app.css) — Removed: .login-main:focus { outline: none; }
● Update(app.css) — Removed: .pricing-main:focus { outline: none; }

● Bash(dotnet test --filter "SkipLinkFocusTests")
  Passed! - Failed: 0, Passed: 2, Skipped: 0

● Bash(dotnet test)
  Passed! - Failed: 0, Passed: 143, Skipped: 0
```

Standard TDD - the kind you read about but never had the time or patience to actually, you know...do - read the CSS, write a failing test, confirm it fails. Then apply the fix — and get blocked.

A hook — code that runs _before_ Claude's tool calls execute — detected that this was a UI file in a project where accessibility is a high-priority concern. It blocked the edit and required an accessibility review before the change could proceed.

Claude didn't ask me what to do. It spawned an accessibility specialist subagent, passed it the proposed change, waited for the review, received approval with a note about two redundant rules elsewhere in the stylesheet, then applied all three changes in a single pass — the fix plus the cleanup. Tests went green. Full suite passed. 143 of 143.

One line of CSS. Three layers of governance. Zero human intervention required.

## Why this isn't overhead

If you watched this from the outside, you might think: that's a lot of machinery for `outline: none`. And you'd be right — for this specific change, the accessibility review was overkill. The fix was trivially safe.

But the governance system doesn't know that in advance. It knows that this project has declared accessibility as a critical concern, that CSS changes can introduce WCAG violations, and that a high-risk change needs extra scrutiny before it lands in production. It applied that scrutiny automatically, found the change was clean (and actually improved the codebase by catching redundant rules), and moved on.

The same flow that handled this cosmetic fix would catch a contrast ratio violation, a missing focus indicator, or a broken screen reader announcement. It would catch it _during development_, not in a PR review after the code is written, not in production after a user reports it, and not after a compliance audit flags it months later.

That's the difference between governance and babysitting. Babysitting is me watching Claude edit CSS files. Governance is the system watching for me.

## The real throughput problem

The AI coding conversation has been stuck on a false binary: either you "vibe code" and accept the quality risk, or you babysit every change and lose the speed advantage.

The numbers back this up. A [2025 survey by Qodo](https://www.qodo.ai/reports/state-of-ai-code-quality/) found that 82% of developers use AI coding assistants daily (I would hazard that number is over 90% now) — but 65% say the AI misses relevant context during critical tasks, and a quarter estimate one in five suggestions contain errors. [CodeRabbit's analysis](https://www.coderabbit.ai/blog/2025-was-the-year-of-ai-speed-2026-will-be-the-year-of-ai-quality) found that AI-assisted code generates 1.7x more logical bugs than traditional development. Harvard Business Review coined "[AI brain fry](https://hbr.org/2026/03/when-using-ai-leads-to-brain-fry)" to describe the mental fatigue from intensive AI oversight.

[Stack Overflow's 2025 developer survey](https://stackoverflow.blog/2025/12/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/) captured the paradox perfectly: favorable views of AI tools dropped from 70%+ in 2023 to around 60% — the more people use AI, the less they like it. Not because the tools got worse, but because the overhead of verifying AI output started eating the productivity gains.

The solution isn't less AI. It's better governance around it.

## What "governance" actually means here

Let me be concrete. The sprint that started with "start a new sprint" and "approved" involved:

1. **Scope enforcement.** Claude checked every proposed item against the project roadmap before including it. Items not in scope get flagged before any code is written.

2. **Specification before code.** Each item got a detailed implementation spec — approach, files to modify, test plan, risk assessment — before Claude wrote a single line. I reviewed the plan, not the code.

3. **TDD by default.** Failing test first, minimal implementation, refactor after green. Not optional — it's baked into the workflow rules.

4. **Risk-aware quality gates.** That CSS fix was tagged as touching a high-risk area (accessibility). The governance system applied additional scrutiny — an automated accessibility review — before allowing the change. Lower-risk items pass through lighter gates.

5. **Automated PR pipeline.** After each item passes tests and review, the agent creates a PR, runs its own code review with specialist subagents (security, performance, API design), fixes any issues found, and merges — all without my input. If the AI hits a true blocker, or the change involves an area identified as needing human review in step 4 (in this repo any changes to 'billing' gets this treatment), then and only then am I alerted and progress halts.

None of this is novel engineering practice. It's the same discipline professional teams apply to human development: plan before you build, test before you ship, review before you merge, enforce standards consistently. The difference is that with AI agents, you can encode this discipline into rules and hooks that execute automatically, at machine speed, without the developer needing to be in the loop for every decision.

## How others are approaching this

I'm not the only one thinking about this problem. The ecosystem is splitting into layers, and it's worth understanding where different tools sit.

### The foundation: CLAUDE.md and AGENTS.md

Anthropic's [CLAUDE.md](https://docs.anthropic.com/en/docs/claude-code/claude-md) and the cross-tool [AGENTS.md](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) standard (now under the Linux Foundation alongside MCP) are project-level instruction files. They tell the agent about your stack, conventions, and constraints.

They're necessary — but as one developer [put it](https://medium.com/codetodeploy/your-claude-md-is-a-suggestion-hooks-make-it-law-0124c5783b68), "Your CLAUDE.md is a suggestion. Hooks make it law." Prompt-based compliance runs around 60-70%. Good enough for conventions, not enough for critical constraints. That's why the CSS edit was blocked by a _hook_ — code that executes before the tool call — not by a suggestion in a markdown file.

### Review-time tools: GitHub Copilot and CodeRabbit

[GitHub Copilot's code review](https://github.blog/ai-and-ml/github-copilot/60-million-copilot-code-reviews-and-counting/) hit 60 million reviews by March 2026 and recently moved to an agentic architecture that gathers full repository context before commenting. [CodeRabbit](https://www.coderabbit.ai/) does similar AI-powered PR review with natural-language custom rules.

Both are good at catching issues at PR time. But that's the key limitation — they're reactive. By the time a PR exists, the code is written, the developer has moved on to the next task, and fixing issues means context-switching back. Governance during development catches problems before they become PRs.

### Orchestration: Conductor

[Conductor](https://www.conductor.build/) (from Melty Labs, YC S24) runs multiple AI agents simultaneously on separate git branches. It's an orchestration layer — you can assign parallel tasks and review diffs.

It solves the "one agent at a time" bottleneck but doesn't govern what those agents produce. No quality gates, no scope enforcement, no sprint structure. You're still reviewing every diff yourself.

### Project management: CCPM

[CCPM](https://github.com/automazeio/ccpm) (Claude Code Project Manager) adds traceability from product requirements to GitHub Issues to code. Every line traces back to a specification. It works with multiple AI tools through the Agent Skills standard.

Strong on the planning-to-execution pipeline, but it doesn't enforce quality during development — no pre-PR gates, no self-review, no scope guardian checking changes against the roadmap in real time.

### Spec governance: GitHub Spec-Kit

[GitHub Spec-Kit](https://github.com/github/spec-kit) introduces "constitutional governance" — a `constitution.md` that serves as the project's supreme guiding document. Every AI-generated plan must pass a constitutional check.

Focused and useful for spec compliance, but it's narrowly scoped. No sprint management, no parallel execution, no enforcement mechanism beyond the constitutional prompt check.

### Infrastructure governance: Coder

[Coder's AI Governance add-on](https://coder.com/docs/ai-coder/ai-governance) operates at the infrastructure layer — centralizing authentication, restricting what domains agents can reach, capturing token spend, and enforcing process-level policies.

Important for enterprise security, but it governs the _environment_, not the _development process_. It won't prevent scope drift or catch a missing accessibility check.

### Where AIAgentMinder fits

[AIAgentMinder](https://github.com/lwalden/AIAgentMinder) (now at v3.1) operates at the layer stacked above all of these — opinionated _development workflow_ governance. A state machine sprint workflow with mandatory quality at every step. Scope enforcement against a living roadmap. Risk-tagged quality gates. TDD enforcement. Approach-first protocol for architecture changes. Debug checkpoints to prevent AI spiraling. Correction capture to detect repeated mistakes. Automated PR pipelines with specialist code review. Autonomous context cycling that detects degradation in long sessions and restarts fresh without human intervention.

It's designed for solo developers and small teams. It's opinionated — which means it won't fit every workflow. Enterprise teams need identity management, per-team cost tracking, and multi-repo coordination that AIAgentMinder doesn't attempt. Conductor's parallel execution model serves a different use case. CCPM's GitHub Issues integration serves teams that need shared visibility.

The honest comparison: I'm clearly biased — AIAgentMinder is my project and I'm pretty much its only user. But it does what it's supposed to do quite well for me: the most comprehensive _governance_ solution I've found for single-agent Claude Code workflows. If you want a lighter touch — spec compliance without sprint structure — Spec-Kit is simpler. If you want infrastructure guardrails for a team — Coder. If you want PR-time review without development-time governance — Copilot or CodeRabbit.

No single tool covers the full stack. The question is which layers matter most for your situation.

## The input problem

Here's what I keep coming back to: a few sentences in a CLAUDE.md file produces vibe-coded results. Not because the AI is bad, but because you haven't told it enough to be good.

But I don't have time to write two pages of context and instructions for every task I want Claude to handle. Nobody does. That's why the governance needs to be systematic — encoded once in rules, hooks, and workflows, then applied automatically to every task.

The sprint I started today required exactly one word of input from me after the initial approval: nothing.[^1] Claude proposed the work, I approved it, and the governance system handled the rest — scope checking, test-first development, risk assessment, accessibility review, code review, PR creation, merge. My job was to review the sprint proposal and say yes.

That's the throughput unlock. Not "AI writes code faster" — any demo can show that. The unlock is: AI writes code faster _and_ a governance system ensures the output meets professional standards _without_ requiring the developer to verify every change manually. At the end of a sprint, I can stand behind the results — not because I read every line, but because I know every line went through the same gates I'd apply to human-written code.

That's also why I run sprints at all. The AI could work stories in series or in parallel without end. But I need structure and digestible chunks that are human-sized. I'm still the final gate — I serve as QA and product owner at every sprint boundary. The output is not bug-free. It never was with human teams either. But I'm getting real productivity gains: faster defects, yes, but also faster fixes. Reduce friction, increase speed, apply consistent discipline.[^2]

The alternative is reading every line yourself. The sheer volume creates its own problem: developer burnout from trying to verify what the machine wrote, while the machine keeps writing more.

## The uncomfortable truth

The real risk isn't AI-written code. It's ungoverned code — and that was true before AI entered the picture.

The developers shipping the best results with AI tools aren't the ones with the cleverest prompts. They're the ones who brought their engineering discipline with them. TDD, scope management, decision records, quality gates — these practices didn't become obsolete because an AI is writing the code. They became more important, because the volume is higher and the defects arrive faster.

A few sentences of input produces a few sentences of quality. If you want professional-grade output, invest in professional-grade governance. Not a longer prompt — a system.

---

[^1]: This isn't always the case. Complex architectural decisions, ambiguous requirements, and genuinely novel problems still need human judgment. The governance system handles the routine autonomously so human attention is reserved for the decisions that actually need it. I can and do interrupt frequently — steering when it's wasting time or heading the wrong direction. I even have a command for it: `/aam-revise`.

[^2]: If defects make it to prod, that's on me, not the AI. I'm the one who approved the sprint, reviewed the specs, and signed off at the boundary. The governance system raises the floor; it doesn't remove accountability.

---

_AIAgentMinder is open source under MIT. If you're using Claude Code for projects that span more than a few sessions, it might be worth a look._

[github.com/lwalden/AIAgentMinder](https://github.com/lwalden/AIAgentMinder)
