---
title: "AI Approved the Resource. I Paid the Bill."
description: "How I burned through $1,000 of Azure credit on a project with zero customers — and why cost governance is the human-in-the-loop requirement I didn't see coming."
pubDate: 2026-06-09
slug: "ai-approved-the-resource-i-paid-the-bill"
tags:
  [
    "Azure",
    "AI tooling",
    "cost governance",
    "lessons learned",
    "building-in-public",
    "AccessiShield",
  ]
draft: true
featured: false
series:
  id: "aiagentminder-codeveloping"
  title: "Co-developing with AIAgentMinder"
  order: 8
---

Here's a number: $1,000. That's the Azure credit I started the AccessiShield project with, courtesy of a Microsoft promotion for solo developers. And here's another number: $300-plus per month. That's roughly what the SQL infrastructure I provisioned for a zero-customer MVP was costing to run.

I'm going to tell you how those two numbers met, because the story is more instructive than embarrassing — though it is also a little embarrassing, and I think the honest version is the useful one.

## The buffer that made the blind spot possible

When you start a project with $1,000 of free credit, something shifts in how you think about costs. It's the developer equivalent of "it's on the company card." The money is real — it has real opportunity cost, it could have funded experimentation on other projects for months — but it doesn't *feel* real in the moment. You approved a sprint, the sprint ran, resources got created, and the bill went somewhere you weren't watching.

I knew the credit was there. I knew the project was early-stage. I did not know, at any point during the build, what AccessiShield was costing per month to run. That sentence is the whole problem.

## What the AI provisioned and why it wasn't wrong

When I kicked off the AccessiShield build, the spec called for a proper production-grade SaaS: authentication, Stripe billing, customer dashboard, a scanning product underneath. The AI — working through AIAgentMinder's sprint workflow — proposed an architecture that fit those requirements. SQL on Azure, with a plan appropriate for a real application with real concurrent users and real availability requirements.

Nothing about that decision was careless. Given the spec, it was correct. A proper SaaS needs a proper database, and the AI chose a tier that would handle the load the spec described.

The problem is that the spec described a finished product. What I was actually building was an MVP with me as the only test user. The gap between those two things — in terms of actual database load — was enormous. A single developer poking at a dashboard doesn't need the same SQL tier as a product with paying customers. But the spec didn't say "optimize for zero users." So the AI didn't.

That's not a failure of the model. It's a failure of the question I asked it.

## The missing gate

AccessiShield ran through the same sprint workflow I use for everything. Spec, plan, implement, PR, review, merge. The review step covered code quality, architecture, test coverage. It did not cover the line item on next month's Azure invoice.

There was no moment in that workflow where anyone — me or the AI — asked: *what does this infrastructure cost per month at MVP scale?* It was simply not a question the process required. An infra PR landed, I read the code, it looked right, I approved it. "Approve" on a Bicep template and "I understand the monthly cost of what I just approved" turned out to be very different things.

By the time I noticed the burn rate, a meaningful chunk of the credit was gone. The resources had been running for weeks, doing essentially nothing, at a rate that made no sense for the stage the project was at. I mothballed everything once the picture was clear, but the credit doesn't come back.

## What the guardrail looks like now

The fix isn't complicated. It just has to be explicit, because "I'll notice if something looks expensive" is not a process — it's optimism.

Three things I've added:

**Budget alerts before workloads.** Any new resource group that's going to run real infrastructure gets an Azure budget alert configured before the first resource is provisioned. Not after. The alert threshold is set conservatively — what I'd actually expect to spend at the current stage of the project, not what I might spend at maturity. If it fires, that's a conversation, not an emergency, and those are much better to have early.

**A cost question at spec time.** My AIAgentMinder sprint spec template now includes a standing prompt: *"What is the estimated monthly cost of this infrastructure at the current usage level (users, requests, storage)?"* The AI fills this in as part of writing the spec. I read it before the sprint starts. This sounds obvious in retrospect. It wasn't in the workflow before.

**SKU justification in infra PRs.** Any PR that creates or modifies compute or storage resources has to include the SKU, the estimated monthly cost at current scale, and a one-line justification for why that tier is appropriate now. This is a small addition to the PR template and it takes about two minutes to fill in. It would have caught the AccessiShield situation immediately — "SQL Business Critical, $310/month, justification: handles 500 concurrent users" is a sentence that stops a review dead when the project has zero users.

## The principle behind the guardrail

AI has no financial skin in the game. It will provision what is technically correct for the requirements you gave it, and it will do so confidently, because it's right. It doesn't know you have $1,000 of credit and an expectation that it'll last two years. It doesn't know you're the only user. It doesn't know that "production-grade" and "appropriate for this moment" are different problems.

Cost-consciousness has to come from the human side of the loop. Not as an afterthought when the bill lands, but as a first-class question built into the workflow at spec time. The AI is optimizing for what you asked it to optimize for. If cost-appropriateness isn't in the spec, it's not in the output.

I'd spent months thinking carefully about where humans need to stay in the loop: market judgment, audience sensing, the unglamorous account setup work. I had a tidy framework. Cost governance wasn't in it, because I'd never been burned by it before. Now it is.

## What it cost and what it bought

The credit is gone. That's the real loss — not the money itself, but the runway it represented for future experiments. Cloud-based projects I might have tried, infrastructure I might have spun up to play with, all now measured against actual spend instead of a comfortable buffer.

What it bought was a lesson I won't need to learn twice, a template I can start the next product from at week eight, and a workflow with a guardrail in it that should have been there from the start.

Some things you only learn by paying for them. This was one of them.

---

*The AccessiShield SaaS starter template — auth, billing, email, CI/CD, everything except the product — is sitting on a shelf if I ever find the right thing to put on top of it.*
