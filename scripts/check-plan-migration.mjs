#!/usr/bin/env node
// Guards the CODE_RENAMES map in index.html.
//
// Why this exists: ECE3122 was renamed to ECE3121 in a Handbook re-audit. Saved plans still held
// the old code, byCode() returned undefined, unitCard() threw, and renderGrid() aborted mid-loop —
// silently truncating the plan from Year 4 Sem 2 onward. Any future re-audit that renames a unit
// can do the same, so every code that leaves the catalog has to be accounted for here.
//
// Run: node scripts/check-plan-migration.mjs

import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

const dataFiles = (rev) =>
  (rev ? git('ls-tree', '--name-only', rev, 'data/').split('\n') : readdirSync(join(root, 'data')).map(f => `data/${f}`))
    .filter(f => f.endsWith('.json') && !f.endsWith('manifest.json'));

function codesAt(rev) {
  const codes = new Set();
  for (const f of dataFiles(rev)) {
    let json;
    try {
      json = JSON.parse(rev ? git('show', `${rev}:${f}`) : readFileSync(join(root, f), 'utf8'));
    } catch { continue; }
    for (const u of json.units || []) codes.add(u.code);
  }
  return codes;
}

// CODE_RENAMES lives in index.html; pull it out rather than duplicating it here, so the check
// can never drift from the map it is checking.
const html = readFileSync(join(root, 'index.html'), 'utf8');
const block = html.match(/const CODE_RENAMES = \{([\s\S]*?)\};/);
if (!block) {
  console.error('FAIL  could not find CODE_RENAMES in index.html');
  process.exit(1);
}
const renames = Object.fromEntries(
  [...block[1].matchAll(/([A-Z]{2,4}\d{4})\s*:\s*'([A-Z]{2,4}\d{4})'/g)].map(m => [m[1], m[2]])
);

const live = codesAt(null);
const fails = [];

for (const [from, to] of Object.entries(renames)) {
  if (!live.has(to)) fails.push(`${from} -> ${to}: target ${to} is not in any data file`);
  if (live.has(from)) fails.push(`${from} -> ${to}: ${from} is still a live unit, the rename would shadow it`);
}

// Every code that has ever been in the catalog but is gone from HEAD must be either renamed here
// or a deliberate deletion. Deletions are fine (the planner drops them with a visible notice);
// this just makes sure none of them is an unnoticed rename.
const everSeen = new Set();
for (const rev of git('rev-list', 'HEAD').trim().split('\n')) {
  for (const c of codesAt(rev)) everSeen.add(c);
}
const retired = [...everSeen].filter(c => !live.has(c)).sort();
const unhandled = retired.filter(c => !(c in renames));

for (const f of fails) console.error(`FAIL  ${f}`);
console.log(`\n${Object.keys(renames).length} rename(s) mapped, ${retired.length} code(s) retired from the catalog.`);
if (unhandled.length) {
  console.log(`\nRetired with no rename entry (fine if genuinely deleted, add a CODE_RENAMES entry if renamed):`);
  for (const c of unhandled) console.log(`  ${c}`);
}
if (fails.length) process.exit(1);
console.log('\nOK  every rename target resolves and no rename shadows a live unit.');
