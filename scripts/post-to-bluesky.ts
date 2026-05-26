/**
 * Post to Bluesky via the solo-ops-agents `ops` CLI.
 *
 * This is lwalden.dev's first consumer integration of solo-ops-agents
 * (portfolio social automation). It shells out to the `ops` CLI rather than
 * importing it — the Phase 1 consumption contract (see solo-ops-agents
 * DECISIONS.md ADR-001; a programmatic entrypoint is deferred to Phase 3).
 *
 * Flow: draft -> review (dry-run) -> post. The live post step only runs when
 * --confirm is passed, so an accidental invocation can never publish.
 *
 * Usage:
 *   # Draft + dry-run review only (safe, never posts):
 *   npx tsx scripts/post-to-bluesky.ts --body "Hello from lwalden.dev"
 *
 *   # Draft, review, then actually post:
 *   npx tsx scripts/post-to-bluesky.ts --body "Hello from lwalden.dev" --confirm
 *
 * Requirements:
 *   - BW_SESSION set in the environment (the ops CLI reads Bluesky creds from
 *     the ClimbOn Co Bitwarden vault at runtime).
 *   - solo-ops-agents built (`npm run build` there) so dist/cli.js exists.
 *     Override its location with OPS_CLI=/abs/path/to/dist/cli.js if the repos
 *     are not siblings under the same parent directory.
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OPS_CLI =
  process.env.OPS_CLI ??
  resolve(repoRoot, '..', 'solo-ops-agents', 'dist', 'cli.js');

interface Args {
  body: string;
  confirm: boolean;
}

function parseArgs(argv: string[]): Args {
  let body = '';
  let confirm = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--body') body = argv[++i] ?? '';
    else if (argv[i] === '--confirm') confirm = true;
  }
  if (!body.trim()) {
    console.error('error: --body "<text>" is required');
    process.exit(2);
  }
  return { body, confirm };
}

/** Invoke `node <ops-cli> <args>`, streaming output, returning captured stdout. */
function ops(args: string[]): string {
  const result = spawnSync(process.execPath, [OPS_CLI, ...args], {
    encoding: 'utf8',
    env: process.env,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    console.error(`error: ops ${args[0]} exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }
  return result.stdout ?? '';
}

function main(): void {
  const { body, confirm } = parseArgs(process.argv.slice(2));

  if (!existsSync(OPS_CLI)) {
    console.error(
      `error: ops CLI not found at ${OPS_CLI}\n` +
        'Build solo-ops-agents (npm run build) or set OPS_CLI to dist/cli.js.'
    );
    process.exit(1);
  }

  // 1. Draft
  const draftOut = ops(['draft', '--platform', 'bluesky', '--body', body]);
  const idMatch = /Draft (\d+) created/.exec(draftOut);
  if (!idMatch) {
    console.error('error: could not parse draft id from ops output');
    process.exit(1);
  }
  const draftId = idMatch[1];

  // 2. Review — dry-run rehearsal (validates, never posts)
  console.log('\n--- review (dry-run) ---');
  ops(['post', '--id', draftId, '--dry-run']);

  // 3. Post — only with explicit confirmation
  if (!confirm) {
    console.log(
      `\nReview only. Re-run with --confirm to post draft ${draftId} live.`
    );
    return;
  }
  console.log('\n--- posting live ---');
  ops(['post', '--id', draftId]);
}

main();
