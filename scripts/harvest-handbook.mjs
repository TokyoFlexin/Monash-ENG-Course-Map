#!/usr/bin/env node
// Pulls authoritative unit facts straight from the Monash Handbook's own structured payload.
//
// Why this exists: the Civil data shipped wrong because research read the Handbook as PROSE —
// eyeballing an "Offerings" table for semesters, and hand-collapsing "A or B and C" requisite
// sentences into a flat list. Both are lossy and both produced real errors a student caught.
// The Handbook is a Next.js app whose pages embed a __NEXT_DATA__ blob containing the actual
// requisite tree (with real AND/OR containers), the real offering rows, and the enrolment rules
// as data. Reading that is not scraping-by-guesswork — it's the same source the page renders.
//
// Usage:
//   node scripts/harvest-handbook.mjs ECE2071 ECE3161 ...
//   node scripts/harvest-handbook.mjs --codes-from data/electrical.json
//   node scripts/harvest-handbook.mjs --year 2025 ECE2071      (default year: "current")
//   ... --out harvested.json
//
// Output is DESCRIPTIVE (what the Handbook says), never prescriptive — it deliberately does not
// emit year/semester placement, because that comes from the course progression map, not the unit
// page. Mixing the two is how inferred sequencing got mistaken for Handbook fact last time.

const BASE = 'https://handbook.monash.edu';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36';

function parseArgs(argv) {
  const opts = { year: 'current', codes: [], out: null, codesFrom: [], delayMs: 250 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--year') opts.year = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--codes-from') opts.codesFrom.push(argv[++i]);
    else if (a === '--delay') opts.delayMs = Number(argv[++i]);
    else if (a.startsWith('--')) throw new Error(`unknown flag ${a}`);
    else opts.codes.push(a.toUpperCase());
  }
  return opts;
}

// ---- payload extraction -----------------------------------------------------------------
function extractNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no __NEXT_DATA__ block (page shape changed, or a 404/challenge page)');
  return JSON.parse(m[1]);
}

// ---- requisite tree ---------------------------------------------------------------------
// A container's parent_connector joins ITS OWN CHILDREN (verified against ECE2071, whose page
// renders "(ENG1003 or ENG1013) and (ENG1014 or ENG1060)" from exactly this shape).
function renderContainer(container) {
  const parts = [];
  for (const rel of container.relationships || []) {
    if (rel.academic_item_code) parts.push(rel.academic_item_code);
  }
  for (const sub of container.containers || []) {
    const r = renderContainer(sub);
    if (r) parts.push(r.includes(' ') ? `(${r})` : r);
  }
  if (!parts.length) return '';
  const joiner = (container.parent_connector?.value || 'AND').toUpperCase();
  return parts.length === 1 ? parts[0] : parts.join(` ${joiner} `);
}

function collectCodes(container, out = []) {
  for (const rel of container.relationships || []) {
    if (rel.academic_item_code) out.push(rel.academic_item_code);
  }
  for (const sub of container.containers || []) collectCodes(sub, out);
  return out;
}

// True only when every referenced unit is genuinely required (no OR anywhere in the tree) —
// that's the ONLY case where a flat `prerequisites: [...]` array is a faithful representation.
function hasOr(container) {
  if ((container.parent_connector?.value || '').toUpperCase() === 'OR') {
    const kids = (container.relationships || []).length + (container.containers || []).length;
    if (kids > 1) return true;
  }
  return (container.containers || []).some(hasOr);
}

// Flatten a requisite tree into conjunctive groups: [[A,B],[C]] means "(A or B) AND C".
// This is the shape a planner actually needs — one representative must be satisfied PER GROUP.
// Picking a single representative across the whole flattened code list (the obvious shortcut)
// silently drops entire required groups: MMA3101's real rule is
// "(MMA2003 or MEC2404 or ...) AND (MEC3456 or MMA3001 or ECE3093)" and the shortcut kept only
// the first group. Caught by the validator's chronology check, not by eye.
function toGroups(container) {
  const connector = (container.parent_connector?.value || 'AND').toUpperCase();
  const childGroups = [];
  for (const rel of container.relationships || []) {
    if (rel.academic_item_code) childGroups.push([rel.academic_item_code]);
  }
  for (const sub of container.containers || []) {
    const g = toGroups(sub);
    if (g.length) childGroups.push(...g.map(x => x));
  }
  if (!childGroups.length) return [];
  if (connector === 'OR') return [[...new Set(childGroups.flat())]];  // one group of alternatives
  return childGroups;                                                  // AND: each stays its own group
}

// KNOWN LIMITATION, made explicit rather than left silent. toGroups flattens an OR whose branches
// are themselves ANDs into a single alternatives list, which loses the conjunction. FIT2094's real
// rule is "(FIT1045 or FIT1048 or FIT1051 or FIT1053) OR (ENG1013 AND ENG1014)" — the flat group
// wrongly implies ENG1013 alone would satisfy it. The `expression` string is always faithful; this
// flag marks the units where the flat `groups` array is NOT, so a human checks the expression.
function hasNestedAnd(container) {
  const connector = (container.parent_connector?.value || 'AND').toUpperCase();
  if (connector === 'OR') {
    for (const sub of container.containers || []) {
      const subConn = (sub.parent_connector?.value || 'AND').toUpperCase();
      const kids = (sub.relationships || []).length + (sub.containers || []).length;
      if (subConn === 'AND' && kids > 1) return true;
    }
  }
  return (container.containers || []).some(hasNestedAnd);
}

// The Handbook's own type values are not uniform: prerequisites come through as "prerequisite"
// but prohibitions come through as "prohibitions" (plural). Reading only the singular silently
// yields null for EVERY prohibition, which looks identical to "this unit has none" — a false
// clean bill of health. Normalise before bucketing.
const REQUISITE_TYPE_ALIASES = {
  prerequisites: 'prerequisite',
  corequisites: 'corequisite',
  prohibitions: 'prohibition',
};

function parseRequisites(requisites = []) {
  const byType = {};
  for (const req of requisites) {
    const rawType = req.requisite_type?.value || 'unknown';
    const type = REQUISITE_TYPE_ALIASES[rawType] || rawType;
    const containers = req.container || [];
    const expr = containers.map(renderContainer).filter(Boolean).join(' AND ');
    const codes = containers.flatMap(c => collectCodes(c));
    const groups = containers.flatMap(c => toGroups(c));
    const anyOr = containers.some(hasOr);
    const bucket = (byType[type] ||= { expression: [], codes: [], groups: [], hasOrLogic: false, groupsAreLossy: false, description: [] });
    if (expr) bucket.expression.push(expr);
    bucket.codes.push(...codes);
    bucket.groups.push(...groups);
    bucket.hasOrLogic = bucket.hasOrLogic || anyOr;
    bucket.groupsAreLossy = bucket.groupsAreLossy || containers.some(hasNestedAnd);
    if (req.description) bucket.description.push(String(req.description).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  }
  for (const t of Object.keys(byType)) {
    const b = byType[t];
    b.expression = b.expression.join(' AND ');
    b.codes = [...new Set(b.codes)];
    b.description = b.description.filter(Boolean).join(' ');
  }
  return byType;
}

// ---- offerings --------------------------------------------------------------------------
const PERIOD_TO_SEM = [
  [/first semester|semester 1|^s1$/i, '1'],
  [/second semester|semester 2|^s2$/i, '2'],
];

function parseOfferings(unitOffering = []) {
  return unitOffering.map(o => ({
    period: o.teaching_period?.value ?? o.teaching_period ?? null,
    location: o.location?.value ?? o.location ?? null,
    mode: o.attendance_mode?.value ?? o.attendance_mode ?? null,
  }));
}

// Derive the catalog's semesterOffered from the offerings actually listed AT A GIVEN CAMPUS.
// Campus matters: a unit can run S1 at Clayton and S2 in Malaysia, and the planner is Clayton's.
function deriveSemesterOffered(offerings, campus = 'Clayton') {
  const here = offerings.filter(o => (o.location || '').toLowerCase().includes(campus.toLowerCase()));
  const sems = new Set();
  for (const o of here) {
    for (const [re, sem] of PERIOD_TO_SEM) {
      if (re.test(String(o.period || ''))) sems.add(sem);
    }
  }
  if (sems.has('1') && sems.has('2')) return 'both';
  if (sems.has('1')) return '1';
  if (sems.has('2')) return '2';
  return 'unknown'; // no standard-semester offering at this campus (summer-only, or not offered)
}

// ---- main -------------------------------------------------------------------------------
async function harvestOne(code, year) {
  const url = `${BASE}/${year}/units/${code}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html' } });
  if (!res.ok) return { code, sourceUrl: url, error: `HTTP ${res.status}` };
  const html = await res.text();
  let pc;
  try {
    pc = extractNextData(html).props.pageProps.pageContent;
  } catch (e) {
    return { code, sourceUrl: url, error: e.message };
  }
  if (!pc || !pc.unit_code) return { code, sourceUrl: url, error: 'no unit payload (likely a 404 page)' };

  const offerings = parseOfferings(pc.unit_offering);
  const requisites = parseRequisites(pc.requisites);
  const rules = (pc.enrolment_rules || [])
    .map(r => String(r.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return {
    code: pc.unit_code,
    title: pc.title,
    creditPoints: Number(pc.credit_points),
    level: pc.level ?? null,
    handbookYear: pc.implementation_year ?? year,
    version: pc.version_name ?? pc.version ?? null,
    offerings,
    semesterOfferedClayton: deriveSemesterOffered(offerings, 'Clayton'),
    prerequisite: requisites.prerequisite ?? null,
    corequisite: requisites.corequisite ?? null,
    prohibition: requisites.prohibition ?? null,
    otherRequisiteTypes: Object.keys(requisites).filter(t => !['prerequisite', 'corequisite', 'prohibition'].includes(t)),
    enrolmentRules: rules,
    sourceUrl: url,
    fetchedOn: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.codesFrom.length) {
    const { readFileSync } = await import('node:fs');
    for (const f of opts.codesFrom) {
      const j = JSON.parse(readFileSync(f, 'utf8'));
      opts.codes.push(...(j.units || []).map(u => u.code));
    }
  }
  const codes = [...new Set(opts.codes)];
  if (!codes.length) {
    console.error('usage: node scripts/harvest-handbook.mjs [--year current] [--out file.json] [--codes-from data/x.json] CODE...');
    process.exit(2);
  }

  const results = [];
  for (const code of codes) {
    const r = await harvestOne(code, opts.year);
    results.push(r);
    const status = r.error ? `ERROR ${r.error}` : `${r.semesterOfferedClayton.padEnd(7)} ${r.title}`;
    console.error(`  ${code.padEnd(8)} ${status}`);
    if (opts.delayMs) await new Promise(r => setTimeout(r, opts.delayMs));
  }

  const json = JSON.stringify({ harvestedOn: new Date().toISOString(), year: opts.year, units: results }, null, 2);
  if (opts.out) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(opts.out, json);
    console.error(`\nWrote ${results.length} units -> ${opts.out}`);
  } else {
    console.log(json);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
