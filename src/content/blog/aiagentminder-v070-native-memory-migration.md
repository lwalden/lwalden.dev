---
title: "I Just Deleted Most of My Project's Best Feature (and I'm Weirdly Happy About It)"
description: "AIAgentMinder v0.7.0 removes three of four hooks after Claude Code native memory absorbed 80% of the project value. What that means for tool builders designing around AI coding assistants."
pubDate: 2026-02-28
tags: ["AIAgentMinder", "Claude Code", "AI tooling", "building-in-public"]
draft: false
---

I've been building [AIAgentMinder](https://github.com/lwalden/AIAgentMinder) for a few months now — an open source project governance and planning layer for Claude Code. The core pitch was simple: Claude Code is great within a single session, but real projects span dozens of sessions, and between them Claude forgets everything. My tool solved that with git-tracked markdown files, lifecycle hooks that auto-inject context, and structured slash commands for planning and handoff.

The centerpiece was the SessionStart hook. Every time you opened Claude Code, it would fire a Node.js script that read PROGRESS.md, DECISIONS.md, any active sprint state, guidance files from `.claude/guidance/`, and printed all of it into Claude's context window. Claude would boot up already knowing what you were working on, what decisions had been made, and what to do next. I was genuinely proud of it. It felt like giving Claude a memory.

Today I shipped v0.7.0, and that hook is gone. Three of my four hooks are gone. And honestly? It felt great.

## The writing on the wall

For the last couple of weeks I've been watching Anthropic's progress with Claude Code's native memory features. Auto-memory landed in early February — Claude writing its own persistent notes to MEMORY.md. Then Session Memory started rolling out, where Claude continuously extracts structured summaries in the background and injects them when you start new sessions. The `.claude/rules/` directory showed up with glob-scoped file targeting. The `@import` syntax for CLAUDE.md. The `--continue` and `--resume` flags for picking up past sessions.

Each of these individually nibbled at pieces of what AIAgentMinder did. Together, they were converging on the same problem I'd been solving with handcrafted hooks and markdown files — but natively, with lower context cost, and with zero maintenance overhead.

I'd been checking in periodically, kind of half-hoping and half-dreading the moment when Claude itself would tell me: your memory features are now redundant. Actually, some of them are making things worse.

Today was that day.

## The diagnosis

I asked Claude to analyze AIAgentMinder against the current state of Claude Code's native memory system. What came back was organized into three categories: duplicate effort, counterproductive features, and enhancement opportunities.

The duplicate effort list was long. PROGRESS.md's session state tracking? Session Memory does that automatically now. DECISIONS.md injection? Auto-memory captures architectural decisions on its own. The `.claude/guidance/` directory I'd built for development discipline instructions? That's just a custom reimplementation of `.claude/rules/`, except mine doesn't get glob-scoped file targeting. The `/handoff` command that rewrites PROGRESS.md as a briefing for the next session? Session Memory plus `claude --continue` handles that without you doing anything.

But the counterproductive section is what really got my attention. The SessionStart hook — my proudest feature — was identified as the single most damaging thing in the project. Here's the thing: at every session start, Claude Code already loads a whole stack of context natively. The CLAUDE.md hierarchy (enterprise, user, project, local levels). All `.claude/rules/` files. The first 200 lines of auto-memory. Session Memory summaries from past work. My hook was then piling on PROGRESS.md, DECISIONS.md, SPRINT.md, and all guidance files *on top of all that*. Every token spent on redundant injection is a token not available for actual code and conversation.

The PreCompact hook was fighting the platform's own recommended pattern too. I was saving state *before* compaction, but the official approach is a SessionStart hook with a `"compact"` matcher that fires *after* compaction and injects a concise summary into the fresh context. Mine was doing an unnecessary round-trip through a file.

Here's the passage from the analysis that made me sit up:

> AIAgentMinder was built to solve a real problem — Claude Code's memory was once minimal and sessions were essentially stateless. That problem is now largely solved at the platform level. The native memory system covers roughly 80% of what AIAgentMinder does, with better integration, lower context cost, and zero maintenance overhead. The remaining 20% — structured sprint planning, the `/plan` interview workflow, and development-discipline enforcement — represents AIAgentMinder's genuine value-add.

80/20. Eighty percent of my tool had been absorbed by the platform. But the twenty percent that remained was the part that actually *extended* Claude's capabilities rather than patching around limitations.

## The surgery

v0.7.0 went from 4 hook scripts (5 executions per session lifecycle) down to 2 scripts with 2 executions. Here's what changed:

**Killed the SessionStart injection hook.** The big one. `session-start-context.js` — the hook that read and printed PROGRESS.md, DECISIONS.md, SPRINT.md, and all guidance files into every session. Gone entirely. Native `.claude/rules/` loading handles development discipline. Session Memory handles session state. `@SPRINT.md` import in CLAUDE.md handles sprint context natively. No hook needed.

**Replaced it with a compact-only reorientation hook.** The new `compact-reorient.js` only fires after context compaction (via `"matcher": "compact"` in settings.json), not on every session start. It outputs the first 15 lines of SPRINT.md if there's an active sprint, or just "No active sprint." That's it. Targeted reorientation without bloating every session.

**Moved `.claude/guidance/` to `.claude/rules/`.** Same content, native home. The rules directory gets auto-discovered and loaded by Claude Code without any hooks. Now the files also have YAML frontmatter with `description:` fields, and they can use glob-scoped targeting — testing rules that only activate when Claude's working on test files, API rules scoped to API code. More precise, less context waste.

**Killed the timestamp hook.** `session-end-timestamp.js` used to update PROGRESS.md's "Last Updated" field on every session stop. Since PROGRESS.md is no longer auto-maintained by hooks, this became pointless. Gone.

**Killed the PreCompact hook.** `pre-compact-save.js` saved PROGRESS.md state before context compression. The compact-matcher SessionStart hook handles reorientation after compaction now. Gone.

**Slimmed CLAUDE.md from ~72 lines to ~50.** Removed the entire `## Session Protocol` section — the part that told Claude how to start a session (read PROGRESS.md first), what to do during a session, and how to end one. Claude Code knows how to do that now with Session Memory and `--continue`. What's left is project identity, MVP goals, behavioral rules, and a decision recording instruction. The new Context Budget table doesn't even mention PROGRESS.md anymore.

**Rewrote `/handoff`.** Went from ~108 lines to ~60. Instead of rewriting PROGRESS.md as the primary handoff artifact, `/handoff` now writes 2-3 priority items to Claude's native auto-memory file (`~/.claude/projects/.../memory/MEMORY.md`). DECISIONS.md got promoted to step 2. PROGRESS.md update is now optional — step 4, only if the project actively uses it as a human-readable artifact.

The settings.json tells the story pretty clearly now:

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

Two hooks. One commits on feature branches when a session ends. The other re-orients after compaction. That's the entire runtime footprint.

## Testing it on a real project

The nice thing about having built a proper `/update` command is that I could immediately test this on a real project. I opened Claude Code in the AIAgentMinder repo, pointed `/update` at one of my in-progress projects, and got a full migration report. It deleted the three obsolete hook scripts, migrated guidance files from `.claude/guidance/` to `.claude/rules/`, removed the Session Protocol section from CLAUDE.md while preserving my Project Identity and MVP Goals, added the `@SPRINT.md` import since sprint planning was already enabled, and committed the changes. The project went from the 0.6.0 memory-heavy approach to the native-memory-leveraging architecture in one command.

## The strange gratification of deletion

There's a weird emotional arc to watching a feature you built get obsoleted by the platform. I spent real time on that SessionStart hook. The rolling 3-session-note system in PROGRESS.md. The PreCompact state save. The guidance injection system. These were considered design decisions with specific rationale behind them, and they worked well for their time.

But I built AIAgentMinder because Claude Code had a gap, not because I wanted to own session memory forever. The whole point was to make AI-assisted development better. If Anthropic ships native features that do the same thing with lower overhead and tighter integration, that's... exactly what I wanted? The gap is closing. The tool that existed to bridge it should narrow in scope accordingly.

The README used to open with "Session continuity and project governance for Claude Code." Now it reads: "Project governance and planning for Claude Code. Structured `/plan` interviews, sprint workflows, and decision tracking — designed to complement Claude Code's native memory system, not replace it."

That reframing felt right. The project isn't about memory anymore. It's about the structured workflows that the platform doesn't ship because they're not one-size-fits-all.

What's left is more focused. The `/plan` command — a structured planning interview that takes a developer from rough idea to product brief with MVP features, tech stack, and quality tiers — doesn't duplicate anything native. Sprint planning with issue decomposition, per-issue PRs, and approval gates doesn't exist in Claude Code. Development discipline rules with glob scoping use the native `.claude/rules/` mechanism now, but the *content* of those rules (TDD cycle, review-before-commit, build-before-commit) is still AIAgentMinder's contribution.

The post-migration project structure:

```
your-project/
├── CLAUDE.md              # ~50 lines — project identity, behavioral rules
├── DECISIONS.md           # Architectural decision log
├── SPRINT.md              # Sprint tracking (optional, loaded via @import)
├── docs/
│   └── strategy-roadmap.md
└── .claude/
    ├── settings.json      # 2 hooks: auto-commit + compact reorientation
    ├── commands/
    │   ├── plan.md        # Structured planning interview
    │   └── handoff.md     # Session checkpoint → auto-memory
    ├── rules/
    │   ├── code-quality.md   # TDD, review-before-commit, error handling
    │   └── sprint-workflow.md  # Sprint planning and execution
    └── hooks/
        ├── compact-reorient.js   # Sprint summary after compaction only
        └── session-end-commit.js # Auto-commits on feature branches
```

Clean. Focused. Every file earns its context budget because it does something Claude Code doesn't do on its own.

## What I'd tell other tool builders

If you're building tooling that extends an AI coding assistant, design for obsolescence of the gap-filling parts. Your most interesting work probably isn't "give the AI a memory" — the platform will eventually handle that. Your most interesting work is the structured workflows, the domain-specific guidance, the opinionated process that the platform won't ship because it's not one-size-fits-all.

Build those. And when the platform absorbs the plumbing, let the plumbing go. What's left will be better for it.

---

*AIAgentMinder is open source under MIT. Check it out at [github.com/lwalden/AIAgentMinder](https://github.com/lwalden/AIAgentMinder) if you use Claude Code and want structured planning, decision tracking, and sprint workflows for your projects.*
