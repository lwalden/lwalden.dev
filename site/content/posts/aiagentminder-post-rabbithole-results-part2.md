---
title: "Co-developing AIAgentMinder with Claude, Part 2: Post-Rabbithole Results"
description: "Why I ditched an agent-agnostic approach and doubled down on Claude Code for true session continuity and cross-platform hooks."
pubDate: 2026-02-20
slug: "aiagentminder-post-rabbithole-results-part2"
tags: ["Claude Code", "agentic AI", "context engineering", "AI governance", "AI engineering", "AIAgentMinder", "building-in-public"]
draft: false
canonicalURL: "https://medium.com/@laurancewalden/co-developing-aiagentminder-with-claude-part-2-post-rabbithole-results-52cba66030a9"
series:
  id: "aiagentminder-codeveloping"
  order: 2
---

If you don't recall — in [Part 1](/posts/aiagentminder-opus-review-part1) we prompted Claude for an exhaustive review of AIAgentMinder, which was originally written by Claude (at my behest). The naive assumption was:

1. I'd get advice. **I did.**
2. I'd ask Claude to refactor. **It did.**
3. And we'd be done. **Not so much**.

I just couldn't help myself. After Claude finished the refactor I wondered… *What would ChatGPT think of this?* So I gave it the same prompt. And got all new suggestions, including a MUCH more focused vision statement.

Before long, I'd gone through multiple review/refactor/repeat cycles, swapping AI reviewers — and occasionally coders — in-between cycles.

It was a wild ride. **I briefly experimented with making the tool agent-agnostic** — allowing seamless swaps between Claude, ChatGPT, and CoPilot. **Then, I killed the feature entirely.**

Why? **Feature parity is an illusion.** Claude uses a JSON config for hooks; CoPilot relies on VS Code settings. Codex has no hooks at all. To maintain the deep session continuity I wanted, I realized I'd be building three different tools under one hood. I chose to double down on Claude for the deep integration, while still using the others for "drive-by" code reviews.

**Focusing purely on Claude allowed me to lock in some major architectural wins and prioritize stability over "cool" features:**

- **Cross-Platform Parity:** I replaced the original Bash hooks with Node.js. Now the tool actually runs on Windows, macOS, and Linux without a fight.
- **Branch Safety:** I rewrote the auto-commit logic to skip protected branches (`main`/`master`) and only stage tracked files. An AI hallucinating a `git add -A` on a dirty working directory is a nightmare scenario I wanted to avoid.
- **Aggressive Trimming:** I cut the `CLAUDE.md` and `DECISIONS.md` templates by nearly 70%. Keep context lean, always.
- **True Session Continuity:** I'm now using those Node-based hooks to automate context loading at session start, and automatically committing state (`PROGRESS.md` and `DECISIONS.md`) to non-protected branches on session end.

**This session continuity feature alone stopped me from going agent-agnostic.** Extraneous slash commands were removed, and the good ones — like `/plan` and `/handoff` — were made significantly better. Even the README was transformed into a concise, problem-solution document.

It's hardly worth mentioning at the speed these tools are evolving, but as of today, ChatGPT 5.3's extra thinking mode was the best at understanding the overall intent of a project and proactively identifying gaps and opportunities. Claude Opus 4.6 for planning with Sonnet 4.6 for execution was my best all-around pick — if I could only use one Agent, I'd use Claude. Gemini 3.0 (3.1 came out just after this) didn't win any special awards in my book, but still provided useful feedback the others didn't — earning its place in the rotation.

*If you want to see how the hooks and markdown state files actually work together, you can check out the [AIAgentMinder repo on GitHub](https://github.com/lwalden/AIAgentMinder).*
