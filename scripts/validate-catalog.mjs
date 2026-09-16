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

// A unit whose canonical year/semester slot deliberately sits in a semester it ISN'T taught.
// This is ONLY legitimate when the real Handbook offering and the real prerequisite chain
// genuinely conflict inside a 4-year sequence — the planner then shows a live off-semester flag
// (warn-not-block) rather than the data hiding the tension. Every entry needs a reason; anything
// not listed here is treated as a data bug, because that's exactly the class of error a real user
// caught in the Civil data ("Structural design shows Semester 2, it's actually Semester 1").
const PLACEMENT_EXCEPTIONS = new Map([
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
    perFile.push({ file: f, units: parsed.units, meta: parsed._meta || {} });
  }
  return perFile;
}

function main() {
  const perFile = loadCatalogFiles();
  const problems = [];

  for (const pf of perFile) {
    if (pf.error) problems.push(`[${pf.file}] ${pf.error}`);
  }

  const allUnits = perFile.flatMap(pf => pf.units.map(u => ({ ...u, __file: pf.file, __meta: pf.meta || {} })));
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

  // ---------------------------------------------------------------------------
  // Placement sanity. Structural validity isn't enough — the Civil round shipped
  // structurally-perfect JSON that was factually wrong about when units run. These
  // three checks make that class of mistake fail the build instead of reaching a user.
  // ---------------------------------------------------------------------------
  const seq = u => u.year * 2 + u.semester;          // Y2S1 -> 5, Y2S2 -> 6, ...
  const slot = u => `Y${u.year}S${u.semester}`;
  const acknowledged = [];

  // 1. A unit's canonical slot must be a semester the unit is actually taught in.
  for (const u of allUnits) {
    const offered = String(u.semesterOffered);
    if (offered === 'both' || offered === 'unknown') continue;
    if (offered === String(u.semester)) continue;
    const reason = PLACEMENT_EXCEPTIONS.get(u.code);
    const msg = `${u.code} (${u.title}): placed ${slot(u)} but semesterOffered is "${offered}"`;
    if (reason) {
      acknowledged.push(`[${u.__file}] ${msg}\n     └─ ${reason}`);
    } else {
      problems.push(`[${u.__file}] ${msg} — either the placement or the offering is wrong. Fix it, or add ${u.code} to PLACEMENT_EXCEPTIONS with a verified reason.`);
    }
  }

  // 2. Every prerequisite must sit STRICTLY earlier in the sequence than the unit needing it.
  //    (Same-semester is a corequisite, not a prerequisite.)
  for (const u of allUnits) {
    for (const code of u.prerequisites || []) {
      const pre = byCode.get(code);
      if (!pre) continue; // dangling refs already reported above
      if (seq(pre) >= seq(u)) {
        problems.push(`[${u.__file}] ${u.code} is at ${slot(u)} but its prerequisite ${code} is at ${slot(pre)} — a prerequisite must finish in an earlier semester.`);
      }
    }
  }

  // 3. A corequisite may be earlier or same-semester, never later.
  for (const u of allUnits) {
    for (const code of u.corequisites || []) {
      const co = byCode.get(code);
      if (!co) continue;
      if (seq(co) > seq(u)) {
        problems.push(`[${u.__file}] ${u.code} is at ${slot(u)} but its corequisite ${code} is at ${slot(co)} — a corequisite can't be placed later.`);
      }
    }
  }

  // 4. Provenance. A file opts in with "_meta": { "provenance": "per-unit" }; every unit in it
  //    must then carry the exact Handbook URL it was read from and the date it was checked, so
  //    stale data is visible in the data itself rather than inferred from a git log. Files
  //    predating this convention (file-level _meta.sources only) are left alone until re-audited.
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  for (const u of allUnits) {
    if (u.__meta?.provenance !== 'per-unit') continue;
    if (!u.sourceUrl) {
      problems.push(`[${u.__file}] ${u.code}: missing "sourceUrl" (file declares provenance:"per-unit")`);
    } else if (!/^https:\/\/handbook\.monash\.edu\//.test(u.sourceUrl)) {
      problems.push(`[${u.__file}] ${u.code}: sourceUrl "${u.sourceUrl}" isn't a handbook.monash.edu URL`);
    }
    if (!u.verifiedOn) {
      problems.push(`[${u.__file}] ${u.code}: missing "verifiedOn" date (file declares provenance:"per-unit")`);
    } else if (!ISO_DATE.test(u.verifiedOn)) {
      problems.push(`[${u.__file}] ${u.code}: verifiedOn "${u.verifiedOn}" must be YYYY-MM-DD`);
    }
  }

  // ---------------------------------------------------------------------------
  // Placement OVERRIDES get the same scrutiny as defaults. A unit can carry a
  // `placements` map keyed by course code ("E3005") or course+specialisation
  // ("E3001:civil"), because a progression map is published per course AND
  // specialisation — ENG2005 is Y2S1 in E3001 Electrical but Y2S2 in E3001 Civil.
  // Without this, an override could put a unit in a semester it isn't taught, or
  // before its own prerequisite, and nothing would catch it.
  // ---------------------------------------------------------------------------
  const tracks = new Set();
  for (const u of allUnits) for (const k of Object.keys(u.placements || {})) tracks.add(k);

  function slotIn(u, track) {
    const p = u.placements || {};
    if (p[track]) return p[track];
    const course = track.includes(':') ? track.split(':')[0] : track;
    if (p[course]) return p[course];
    return { year: u.year, semester: u.semester };
  }

  for (const track of tracks) {
    for (const u of allUnits) {
      const mine = slotIn(u, track);
      const offered = String(u.semesterOffered);
      if (offered !== 'both' && offered !== 'unknown' && offered !== String(mine.semester)
          && u.placements && (u.placements[track] || u.placements[track.split(':')[0]])) {
        if (!PLACEMENT_EXCEPTIONS.has(u.code)) {
          problems.push(`[${u.__file}] ${u.code}: placements["${track}"] puts it at Y${mine.year}S${mine.semester}, but semesterOffered is "${offered}"`);
        }
      }
      const mineSeq = mine.year * 2 + mine.semester;
      for (const code of u.prerequisites || []) {
        const pre = byCode.get(code);
        if (!pre) continue;
        const theirs = slotIn(pre, track);
        if (theirs.year * 2 + theirs.semester >= mineSeq) {
          problems.push(`[${u.__file}] under "${track}": ${u.code} at Y${mine.year}S${mine.semester} but prerequisite ${code} at Y${theirs.year}S${theirs.semester}`);
        }
      }
      for (const code of u.corequisites || []) {
        const co = byCode.get(code);
        if (!co) continue;
        const theirs = slotIn(co, track);
        if (theirs.year * 2 + theirs.semester > mineSeq) {
          problems.push(`[${u.__file}] under "${track}": ${u.code} at Y${mine.year}S${mine.semester} but corequisite ${code} at Y${theirs.year}S${theirs.semester}`);
        }
      }
    }
  }
  if (tracks.size) console.log(`Placement tracks validated: ${[...tracks].sort().join(', ')}`);

  // report
  const disciplines = [...new Set(allUnits.map(u => u.discipline).filter(Boolean))];
  console.log(`Checked ${allUnits.length} units across ${perFile.length} files. Disciplines: ${disciplines.join(', ')}`);
  if (acknowledged.length) {
    console.log(`\n⚠ ${acknowledged.length} acknowledged placement exception(s) — allowed, but never silent:\n`);
    acknowledged.forEach(a => console.log(' - ' + a));
    console.log('');
  }
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
