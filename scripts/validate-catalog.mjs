#!/usr/bin/env node
// Validates every data/*.json catalog file against the shape the planner (index.html) expects.
// Run: node scripts/validate-catalog.mjs
// Exits non-zero (and prints every problem found) if anything is wrong — no dependencies, so it
// runs the same way for whoever/whatever adds the next discipline.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// Documented, deliberate external gaps — a prereq/coreq/prohibition code that's real but
// genuinely outside this catalog (e.g. an FIT unit never added because no major needs it as
// a first-class catalog entry). Add to this list ONLY with a comment saying why; anything else
// dangling is a real bug.
const KNOWN_EXTERNAL_GAPS = new Set([
  'FIT2086', // FIT3154's prereq — real Handbook rule, but FIT2086 itself was never added to any
             // major's catalog (see PROGRESS.md "Business Analytics" section).
]);

const VALID_TYPES = new Set(['core', 'specialisation', 'elective', 'commerce', 'breadth']);
const VALID_OFFERED = new Set(['1', '2', 'both', 'unknown']);

function loadCatalogFiles() {
  // Only the files manifest.json actually lists — that's the same list the live app loads via
  // loadCatalog(), so validation checks exactly what ships, and manifest.json itself (which has
  // no "units" array) isn't mistaken for a catalog file.
  const manifest = JSON.parse(readFileSync(path.join(DATA_DIR, 'manifest.json'), 'utf8'));
  const files = manifest.files;
  const perFile = [];
  for (const f of files) {
    const raw = readFileSync(path.join(DATA_DIR, f), 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      perFile.push({ file: f, error: `invalid JSON: ${e.message}`, units: [] });
      continue;
    }
    if (!Array.isArray(parsed.units)) {
      perFile.push({ file: f, error: 'no top-level "units" array', units: [] });
      continue;
    }
    perFile.push({ file: f, units: parsed.units });
  }
  return perFile;
}

function main() {
  const perFile = loadCatalogFiles();
  const problems = [];

  for (const pf of perFile) {
    if (pf.error) problems.push(`[${pf.file}] ${pf.error}`);
  }

  const allUnits = perFile.flatMap(pf => pf.units.map(u => ({ ...u, __file: pf.file })));
  const byCode = new Map();

  // required fields + duplicate codes
  const REQUIRED_FIELDS = ['code', 'title', 'creditPoints', 'year', 'semester', 'type', 'discipline', 'semesterOffered'];
  for (const u of allUnits) {
    for (const field of REQUIRED_FIELDS) {
      if (u[field] === undefined || u[field] === null || u[field] === '') {
        problems.push(`[${u.__file}] ${u.code || '(no code)'}: missing required field "${field}"`);
      }
    }
    for (const arrField of ['prerequisites', 'corequisites', 'prohibitions']) {
      if (!Array.isArray(u[arrField])) {
        problems.push(`[${u.__file}] ${u.code}: "${arrField}" must be an array (got ${typeof u[arrField]})`);
      }
    }
    if (u.type && !VALID_TYPES.has(u.type)) {
      problems.push(`[${u.__file}] ${u.code}: unknown type "${u.type}" (expected one of ${[...VALID_TYPES].join(', ')})`);
    }
    if (u.semesterOffered && !VALID_OFFERED.has(String(u.semesterOffered))) {
      problems.push(`[${u.__file}] ${u.code}: unknown semesterOffered "${u.semesterOffered}" (expected 1, 2, both, or unknown)`);
    }
    if (u.year !== undefined && (u.year < 1 || u.year > 5)) {
      problems.push(`[${u.__file}] ${u.code}: year ${u.year} out of expected range 1-5`);
    }
    if (u.semester !== undefined && ![1, 2].includes(u.semester)) {
      problems.push(`[${u.__file}] ${u.code}: semester ${u.semester} must be 1 or 2`);
    }
    if (u.code) {
      if (byCode.has(u.code)) {
        problems.push(`DUPLICATE CODE: ${u.code} appears in both ${byCode.get(u.code).__file} and ${u.__file}`);
      } else {
        byCode.set(u.code, u);
      }
    }
  }

  // dangling references — prerequisites/corequisites must resolve to a real catalog unit
  // (the student needs to be able to plan against them). Prohibitions deliberately are NOT
  // checked here: the Handbook routinely prohibits combinations with equivalent units at other
  // campuses/degrees (Caulfield/Malaysia codes, old superseded codes) that were never going to
  // be catalog entries — that's expected, not a gap.
  for (const u of allUnits) {
    for (const [field, arr] of [
      ['prerequisites', u.prerequisites],
      ['corequisites', u.corequisites],
    ]) {
      if (!Array.isArray(arr)) continue;
      for (const refCode of arr) {
        if (!byCode.has(refCode) && !KNOWN_EXTERNAL_GAPS.has(refCode)) {
          problems.push(`[${u.__file}] ${u.code}: ${field} references "${refCode}", which doesn't exist in any catalog file and isn't in KNOWN_EXTERNAL_GAPS`);
        }
      }
    }
  }

  // cycle detection across prerequisites ONLY. A prerequisite cycle (A needs B needs A) is a
  // real bug — it's impossible to ever satisfy. A corequisite "cycle" between two units that
  // simply require each other (take both in the same semester, e.g. ENG4701 <-> ENG0001) is a
  // normal, valid pattern, not a bug — so corequisites are deliberately excluded here.
  const graph = new Map();
  for (const u of allUnits) {
    if (!u.code) continue;
    graph.set(u.code, (u.prerequisites || []).filter(c => byCode.has(c)));
  }
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map([...byCode.keys()].map(c => [c, WHITE]));
  const stack = [];
  function dfs(code) {
    color.set(code, GRAY);
    stack.push(code);
    for (const next of graph.get(code) || []) {
      if (color.get(next) === GRAY) {
        const cycleStart = stack.indexOf(next);
        problems.push(`CYCLE: ${stack.slice(cycleStart).concat(next).join(' -> ')}`);
      } else if (color.get(next) === WHITE) {
        dfs(next);
      }
    }
    stack.pop();
    color.set(code, BLACK);
  }
  for (const code of byCode.keys()) {
    if (color.get(code) === WHITE) dfs(code);
  }

  // report
  const disciplines = [...new Set(allUnits.map(u => u.discipline).filter(Boolean))];
  console.log(`Checked ${allUnits.length} units across ${perFile.length} files. Disciplines: ${disciplines.join(', ')}`);
  if (problems.length === 0) {
    console.log('✔ No problems found.');
    process.exit(0);
  } else {
    console.log(`✘ ${problems.length} problem(s):\n`);
    problems.forEach(p => console.log(' - ' + p));
    process.exit(1);
  }
}

main();
