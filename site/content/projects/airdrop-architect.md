---
title: "Airdrop Architect"
description: "SaaS platform for tracking crypto airdrop eligibility and DeFi points programs — Telegram bot plus web dashboard, built on Azure and C#/.NET."
github: "https://github.com/lwalden/airdrop-architect"
tags: ["C#", ".NET", "Azure Functions", "CosmosDB", "Telegram Bot API", "Stripe", "TypeScript", "React"]
types: ["commercial"]
order: 2
---

Keeping up with DeFi airdrop eligibility is tedious. Every protocol has its own points system, its own snapshot schedule, and its own set of qualifying actions — and missing a snapshot means missing the drop. Airdrop Architect automates the tracking so you don't have to.

## What it does

A Telegram bot paired with a React web dashboard. Users connect their wallet addresses, and the platform continuously monitors eligibility across supported protocols — surfacing your current points balances, eligibility status, and upcoming snapshot deadlines. The goal is a single place to answer "am I going to get this drop, and what do I still need to do?"

Key capabilities:
- **Eligibility checking** — real-time queries against supported DeFi protocols via their APIs
- **Points tracking** — aggregates points/XP balances across programs like EigenLayer, Hyperliquid, Scroll, and Linea
- **Notifications** — Telegram alerts for snapshot deadlines and eligibility changes
- **Subscription tiers** — free tier for basic tracking; paid tiers ($9–$99/mo) unlock more wallets, protocols, and data history

## Architecture

Azure-native: Azure Functions handle the bot webhook and scheduled eligibility polling, Cosmos DB stores user state and historical snapshots with tenant-aware partitioning, Redis caches protocol data to avoid hammering third-party APIs. Stripe and Coinbase Commerce handle subscriptions.

The polling architecture uses Polly for retry/circuit breaker patterns against external protocol APIs — reliability matters when you're dealing with RPC endpoints that have variable uptime.

## Why I built it

Partly because I wanted to use the problem as a forcing function to build a real multi-tenant SaaS on Azure from scratch — not a tutorial, but something with actual payment flows, GDPR compliance, and operational runbooks. Partly because I was doing the tracking manually and it was annoying enough to automate.

It's also a useful testbed for the kind of event-driven, subscription-based architecture patterns I've worked with professionally — just in a domain I own end to end.

## Status

Active development. Phase 1 (core bot + eligibility + Cosmos DB) is in progress. Follow the [GitHub repo](https://github.com/lwalden/airdrop-architect) for updates.
