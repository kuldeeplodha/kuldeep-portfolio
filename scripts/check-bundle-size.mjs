#!/usr/bin/env node
// check-bundle-size.mjs — T-QA-10 WS-4
// Zero-dep: uses Node built-in zlib.gzipSync only. ~30 lines of logic.
import { gzipSync } from 'zlib';
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const DIST_ASSETS = 'dist/assets';
const budget = JSON.parse(readFileSync('.perf-budget.json', 'utf8'));
const { budgets, warnThreshold } = budget;

const files = readdirSync(DIST_ASSETS);
const gzip = (name) => gzipSync(readFileSync(join(DIST_ASSETS, name))).length;

// Build map: ext -> [{ name, size }]
const byType = { js: [], css: [] };
for (const f of files) {
  const ext = extname(f).slice(1);
  if (ext === 'js' || ext === 'css') byType[ext].push({ name: f, size: gzip(f) });
}

let failed = false;
for (const b of budgets) {
  const pool = byType[b.type] ?? [];
  const matched = b.aggregate ? pool : pool.filter(f => new RegExp(b.pattern).test(f.name));
  const total = matched.reduce((s, f) => s + f.size, 0);
  const pct = total / b.maxBytes;
  const kb = (n) => (n / 1024).toFixed(1) + ' KB';
  const status = pct > 1 ? '❌ FAIL' : pct >= warnThreshold ? '⚠️  WARN' : '✅ OK  ';
  console.log(`${status}  ${b.name.padEnd(30)} ${kb(total).padStart(9)} / ${kb(b.maxBytes)} (${(pct * 100).toFixed(1)}%)`);
  if (pct > 1) failed = true;
}

if (failed) { console.error('\nBundle size budget exceeded — build rejected.'); process.exit(1); }
console.log('\nAll bundles within budget.');
