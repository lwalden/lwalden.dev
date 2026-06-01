---
title: "Mapping the Loop: Where AI Earns Its Keep and Where You Don't Get to Leave"
description: "Four months of building a local dev ecosystem where the repos talk to each other — an AI-run business experiment that mapped the leverage boundaries, a project-management layer that now describes itself to new projects, and a governance framework that got sharper by deciding what not to automate."
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

I did. But the most interesting output wasn't any of those repos. It was a clearer map of where AI actually creates leverage — and where I genuinely can't leave the loop.

That map matters because it changes how you build. Once you know which parts compress and which don't, you stop trying to automate the wrong things. The repos that came out of this stretch are more coherent as a system than anything I'd built before — and the clearest evidence of that is a small piece of infrastructure I added recently that made me realize the ecosystem had become self-describing.

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

So I made a judgment call: what did I actually want *more* — autonomy I couldn't really use across my own devices, or a reliable nudge at the right moment plus a clean way to hand off? I picked the second, and I'm genuinely happy with where it landed.

Here's what it became. A `Stop` hook watches the context budget and, when I cross the threshold, prints one advisory line: you're over, here are your options. Then *I* decide. Usually I run `/aiagentminder:handoff`, which writes a compact "Next Session" note into [Claude Code's native memory](https://code.claude.com/docs/en/memory), commit, and `/exit`. Then I open a fresh session — `claude --agent <agent>` if I was mid-sprint, or just plain `claude` otherwise — and my first prompt is a single word: `resume`. Native memory carries the "Next Session" block forward into a clean, near-empty window, and the new session picks up exactly where the last one stopped.

That's the pattern of v5 in a sentence: **I stopped chasing autonomy I couldn't actually use, and designed for the human who's actually there.** The warning fires at the right time, the handoff is one command, and the resume is one word. It's the part of the whole system I'm most quietly pleased with.

## The two deletions the platform earned

Context cycling evolved. Two other systems came out since v1.2, both for the same happy reason — the platform grew up and absorbed them:

| What came out | Why |
| --- | --- |
| The npm installer and CLI | Claude Code shipped a real [plugin system](https://code.claude.com/docs/en/discover-plugins). AIAgentMinder is now a plugin you install and update with `/plugin`, not an npm package I have to maintain. |
| The correction-capture hook | Claude Code's native auto-memory now captures repeated mistakes and project habits across sessions on its own. My shell hook on every tool call was redundant weight. |

This is the [obsolescence story](/posts/aiagentminder-v070-native-memory-migration) from last time, still playing out: every piece of AIAgentMinder that duplicates a native capability eventually goes, and that's the system working as intended.

## The project-management workflow whose main output is deletion

If you build across two dozen repos, your scarcest resource isn't compute or even time. It's attention. So the highest-leverage thing I built this stretch isn't a feature in any one app — it's a project-management layer that sits above all of them and, mostly, tells me what *not* to do.

It runs on the same question I [used to cull my n8n hub](/posts/ai-learning-curve-n8n-automation-scaling-back): *if this project stopped tomorrow, would I actually notice, and would I care?* Applied across a portfolio, monthly, the answers are clarifying and a little brutal. In the last review it told me to archive a crypto project I had no domain urgency for, mothball the SaaS once it had no audience, pause a social-ops toolkit until a project needed it, merge a trading experiment into a consolidated codebase, and scale back the automation hub again.

And then it did the one *additive* thing that mattered: it promoted a game project to my primary focus. That's the real function of good portfolio governance. It's not a dashboard that makes you feel busy. It's a mechanism for deciding, on purpose, where your limited attention goes. Most of its output is subtraction, and subtraction is the point.

## What the ecosystem experiment actually built

Here's the thing the commit count doesn't show. The repos have started to feed each other, and that compounding is the most valuable thing I've built.

The clearest example is a small HTTP service that wraps my Claude *subscription* behind an API — [your subscription is an API you're probably not using](/posts/claude-subscription-as-api-cli-first-pattern). It started as a one-off so a single project could call Claude without paying per token. Now multiple projects call it. The monitoring bots use it for triage; a trading experiment uses it for analysis. One boring, single-purpose service, reused everywhere.

The bots themselves prove that maturity buys speed. In a couple of evenings I stood up a handful of read-only monitors — they watch public sources, dedupe, and report to a Discord channel, and the daily digest asks Claude (through that gateway) to triage the day's signals by what actually matters. A couple of *evenings*. Two years ago that's a couple of weeks. The difference isn't that the AI got smarter; it's that I finally had governance, reusable infrastructure, and credentials plumbing that didn't make me start from zero.

Then there's the ops toolkit: a set of agents for social publishing and content ops, exposed two ways — a CLI and an MCP server. *This very site* uses it to draft and post social updates; the note that announces this post on Bluesky goes out through that other project's tooling, wired into my workflow here. One repo's work becomes another repo's capability.

The newest piece is the one I find most satisfying, because it closes the loop on the whole system. I now run a small local MCP server — a project-management registry — that knows about every service in the ecosystem: what each one does, what port it runs on, how to reach it, and what it prefers to consume. When I start working on any project, Claude can query that registry before recommending an integration and find out: *what's the preferred way to make an AI call around here?* The answer comes back: use claude-gateway. *What handles automation workflows?* n8n-automation-hub. *Social publishing?* The ops MCP server.

That's not clever engineering. It's a boring preferences file with an MCP interface. But it means the ecosystem has become *self-describing*: a new project gets integration decisions that match the existing architecture, without me having to re-explain any of it. The governance I've been building at the sprint level, applied to the infrastructure level. I actually used it to fact-check this article — confirmed the services it mentions are still live and the descriptions are current. That's a first.

The shape that keeps winning is the same one I landed on with n8n: small, boring, single-purpose, one clear consumer. Those are the pieces that compose. The clever, do-everything systems are the ones I keep paring back.

## What the AI-run business experiment actually measured

The SaaS deserves a clear-eyed look, because it wasn't just a product — it was a deliberate experiment in AI autonomy, and it returned useful data.

The premise: could an AI *run a business*? I gave it a starting budget and a two-year horizon and told it to pick a product — I didn't even specify software — build it, and handle as much of the lifecycle as it could, only pulling me in when it genuinely had to. It chose a Shopify accessibility-compliance scanner, and it built the whole thing: marketing site, authentication, Stripe subscriptions, transactional email, a dashboard, and the scanning product underneath. It works. It's real software.

The product found no market, and that's beside the point. What the experiment actually measured was *where in the business lifecycle AI creates leverage versus where it needs a human in the loop*.

The leverage parts were real. AI compressed the build dramatically — far less effort than coding it solo from scratch. Architectural decisions, code generation, boilerplate infrastructure, even copy drafts — all faster than anything I could do unassisted. If you quantify "build effort," AI takes a large fraction of it.

The essential-human parts were equally clear. Every account registration, every auth token, every OAuth app registration, every judgment call about who this was for and whether they'd pay — those required me. The thing it most needed a human for, audience-product fit, was the thing it got wrong. The model had no way to discover that the people it was targeting either didn't know they had the problem or already had a solution they weren't going to switch away from. That's not a research gap AI closes by reading more docs. It's a market-sensing judgment that comes from being a person in the world.

So: AI owns the *build*. Human owns the *why* and the *who*.

The artifact that came out wasn't a customer. It was a template — all that plumbing, auth, billing, email, CI/CD, is now a reusable SaaS starter. The next product I want to build begins at week eight instead of week zero. And the cleaner map of where I belong in the loop is probably worth more than the template.

## Where might the loop shrink next?

The one gap that chafed most consistently — the seam between "AI can do this" and "human has to sit here and type" — was account setup. Generating and rotating auth tokens. Registering OAuth apps. Copy-pasting credentials out of sites with no API. Claude Code's [Chrome integration](https://code.claude.com/docs/en/chrome) is still young and constrained by design — it can't enter credentials for you, has no memory across sessions, and that's mostly the right call for security reasons. But browser automation is maturing fast.

My read: credential bootstrapping is the next thing to compress. Not credential *storage* — that's been solved — but the ceremony of walking through a service's web UI to create the credential in the first place. As browser automation becomes safer and more reliable, that ceremony becomes scriptable. When it does, the last major gap between "kick it off and check in later" and "sit here while this happens" closes for a wide class of projects.

What I don't expect to compress: taste, judgment, and market sensing. Those aren't harder versions of the same problem. They're different problems.

## The friction nobody puts in the demo videos

A quick honesty note, because the highlight reels lie by omission. The hard parts of AI-assisted solo dev aren't the coding. They're those seams between systems: setting up accounts, generating and rotating auth tokens, registering OAuth apps, copy-pasting data out of sites that actively block automation. I ended up building a whole Bitwarden-backed strategy just to get credentials to agents safely. The bottom line: I can't glance at my phone once a day and watch the empire run itself. The work is real work. It's *leveraged* work, sometimes dramatically — but it's hands-on.

## Where the freed-up attention went

I'll close with the project I'm least going to tell you about, because it's the one I care most about.

All that subtraction — the archived repo, the mothballed SaaS, the paused toolkit, the culled automations — was, in the end, in service of clearing a runway. What it cleared it for is a game. I bought a domain. There's no store page, no website, no trailer, not a single screenshot to show you, and I'm not going to describe the design here. Talking up an unannounced game you haven't shown anyone is how you spend your enthusiasm before you've earned the right to. The successful local-AI audio POC I mentioned at the top feeds it. That's all I'll say.

It's also the place where "AI does the work" is *least* true. A game needs taste and design and the kind of slow judgment that doesn't compress into a couple of evenings. Which, after four months, feels exactly right. The governance, the reusable infrastructure, the self-describing ecosystem — all of it exists to get the undifferentiated work out of my way so I can spend my actual attention on the thing that needs a human.

That's the scorecard. Not "look how much the AI let me build." More like: I learned where the leverage lives, where the loop holds, and what that clarity is worth when you're building with limited time and unlimited ambition.

---

*AIAgentMinder is open source under MIT. If you use Claude Code for projects that span more than a few sessions, it's at [github.com/lwalden/AIAgentMinder](https://github.com/lwalden/AIAgentMinder).*
