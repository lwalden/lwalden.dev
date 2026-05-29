---
title: "Finding Productivity: Seeking Automation, Choosing the Human in the Loop"
description: "Four months of AI-assisted solo development across two dozen repos: a SaaS nobody bought, a project-management workflow whose main output is deletion, repos that finally feed each other, and a governance tool that reached v5 by evolving its most autonomous feature into a human-in-the-loop design. The lesson was the same everywhere — keep the human in the loop."
pubDate: 2026-05-28
slug: "aiagentminder-v5-the-autonomy-retreat"
tags:
  [
    "AIAgentMinder",
    "Claude Code",
    "AI tooling",
    "building-in-public",
    "AI governance",
    "developer-productivity",
  ]
draft: true
featured: false
series:
  id: "aiagentminder-codeveloping"
  title: "Co-developing with AIAgentMinder"
  order: 7
---

Here's the surface version of the last four months. I shipped a working SaaS — landing page, secure login, Stripe billing, transactional email, customer dashboard, the whole stack. I stood up a small fleet of monitoring bots that report to a Discord channel. I took [AIAgentMinder](https://github.com/lwalden/AIAgentMinder) from its first scrappy incarnation to version 5. I ran a local-AI audio proof of concept that actually worked. I started building a game. Across roughly two dozen repos, most of them small, the commit graphs look like someone who got a lot done in his off hours.

I did. But that's not the interesting part, and most of it isn't the part I'm proud of.

The interesting part is that the single most important thing I did this stretch was *choose the human-in-the-loop version* — over and over. In my tooling, in an experiment about letting an AI run a business, in the fantasy I started with. Version 5 of AIAgentMinder is, in large part, a record of me reaching for autonomy and then deciding, deliberately, to keep myself in the loop — and being happier for it. So is everything else. Here's the honest version.

## Where AIAgentMinder was, and where it is

AIAgentMinder didn't come from nowhere. I spent the first weeks of January working with vanilla Claude Code, and the friction of those early sessions — losing the thread between days, re-explaining the project every morning, watching it wander off the plan — is what told me what I actually wanted to build. By February there was a tool.

When I [last wrote about the framework](/posts/aiagentminder-evolution-building-on-quicksand), it was at v1.2 and I was daydreaming about it becoming pure markdown — no runtime, no hooks, just rules. The thesis of that post was *design for your own obsolescence*: every feature I'd built that duplicated something Claude Code shipped natively eventually got deleted, and that was fine, because the ecosystem was maturing.

That thesis held. It just got more interesting.

What **stayed the same** is the spine: opinionated governance the platform won't ship for you. A planning interview that turns a rough idea into a brief. Decision logging so you stop re-debating settled architecture. A sprint state machine with approval gates. Mandatory tests before a PR. Scope enforcement that catches Claude cheerfully building things nobody asked for. That core has survived every version since v0.5, because it *extends* the model instead of patching around it.

What **changed** is that I got sharper about the difference between automation I wanted and automation I could actually use — and the clearest lesson there came from the feature I was most excited about.

## The feature I evolved instead of automating

Somewhere around v4.4 I built context cycling. The motivation is real and well-documented: long context degrades model quality. As you pile tokens into the window, output gets worse — and not at the very end, but well before the limit. Chroma's testing of 18 frontier models found [every one of them degrades as input grows](https://www.trychroma.com/research/context-rot); a model with a 200K window can measurably slip at 50K. I'd *felt* this in long sessions — the slow drift where Claude starts losing the thread — before I had a name for it.

So I built a system to get ahead of it. The idea was seductive: a session that notices it's getting heavy, wraps itself up, hands off its state, and starts fresh — automatically, so I could kick off long runs and check on them from my phone while I did something else. A `SessionEnd` hook built a continuation file, a `SessionStart` hook injected it into the next session, and a `PreToolUse` hook blocked tools once the context crossed a threshold to *force* the cycle. On paper, beautiful. Autonomous quality control.

In practice it ran into the hard edges of how I actually work — and the biggest edge was that I like to *start a session on my PC and continue it on my phone*. Full autonomy fought that pattern at every turn. The cycle depended on slash commands I can't issue from the mobile app. When a session self-terminated to restart itself, it disconnected the very mobile view I was using to keep an eye on it. The whole protocol was dormant on Claude Code's web client. None of these were Claude Code doing anything wrong; they're just the shape of the platform, and the fully hands-off version I'd imagined didn't fit inside that shape.

So I made a judgment call: what did I actually want *more* — autonomy I couldn't really use across my own devices, or a reliable nudge at the right moment plus a clean way to hand off? I picked the second, and I'm genuinely happy with where it landed. This wasn't a feature dying. It was a feature growing up.

Here's what it became. A `Stop` hook watches the context budget and, when I cross the threshold, prints one advisory line: you're over, here are your options. Then *I* decide. Usually I run `/aiagentminder:handoff`, which writes a compact "Next Session" note into [Claude Code's native memory](https://code.claude.com/docs/en/memory), commit, and `/exit`. Then I open a fresh session — `claude --agent <agent>` if I was mid-sprint, or just plain `claude` otherwise — and my first prompt is a single word: `resume`. Native memory carries the "Next Session" block forward into a clean, near-empty window, and the new session picks up exactly where the last one stopped. I don't re-type anything. A sprint started at my desk in the morning keeps flowing from my phone in the afternoon, across as many context resets as it takes, without quality drifting and without me repeating myself.

That's the pattern of v5, in a sentence: **I stopped chasing autonomy I couldn't actually use, and designed for the human who's actually there.** The warning fires at the right time, the handoff is one command, and the resume is one word. It's the part of the whole system I'm most quietly pleased with.

## The two deletions the platform earned

Context cycling evolved. Two other systems of mine genuinely came out since v1.2, though, and both for the same happy reason — the platform grew up and absorbed them:

| What came out | Why |
| --- | --- |
| The npm installer and CLI | Claude Code shipped a real [plugin system](https://code.claude.com/docs/en/discover-plugins). AIAgentMinder is now a plugin you install and update with `/plugin`, not an npm package I have to maintain. Let the platform own distribution. |
| The correction-capture hook | Claude Code's native auto-memory now captures repeated mistakes and project habits across sessions on its own. My shell hook on every tool call was redundant weight. |

This is the [obsolescence story](/posts/aiagentminder-v070-native-memory-migration) from last time, still playing out: every piece of AIAgentMinder that duplicates a native capability eventually goes, and that's the system working as intended. What's left is the part that's genuinely mine — the opinionated governance the platform has no reason to ship.

## The project-management workflow whose main output is deletion

If you build across two dozen repos, your scarcest resource isn't compute or even time. It's attention. So the highest-leverage thing I built this stretch isn't a feature in any one app — it's a project-management layer that sits above all of them and, mostly, tells me what *not* to do.

It runs on the same question I [used to cull my n8n hub](/posts/ai-learning-curve-n8n-automation-scaling-back): *if this project stopped tomorrow, would I actually notice, and would I care?* Applied across a portfolio, monthly, the answers are clarifying and a little brutal. In the last review it told me to:

- **Archive** a crypto project I had no real domain knowledge in and no market urgency for. Reviving it would require both the market and my own interest to shift. They haven't.
- **Mothball** the SaaS (more on that below) once it was clear it had no audience.
- **Pause** a social-ops automation toolkit until a project actually needs it.
- **Merge** a standalone trading experiment into a single consolidated codebase instead of maintaining two.
- **Scale back** the automation hub — again — to the three jobs that earn their keep.

And then it did the one *additive* thing that mattered: it promoted a game project to my primary focus. That's the real function of good portfolio governance. It's not a dashboard that makes you feel busy. It's a mechanism for deciding, on purpose, where your limited attention goes — and giving you permission to let the rest go quiet. Most of its output is subtraction, and subtraction is the point.

## What four months of tooling actually bought: an environment, not an app

Here's the thing the commit count doesn't show. The repos have started to feed each other, and that compounding is the most valuable thing I've built.

The clearest example is a small HTTP service I wrote months ago that wraps my Claude *subscription* behind an API — [your subscription is an API you're probably not using](/posts/claude-subscription-as-api-cli-first-pattern). It started as a one-off so a single project could call Claude without paying per token. Now multiple projects call it. The bots use it for triage; the trading experiment uses it for analysis. One boring, single-purpose service, reused everywhere.

The bots themselves are the proof that maturity buys speed. In a couple of evenings I stood up a handful of read-only monitors — they watch public sources, dedupe, and report to a Discord channel, and the daily digest asks Claude (through that gateway) to triage the day's signals by what actually matters. A couple of *evenings*. Two years ago that's a couple of weeks. The difference isn't that the AI got smarter; it's that I finally had governance, reusable infrastructure, and credentials plumbing that didn't make me start from zero.

And the newest synergy is the one I find most satisfying. A small ops toolkit I built exposes its capabilities two ways — a command-line tool and an MCP server (the protocol Claude Code uses to plug in external tools). *This very site* uses it to draft and post social updates; the note that announces this post on Bluesky goes out through that other project's tooling, wired into my workflow here. One repo's work becomes another repo's capability. That's not an app. That's an environment starting to behave like one.

The shape that keeps winning is the same one I landed on with n8n: small, boring, single-purpose, one clear consumer. Those are the pieces that compose. The clever, do-everything systems are the ones I keep paring back.

There's a second-order effect I didn't expect, and it might be the best one. When AI compresses the parts of a project that *can* be compressed, the parts that can't — the taste, the judgment, the unglamorous slog — stop looking like a reason not to start. I'm building side projects now that I'd have talked myself out of a year ago, not because they weren't worth doing but because they weren't worth the weeks they used to cost. Take the boilerplate down from weeks to evenings, and I'm suddenly willing to put in the rest by hand. The bots were the small version of that. The game is the big one.

## The business an AI "ran"

The SaaS deserves the straightforward version, because it's the cleanest illustration of the whole lesson.

I didn't set out to build a SaaS. I set out to run an experiment: could an AI *run a business*? I gave it a starting budget and a two-year horizon and told it to pick a product — I didn't even specify software — build it, and handle as much of the lifecycle as it could, only pulling me in when it genuinely had to. It chose a Shopify accessibility-compliance scanner, and it built the whole thing: marketing site, authentication, Stripe subscriptions with a customer portal, transactional email, a dashboard, and the scanning product underneath. It works. It's real software.

It was also the right kind of product pointed at the wrong audience, and it found no market. Total cash burned was about $250 — cloud resources and Stripe setup — and the rest was my time. Which is the part that punctures the premise: "an AI ran the business" is generous. I was in the loop constantly. Every account, every auth token, every third-party app registration, every judgment call about who this was even for. The AI did genuinely compress the build — far less effort than coding it solo from scratch — but the autonomy, again, was the part that didn't hold. The thing it most needed a human for, audience-product fit, was the thing it got wrong.

So I mothballed it, and I kept the template. All that plumbing — auth, billing, email, the dashboard shell, the CI/CD — is now a reusable SaaS starter, so the next product I want to build begins at week eight instead of week zero. A failed product that turned into infrastructure. As consolation prizes go, that's the same shape as everything else here: the durable value was the boring reusable part, and the lesson was that I belong in the loop.

## The friction nobody puts in the demo videos

A quick honesty break, because the highlight reels lie by omission. The hard parts of AI-assisted solo dev mostly aren't the coding. They're the seams between systems: setting up accounts, generating and rotating auth tokens, registering OAuth apps, copy-pasting data out of sites that have no decent API and actively block bots. Claude Code's [Chrome integration is still in beta](https://code.claude.com/docs/en/chrome) and constrained by design — it can't enter credentials for you, has no memory across sessions, and on the lower tier is limited to a smaller model — so it isn't the magic "let the agent use the web for me" escape hatch. I ended up building a whole Bitwarden-backed strategy just to get credentials to agents safely.

The bottom line: I can't just glance at my phone once a day and watch the empire run itself. That was the dream the autonomous context-cycler chased, and the fully hands-off version of it is exactly the part that didn't fit how I work. The work is real work. It's *leveraged* work, sometimes dramatically — but it's hands-on, and the moment I pretend otherwise, something I didn't read breaks at 3am.

## Where the freed-up attention went

I'll close with the project I'm least going to tell you about, because it's the one I care most about.

All that subtraction — the archived repo, the mothballed SaaS, the paused toolkit, the culled automations — was, in the end, in service of clearing a runway. What it cleared it for is a game. I bought a domain. There's no store page, no website, no trailer, not a single screenshot to show you, and I'm not going to describe the design here. Talking up an unannounced game you haven't shown anyone is how you spend your enthusiasm before you've earned the right to. The successful local-AI audio POC I mentioned at the top? That feeds it. That's all I'll say.

It's also the place where "AI does the work" is *least* true. A game needs taste and design and the kind of slow judgment that doesn't compress into a couple of evenings. Which, after four months, feels exactly right. The tooling, the governance, the reusable infrastructure — all of it exists to get the undifferentiated work out of my way so I can spend my actual attention on the thing that needs a human.

That's the scorecard for four months and five major versions. Not "look how much the AI let me build." More like: I learned what to stop building, what to stop automating, and where I actually belong in the loop. The autonomy I keep pulling back from was never a failure of the model. It was me, slowly, figuring out which decisions are mine to keep.

---

*AIAgentMinder is open source under MIT. If you use Claude Code for projects that span more than a few sessions, it's at [github.com/lwalden/AIAgentMinder](https://github.com/lwalden/AIAgentMinder).*
