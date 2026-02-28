---
title: "AI Agent Minder"
description: "A lightweight project governance layer for Claude Code — slash commands, markdown templates, and minimal hooks that add structured planning and decision tracking without getting in the way."
repo: "https://github.com/lwalden/AIAgentMinder"
technologies: ["Claude Code", "Node.js", "Markdown", "Git"]
featured: true
sortOrder: 1
status: "active"
---

Claude Code is powerful out of the box, but it doesn't have strong opinions about project planning, architectural decisions, or how work should be structured across sessions. AIAgentMinder fills that gap with a small, opinionated layer built entirely from markdown and two tiny Node.js hooks.

## What it actually is

A set of template files and slash commands you drop into a project alongside Claude Code:

- **`/plan`** — interview-driven planning session that produces a product brief, defines MVP scope, picks a quality tier, and optionally enables sprint planning
- **`/handoff`** — session-end checkpoint that captures decisions, writes priorities to Claude Code's native persistent memory, and commits tracked changes
- **`DECISIONS.md`** — architectural decision log; the pattern is to record significant choices with alternatives considered, so you stop re-debating them
- **Sprint workflow** (optional) — structured issue decomposition with one branch per issue, per-issue PRs, and state tracked in `SPRINT.md`
- **Two hooks** — an auto-commit on session end (feature branches only), and a post-compaction reorientation that surfaces the active sprint when Claude's context gets pruned

No database, no external dependencies beyond Node.js, no MCP server. State is plain markdown in your repo.

## Why it exists

I kept running into the same friction when using Claude Code for personal projects: good at executing, not great at remembering *why* things were decided the way they were, or what the shape of the next phase should be. The governance layer I wanted was basically a structured `CLAUDE.md` plus a couple of conventions — so I extracted it into something reusable.

v0.7.0 (released today) was a significant rethink. Earlier versions included session continuity infrastructure that Claude Code has since built natively. That stuff got removed. The current version is smaller and stays focused on what Claude Code doesn't do: structured planning and decision tracking.

## Current status

Active development, v0.7.0. Maintained as a personal tool I use on my own projects — including this site.
