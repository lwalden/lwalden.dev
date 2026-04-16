---
title: "My n8n Hub Used to Run Eight Jobs. Now It Runs Three. That's the AI Learning Curve."
description: "I started with an ambitious n8n automation hub for ops work across my projects. Six months and a lot of Claude-assisted debugging later, I've deleted most of it. The lesson wasn't about the AI — it was about learning what should never have been automated in the first place."
pubDate: 2026-04-16
slug: "ai-learning-curve-n8n-automation-scaling-back"
tags:
  [
    "n8n",
    "automation",
    "Claude Code",
    "AI tooling",
    "building-in-public",
    "developer-productivity",
  ]
draft: true
featured: false
series:
  id: "n8n-automation"
  title: "Developer Automation with n8n"
  order: 2
---

A few months ago I got excited about [n8n](https://n8n.io/) the way you get excited about any new power tool. I have a dozen small projects. Each one has the same recurring ops work — health checks, log summaries, failed build alerts, dependency scans, usage reports. And now I had Claude, which could generate a JSON workflow for any of those tasks on command.

The math looked obvious. Instead of me doing ops chores, I'd spin up scheduled jobs. Instead of me writing those jobs from scratch, Claude would draft them. I'd review, tweak, commit. Eight workflows in a weekend. Ten the next. A whole automation hub running the boring parts of solo development.

That's not what happened. Today my n8n instance runs three jobs. The rest got deleted, and I'm glad they're gone. Here's what I actually learned.

## The initial promise

The pitch to myself went like this: I'm one person. I have production-facing stuff — [accessi-shield](https://github.com/lwalden/accessi-shield), [claude-gateway](https://github.com/lwalden/claude-gateway), this site, a handful of smaller repos — and I can't babysit any of them. What I need is a watchdog layer that notices when something breaks, summarizes it, and nudges me when I should pay attention. n8n, running on a small VPS, was going to be that layer.

Claude made it feel tractable. I could describe a workflow in English — "every morning, check accessi-shield's health endpoint, parse the response, if the error rate is above 2% send me an email with a summary of the last 24 hours of logs" — and get back a working JSON import in a couple of minutes. The first one that shipped was genuinely delightful. I watched the email arrive the next morning like I'd pulled off something clever.

That was the high point.

## The reality

What I underestimated is that an n8n workflow is a program. It has control flow, state, error handling, retries, credentials, and failure modes. When you draft one by talking to an AI, you get a program you didn't write. And when a program you didn't write breaks at 3am, you're now debugging an artifact whose design choices you can't defend.

My workflows grew. One job became six nodes, then ten, then fourteen — a Cron trigger, an HTTP request, a Code node to parse the response, an IF branch for the error case, a sub-workflow call for Claude summarization, an email send, a Google Sheet append for history, another IF branch for the "nothing interesting happened" case so I wouldn't get spammed. Each addition made sense in isolation. Together they made a workflow I was afraid to touch.

Then they started failing. Not in spectacular ways — in sneaky ones. The HTTP node would time out silently because some upstream service got slower. A Code node would throw because a field I expected was `undefined` in an edge case. A credential would expire. The Cron trigger would stop firing after a container restart and I wouldn't notice for four days because, of course, the notification was the thing that had broken.

The debugging pattern became predictable. I'd open the n8n execution log, see a red X somewhere in a fourteen-node graph, stare at the JSON of whatever intermediate payload had gone sideways, and realize I didn't actually remember how any of this worked. I had written the prompt, not the program. Claude would help me fix it — Claude is extremely good at reading a broken n8n execution and telling you what the failing node is missing — but every fix added more logic that I also didn't write.

After the third or fourth round of this I had an uncomfortable thought: most of these workflows weren't saving me time. They were inventing a new category of work.

## The scale-back

I went through the whole hub one afternoon and asked a single question of each workflow: *if this stopped running tomorrow, would I actually notice, and would I care?*

For most of them the honest answer was no. A weekly dependency audit email that I'd been archiving unread. A GitHub release-notes generator for projects I don't release on a cadence. A "daily summary of my own commits" digest that was just me, reading descriptions of what I'd done the day before, which I already knew. A broken-link checker for a site I was actively redesigning, so every run generated noise I'd have to ignore. A scheduled script that scraped one of my own dashboards and re-posted the numbers to another dashboard.

I deleted them. All of them. What I kept was three jobs:

1. **Daily health summary for accessi-shield.** Does the service respond? Is the error rate within a sane band? One email, one chart, sent every morning. If it doesn't arrive, I know something's wrong.
2. **Daily health summary for claude-gateway.** Same pattern. This one matters because claude-gateway routes real requests; if it's degraded, I want to know before anyone else does.
3. **Weekly usage report for accessi-shield.** A modest roll-up of scan counts, top failing rules, and any new error types that showed up during the week. This one I genuinely read.

Three jobs. Each one short, each one with a clear consumer (me), each one with a failure mode I'd notice inside 24 hours (the email doesn't show up).

## What worked

A few things earned their place even through the cull:

**Version-controlling the workflows in git.** Every surviving workflow lives as a JSON file in a repo with a `deploy-to-n8n` script. When a workflow changes, I see the diff in a PR and I get to understand it before it runs. This is the single biggest improvement and I wish I'd started with it instead of clicking around in the n8n UI for the first month.

**Claude as a workflow debugger, not a workflow author.** Pasting a failing execution payload and a screenshot of the graph into Claude and asking "what's the minimum change that makes this work again" produces genuinely good answers. Claude is excellent at reading n8n's artifacts. Much better than it is at designing n8n workflows from scratch.

**Sub-workflows for anything that's actually reusable.** The [Claude CLI-first sub-workflow](/posts/claude-subscription-as-api-cli-first-pattern) is still there and still pays for itself. That's because it does exactly one thing and has one consumer interface. Small, boring, reusable. That's the shape.

## What didn't

**Over-automating.** I automated tasks I didn't do often enough to justify the ongoing maintenance cost. Maintaining a workflow costs more than running the task manually six times a year.

**Trusting AI-generated complexity I didn't read.** If I can't explain why a workflow has a particular IF branch, I shouldn't be running that workflow in production. AI-generated code hits different when it's scheduled.

**Scope creep from "while we're in here."** Every time I opened a workflow to fix something, Claude and I would be a dozen exchanges deep into "and we could also add a retry, and log the duration, and…" I'd end up with a more elaborate version of a thing that didn't need to exist.

## The real lesson

The AI learning curve, for me, was not about what Claude can build. Claude can build a lot. The curve is about what I'm willing to run unattended. Every automation is a long-term commitment to understanding a piece of software that I didn't write. If I wasn't going to read it, and wasn't going to maintain it, and wasn't going to notice if it died, then having an AI generate it in three minutes wasn't leverage. It was debt with a friendly interface.

Three jobs. A boring hub. Emails that show up. That's the honest endpoint of six months of enthusiasm, and I'll take it.
