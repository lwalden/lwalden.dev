---
title: "Your Claude Subscription Is an API You're Not Using"
description: "How to route automated and real-time Claude requests through your Max subscription instead of paying per-call — with two production patterns: an n8n sub-workflow for async operations and an Express gateway for synchronous app integration."
pubDate: 2026-03-21
slug: "claude-subscription-as-api-cli-first-pattern"
tags:
  [
    "Claude Code",
    "AI tooling",
    "n8n",
    "automation",
    "building-in-public",
    "cost optimization",
  ]
draft: true
series:
  id: "n8n-automation"
  title: "Developer Automation with n8n"
  order: 1
---

I hit the wall about three weeks into using Claude Code seriously.

Not a technical wall — a billing wall. I was developing agentically across multiple solo projects, and it had been one of the best learning experiences of my career. New technologies, new problem spaces, new ways to see inefficiencies I'd trudged through for years. But all that productivity came at a real dollar cost measured in tokens.

My $20/month Claude Pro subscription lasted about two weeks into the honeymoon phase. Once I was comfortable running two or three Claude Code instances on different projects simultaneously, I was hitting the 5-hour rate limit every one to three hours and burning through the weekly cap in three to four days. At first this was useful pressure — it pushed me to refine my prompts, tighten my context engineering with [AIAgentMinder](/posts/aiagentminder-evolution-building-on-quicksand), prevent drift, eliminate wasted turns. But there's only so much juice to squeeze from that lemon.

I was genuinely enjoying agentic development as a workflow for side projects, so the jump to the $100/month Max 5x plan felt worth trying for a month. It was. I haven't hit a cap since.

To be fair, I'm rarely running three or four projects simultaneously anymore — that led to burnout from context switching more than anything. But my observations, and the general consensus on Reddit, suggest the 5x plan gives you significantly more than 5x the practical usage over the Pro plan in real-world terms. The hourly and weekly limits scale more generously than the multiplier implies. I've also heard (though I have no personal experience) that the Max 20x tier at $200/month doesn't give nearly the same return per dollar. So if you're a solo developer or small team developing rapidly across multiple initiatives, the $100 price point is currently very good value. IMO.

The other thing the Max plan changed is which model I reach for. On Pro, I was cost-conscious about context — Sonnet was the practical choice. On Max 5x, I run Claude Opus 4.6 with 1M context about 80% of the time, dropping to Sonnet 4.6 or auto mode for the remaining 20%. Opus is a noticeably better reviewer, planner, and architectural thinker. Once the rate limit isn't breathing down your neck, the model choice becomes about capability, not conservation.

So good, in fact, that I can't seem to use it all. Which got me thinking.

## The gap between subscription and API

I learned probably in the first week of having a Claude subscription that you can't integrate it directly into an application you build. Use it for development? Yes. Use it in the product? No. For that, you need a Claude API key — which is easy to get — and Anthropic charges you per call. It's not a bad rate, but I'm sitting on unused capacity in a subscription I can't downgrade without dropping back to limits that would choke my development workflow.

The subscription includes Claude Code, which is a CLI tool. And a CLI tool is just a binary that takes input and produces output. Which means it's callable from scripts, workflows, and servers — not just your terminal.

That realization led me to build two things: an **n8n sub-workflow** for async operational tasks, and an **Express HTTP gateway** for synchronous app requests. Both follow the same pattern: try the Claude CLI first (subscription, $0 marginal cost), fall back gracefully to the Anthropic API (per-token billing) if the CLI fails.

## The pattern: CLI-first, API-fallback

The core idea is simple enough to fit on an index card:

```
Request comes in
  → Try Claude CLI (uses subscription)
    → Success? Return response with source: "cli"
    → Failed?  Call Anthropic API, return response with source: "api"
```

Every response includes a `source` field so the caller — and your logs — know which path served it. You can monitor your API fallback rate. The API fallback activates when the CLI isn't installed on the host, when the subscription is being rate-limited, or when the process can't access the authenticated session.

The two implementations serve different scopes, which is why both exist.

## Implementation 1: n8n sub-workflow (async operations)

My [n8n](https://n8n.io/) automation hub runs scheduled and webhook-triggered workflows — PR reviews, health monitors, dependency audits. Several of these need to call Claude. Rather than duplicating the CLI/API logic in every workflow, I built a reusable sub-workflow that any other workflow can call via n8n's Execute Workflow node.

### The flow

```
Workflow Input → Prepare Input → Call Claude CLI → Parse CLI Output
                                                        ↓
                                                 CLI Succeeded?
                                                  /          \
                                           [yes]              [no]
                                              ↓                 ↓
                                     Return CLI Result    Prepare API Fallback
                                                                ↓
                                                         Call Claude API
                                                                ↓
                                                         Parse API Output
```

### Input preparation and shell safety

The trickiest part is safely passing user-controlled text to a shell command inside n8n. The prompt could contain anything — code snippets, special characters, quotes, backticks. Interpolating that into a command string is an injection vulnerability.

The solution is two layers of encoding in the Prepare Input code node:

```javascript
// Model name is validated against a strict allowlist — it goes into the
// command string directly, so it must be safe
if (!/^[a-zA-Z0-9._-]+$/.test(model)) {
  throw new Error("Invalid model name: " + model);
}

// Prompt and system prompt are base64-encoded — they never touch
// the shell argument parser
const promptB64 = Buffer.from(userMessage).toString("base64");

// The PowerShell script decodes base64 and pipes to Claude CLI
let ps = '$ErrorActionPreference = "Stop"; ';
ps += "$b = [System.Convert]::FromBase64String('" + promptB64 + "'); ";
ps += "$prompt = [System.Text.Encoding]::UTF8.GetString($b); ";
ps += "Set-Location $env:USERPROFILE; ";
ps +=
  "$prompt | claude -p --model " +
  model +
  " --max-turns 1 --output-format text";

// Entire PowerShell script is UTF-16LE base64'd for -EncodedCommand
const encodedCmd = Buffer.from(ps, "utf16le").toString("base64");
const shellCommand =
  "powershell.exe -NoProfile -NonInteractive" +
  " -EncodedCommand " +
  encodedCmd;
```

The `Set-Location $env:USERPROFILE` before the Claude call is intentional — it prevents any `CLAUDE.md` project context file from leaking into what should be an isolated request. Without that, the CLI picks up whatever project context exists in n8n's working directory.

The `Buffer` global is available in n8n's Code node sandbox — it's not a `require()`, it's a sandbox global exposed by the n8n task runner.

### The API fallback path

If the CLI exits non-zero or returns empty, the If node routes to the fallback branch. The Prepare API Fallback node reaches back to the original inputs using n8n's upstream reference syntax:

```javascript
const original = $("Prepare Input").first().json;

return [
  {
    json: {
      claudePayload: {
        model: original.model,
        max_tokens: original.maxTokens,
        system: original.systemPrompt || "",
        messages: [{ role: "user", content: original.userMessage || "" }],
      },
    },
  },
];
```

This keeps the CLI success path clean — it only carries `{ text, source }` and doesn't need to forward the original inputs through every node.

### Calling the sub-workflow

Any workflow that needs Claude uses an Execute Workflow node pointed at the sub-workflow's ID (stored in an n8n environment variable):

```javascript
// Expression in the Execute Workflow node's workflowId field
={{ $env.CALL_CLAUDE_WORKFLOW_ID
   || (() => { throw new Error('CALL_CLAUDE_WORKFLOW_ID not set') })() }}
```

The inline throw means misconfiguration fails loudly at the Execute Workflow node rather than silently passing a null ID downstream.

Callers pass a simple object:

```json
{
  "systemPrompt": "You are an expert code reviewer...",
  "userMessage": "Review this pull request diff:\n...",
  "model": "claude-sonnet-4-6",
  "maxTokens": 2048
}
```

And receive `{ text, source }` back. The caller doesn't need to know or care whether the subscription or API served the response.

### n8n prerequisites

Two things to know if you're running this in your own n8n instance:

1. **`NODES_EXCLUDE=[]`** must be set in the n8n environment. n8n v2 disables the ExecuteCommand node by default for security. This sub-workflow requires it.
2. **The Claude CLI must be installed and authenticated** on the machine running n8n. Run `claude` once interactively to complete the auth flow before activating the workflow.

## Implementation 2: Express gateway (synchronous requests)

The n8n sub-workflow handles async operations well — cron-triggered reviews, webhook-driven analyses. But when an application needs a synchronous, real-time response from Claude, you want an HTTP endpoint, not a workflow execution queue.

The Express gateway is a lightweight HTTP server (~160 lines across three files) that exposes a single `POST /ask` endpoint:

```javascript
// claude.js — the core ask() function

async function ask({ prompt, system, model }) {
  // --- Attempt 1: Claude CLI (prompt piped via stdin) ---
  try {
    const stdout = await invokeCli({ prompt, system });
    const response = stdout.trim();
    if (!response) throw new Error("CLI returned empty response");
    return { response, source: "cli", model: "subscription" };
  } catch (cliErr) {
    const reason = cliErr.killed
      ? "timeout"
      : cliErr.code === "ENOENT"
        ? "not found"
        : cliErr.message;
    console.warn(`[claude] CLI failed (${reason}), falling back to API`);
  }

  // --- Attempt 2: Anthropic API ---
  if (!ANTHROPIC_API_KEY) {
    throw new Error("CLI unavailable and ANTHROPIC_API_KEY not set");
  }

  const resolvedModel = model || ANTHROPIC_MODEL;
  const body = {
    model: resolvedModel,
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  };
  if (system) body.system = system;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);

  const data = await res.json();
  const response = data.content?.[0]?.text?.trim();
  if (!response) throw new Error("API returned empty response");

  return { response, source: "api", model: resolvedModel };
}
```

### CLI invocation: stdin, not interpolation

The gateway went through an iteration on how it calls the CLI. The first version used PowerShell's `-EncodedCommand` — same approach as the n8n sub-workflow. But for a standalone server where you control the execution environment directly, there's a simpler and safer approach: pipe the prompt via stdin.

```javascript
function invokeCli({ prompt, system }) {
  return new Promise((resolve, reject) => {
    const args = ["/c", "claude", "-p", "-"];
    if (system) args.push("--append-system-prompt", system);

    const child = spawn("cmd.exe", args, {
      timeout: CLI_TIMEOUT_MS,
      cwd: os.homedir(),
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    // ... collect stdout, stderr ...

    // Prompt goes through stdin — never touches the command string
    child.stdin.write(prompt);
    child.stdin.end();
  });
}
```

The `-` flag tells Claude to read from stdin. The prompt never appears in the process argument list, never gets parsed by a shell, never needs escaping. This is the simplest injection-proof approach when you have direct control over process spawning.

The `cwd: os.homedir()` serves the same purpose as in the n8n version — preventing CLAUDE.md interference.

### Authentication and safety

The gateway sits on localhost and authenticates callers with a bearer token:

```javascript
function tokensMatch(a, b) {
  if (!a || !b) return false;
  const key = crypto.randomBytes(32);
  const hmacA = crypto.createHmac("sha256", key).update(a).digest();
  const hmacB = crypto.createHmac("sha256", key).update(b).digest();
  return crypto.timingSafeEqual(hmacA, hmacB);
}
```

Constant-time comparison via HMAC digests — not `===`. This prevents timing side-channels on the API key. Input lengths are capped at 100K characters. Error messages from the Anthropic API are sanitized before returning to the caller so internal details don't leak through.

### Calling it from any app

Any HTTP client can use the gateway:

```bash
curl -X POST http://localhost:3131/ask \
  -H "Authorization: Bearer $GATEWAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain the builder pattern in C#", "system": "Be concise"}'
```

Response:

```json
{
  "response": "The builder pattern separates...",
  "source": "cli",
  "model": "subscription",
  "durationMs": 2847
}
```

The `source` field tells you whether it used the subscription or fell back to the API. In a production app you could log this, alert on high API fallback rates, or surface it in a dashboard.

## Why two implementations?

They look similar but serve different concerns:

|                       | n8n Sub-Workflow                                  | Express Gateway                       |
| --------------------- | ------------------------------------------------- | ------------------------------------- |
| **Use case**          | Async operational workflows                       | Synchronous app integration           |
| **Trigger**           | Called by other n8n workflows                     | HTTP POST from any client             |
| **Latency**           | Acceptable (n8n execution overhead)               | Low (direct process spawn)            |
| **Auth**              | n8n's internal workflow permissions               | Bearer token with HMAC comparison     |
| **Shell safety**      | Base64 + EncodedCommand (n8n sandbox constraints) | stdin piping (direct spawn)           |
| **Where it runs**     | Inside n8n's execution engine                     | Standalone Express server             |
| **Example consumers** | PR review workflow, dependency audit              | Desktop apps, scripts, other services |

The n8n version exists because n8n's Code nodes can't spawn processes directly — you need the ExecuteCommand node, which means you need to serialize your entire invocation into a single command string. That constraint forces the base64 encoding dance. The Express version doesn't have that constraint, so it uses the simpler stdin approach.

## What I actually saved

I don't have precise numbers because the CLI doesn't report token usage the way the API does. But here's the rough math using current Anthropic API pricing.

At the time of writing, Claude Opus 4.6 costs $5 per million input tokens and $25 per million output tokens. Sonnet 4.6 is $3/$15. Since I use Opus for about 80% of my work, that's the relevant rate for these estimates.

My PR review workflow runs on every pull request across four active repos. Each review sends a diff (often 2K–8K tokens of input) and asks for a structured code review (typically 1K–2K tokens of output). At Opus rates, a mid-sized review costs roughly $0.03–$0.07 per call. I merge maybe 30–40 PRs a week across projects. Call it $1.50–$3/week just for automated PR reviews.

The health monitors, dependency audits, and ad-hoc gateway calls add up. A dependency audit that scans multiple repos and asks Claude to assess risk might run 10K+ input tokens through Opus — that's $0.05 in input alone, plus output. Before the CLI-first pattern, I was looking at $20–$40/month in API costs on top of my $100 subscription — for automation I was running specifically because I had the subscription. The irony wasn't lost on me.

Now that spend is approximately zero. The API fallback fires rarely enough that it doesn't register on my Anthropic billing dashboard.

## The broader point

If you're paying for a Claude subscription and also paying for API calls for your own tooling, you're paying twice for the same capability. The CLI is a bridge between those two worlds. It's not documented as an API — it's a development tool — but `claude -p --output-format text` behaves exactly like a local API endpoint that happens to be authenticated against your subscription.

Is this the intended use case? Anthropic hasn't said. The CLI is clearly designed for interactive development, and using it as an automation backend is a creative interpretation. It could change. The terms of service could tighten. The rate limits could apply differently to CLI-piped requests. I wouldn't build a commercial SaaS on this pattern.

But for personal automation, side projects, and developer tooling? It's the difference between a $100/month flat cost and $100/month plus $20–$40 in variable API billing — at Opus 4.6 rates — that scales with exactly the kind of usage your subscription was supposed to cover.

The code is straightforward. The security considerations are real but manageable. And the `source` field on every response means you always know exactly what's happening, and you can fall back to the API gracefully if the subscription path ever stops working.
