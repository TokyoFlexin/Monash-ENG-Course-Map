#!/usr/bin/env node
// Compares a unit's Handbook facts between two years and reports only SUBSTANTIVE changes.
//
// Why this exists: every data error this project has had traces to one cause — Monash changes unit
// rules year to year, and research done against one vintage silently rots. Two examples that
// actually bit us:
//   - ECE3161 was recorded Semester 1 from the 2024 Handbook; it is Semester 2 now.
//   - ENG2005 required "ENG1005 AND (ENG1060 OR ENG1014)" in 2025 and requires "ENG1005" alone now.
//     The old catalog entry was RIGHT for 2025 and rotted — it was never a fabrication.
//
// The governing rule at Monash: a unit's requisites are those published for the year you ENROL in
// that unit, while your course's requirements lock at the year you COMMENCED. So the catalog tracks
// the current Handbook for unit rules, and this script shows what changed since a student's
// commencing year — the units where someone who enrolled earlier sat under a different rule.
//
// Usage: node scripts/check-vintage-drift.mjs --from 2025 [--to current] [--codes-from data/x.json] [CODE...]

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
let from = null, to = 'current';
const codes = [], files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from') from = args[++i];
  else if (args[i] === '--to') to = args[++i];
  else if (args[i] === '--codes-from') files.push(args[++i]);
  else codes.push(args[i].toUpperCase());
}
if (!from) { console.error('usage: node scripts/check-vintage-drift.mjs --from 2025 [--to current] [--codes-from f.json] [CODE...]'); process.exit(2); }
for (const f of files) {
  codes.push(...(JSON.parse(readFileSync(f, 'utf8')).units || []).map(u => u.code));
}
const list = [...new Set(codes)];

function harvest(year) {
  const out = execFileSync(process.execPath,
    [path.join(__dirname, 'harvest-handbook.mjs'), '--year', year, '--delay', '100', ...list],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  const parsed = JSON.parse(out);
  return Object.fromEntries(parsed.units.filter(u => !u.error).map(u => [u.code, u]));
}

// Compare requisites by STRUCTURE, not by the Handbook's arbitrary ordering. A group is a set of
// alternatives; the rule is a set of groups. "(A or B) AND C" equals "C AND (B or A)".
function norm(req) {
  if (!req || !req.groups || !req.groups.length) return '';
  return req.groups.map(g => [...new Set(g)].sort().join('|')).sort().join(' & ');
}

console.error(`Harvesting ${list.length} units for ${from} ...`);
const A = harvest(from);
console.error(`Harvesting ${list.length} units for ${to} ...`);
const B = harvest(to);

const drift = [];
for (const code of list) {
  const a = A[code], b = B[code];
  if (!a && !b) { drift.push({ code, field: 'existence', from: 'absent', to: 'absent' }); continue; }
  if (!a) { drift.push({ code, field: 'existence', from: `not in ${from} Handbook`, to: 'exists' }); continue; }
  if (!b) { drift.push({ code, field: 'existence', from: 'exists', to: `not in ${to} Handbook (retired)` }); continue; }
  for (const k of ['prerequisite', 'corequisite', 'prohibition']) {
    const x = norm(a[k]), y = norm(b[k]);
    if (x !== y) drift.push({ code, field: k, from: a[k]?.expression || '(none)', to: b[k]?.expression || '(none)' });
  }
  if (a.semesterOfferedClayton !== b.semesterOfferedClayton) {
    drift.push({ code, field: 'semesterOffered (Clayton)', from: a.semesterOfferedClayton, to: b.semesterOfferedClayton });
  }
  if (a.title.trim() !== b.title.trim()) drift.push({ code, field: 'title', from: a.title, to: b.title });
  if (String(a.creditPoints) !== String(b.creditPoints)) drift.push({ code, field: 'creditPoints', from: a.creditPoints, to: b.creditPoints });
}

console.log(`\nVintage drift: ${from} -> ${to}, ${list.length} units compared.`);
console.log(`Ordering-only differences are ignored; these are real changes.\n`);
if (!drift.length) { console.log('  none'); process.exit(0); }
for (const d of drift) {
  console.log(`  ${d.code.padEnd(8)} ${d.field}`);
  console.log(`      ${String(from).padEnd(8)}: ${d.from}`);
  console.log(`      ${String(to).padEnd(8)}: ${d.to}`);
}
console.log(`\n-> ${drift.length} substantive change(s) across ${new Set(drift.map(d => d.code)).size} unit(s).`);
