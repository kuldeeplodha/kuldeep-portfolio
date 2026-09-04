#!/usr/bin/env node
/**
 * a11y-summary.mjs
 *
 * Reads all JSON files produced by the accessibility e2e suite from
 * test-results/a11y/ and writes an aggregated Markdown report to stdout.
 *
 * In CI this is piped to $GITHUB_STEP_SUMMARY:
 *   node scripts/a11y-summary.mjs >> "$GITHUB_STEP_SUMMARY"
 *
 * It exits with code 0 even when violations exist — CI failure is handled by
 * the Playwright hard gate (expect(violations).toEqual([])), not by this script.
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const RESULTS_DIR = 'test-results/a11y'

if (!existsSync(RESULTS_DIR)) {
  console.log('## ♿ Accessibility Report\n\n> No a11y results found — suite may not have run.\n')
  process.exit(0)
}

const files = readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json'))

if (files.length === 0) {
  console.log('## ♿ Accessibility Report\n\n> No a11y result files found in `test-results/a11y/`.\n')
  process.exit(0)
}

/** @type {Map<string, {impact: string, nodes: number, pages: string[]}>} */
const violationMap = new Map()
/** @type {Map<string, {nodes: number, pages: string[]}>} */
const incompleteMap = new Map()

const pageSummaries = []
let totalViolationNodes = 0
let totalIncompleteNodes = 0

for (const file of files.sort()) {
  const raw = JSON.parse(readFileSync(join(RESULTS_DIR, file), 'utf8'))
  const label = `${raw.page} / ${raw.viewport}`

  const violationCount = raw.violations.reduce((s, v) => s + v.nodes.length, 0)
  const passCount = raw.passes.reduce((s, v) => s + v.nodes.length, 0)
  const incompleteCount = raw.incomplete.reduce((s, v) => s + v.nodes.length, 0)

  totalViolationNodes += violationCount
  totalIncompleteNodes += incompleteCount

  const status = violationCount === 0 ? '✅' : '❌'
  pageSummaries.push({ label, status, violationCount, passCount, incompleteCount, url: raw.url })

  for (const v of raw.violations) {
    const key = v.id
    const entry = violationMap.get(key) ?? { impact: v.impact ?? 'unknown', nodes: 0, pages: [] }
    entry.nodes += v.nodes.length
    if (!entry.pages.includes(label)) entry.pages.push(label)
    violationMap.set(key, entry)
  }

  for (const v of raw.incomplete) {
    const key = v.id
    const entry = incompleteMap.get(key) ?? { nodes: 0, pages: [] }
    entry.nodes += v.nodes.length
    if (!entry.pages.includes(label)) entry.pages.push(label)
    incompleteMap.set(key, entry)
  }
}

const overallStatus = totalViolationNodes === 0 ? '✅ PASS' : '❌ FAIL'
const lines = []

lines.push('## ♿ Accessibility Report\n')
lines.push(`**Overall: ${overallStatus}** — ${files.length} result file(s) analyzed\n`)

// Per-page summary table
lines.push('### Per-page summary\n')
lines.push('| Page / Viewport | Status | Violations (nodes) | Passes (nodes) | Incomplete (nodes) |')
lines.push('|---|---|---|---|---|')
for (const { label, status, violationCount, passCount, incompleteCount } of pageSummaries) {
  lines.push(`| ${label} | ${status} | ${violationCount} | ${passCount} | ${incompleteCount} |`)
}

// Violation breakdown
if (violationMap.size > 0) {
  lines.push('\n### Violation breakdown\n')
  lines.push('| Rule | Impact | Nodes | Pages |')
  lines.push('|---|---|---|---|')

  const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3, unknown: 4 }
  const sorted = [...violationMap.entries()].sort(
    ([, a], [, b]) =>
      (impactOrder[a.impact] ?? 9) - (impactOrder[b.impact] ?? 9) || b.nodes - a.nodes,
  )

  for (const [ruleId, { impact, nodes, pages }] of sorted) {
    const impactBadge =
      impact === 'critical'
        ? '🔴 critical'
        : impact === 'serious'
          ? '🟠 serious'
          : impact === 'moderate'
            ? '🟡 moderate'
            : impact === 'minor'
              ? '🔵 minor'
              : impact
    lines.push(`| \`${ruleId}\` | ${impactBadge} | ${nodes} | ${pages.join(', ')} |`)
  }
}

// Incomplete (needs review) breakdown
if (incompleteMap.size > 0) {
  lines.push('\n### Incomplete (needs manual review)\n')
  lines.push('| Rule | Nodes | Pages |')
  lines.push('|---|---|---|')
  const sortedIncomplete = [...incompleteMap.entries()].sort(([, a], [, b]) => b.nodes - a.nodes)
  for (const [ruleId, { nodes, pages }] of sortedIncomplete) {
    lines.push(`| \`${ruleId}\` | ${nodes} | ${pages.join(', ')} |`)
  }
}

lines.push('\n> JSON artifacts uploaded to CI under `a11y-results/`.')

console.log(lines.join('\n'))
