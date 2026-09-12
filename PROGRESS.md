# PROGRESS — Monash Engineering Course Map

Running log across sessions. Claude updates this as work happens.

## Setup answers
- Intake year: 2024
- Degree: E3007 single degree — Electrical & Computer Systems Engineering

## Status
- [x] Step 1 — Research (unit data + prereqs/coreqs) — DONE
- [x] Step 2 — UI (design directions -> build) — DONE, see below
- [x] Step 3 — Test — DONE, formal pass complete, see below
- [x] Step 4 — Deploy — DONE, see below

## Product pivot (important — read this before touching the UI)
Original brief (INSTRUCTIONS.md) described a **static visual map**: pre-filled,
click-to-highlight. Sahel corrected this after seeing the first design comps —
the actual point is a **planner he builds himself**:
- Nothing is pre-filled. He adds units to semesters himself, including the
  compulsory ones — the catalog just knows their canonical slot + prereq/coreq
  rules so the picker defaults sensibly.
- **Catalog** = the 23 researched First Year + Electrical units (real Handbook
  data). **Custom units** = a standalone "add anything" feature for units
  outside E3007 entirely — he's also doing Commerce units. Custom units get
  code/title/credit points/semester/type/freeform notes, no prereq checking
  (we have no data for them).
- **Validation is warn, not block.** Wrong semester, missing prereq/coreq, or a
  prohibition conflict shows a flag on the card, but never stops placement —
  useful for planning ahead of actually finishing something. This was my call,
  not explicitly confirmed — revisit if Sahel wants hard blocking instead.
- **Persistence**: localStorage (matches "no backend, static site" from
  INSTRUCTIONS.md). Per-browser, not synced across devices.
- Click a placed unit → still highlights upstream/downstream chain, now scoped
  to what's actually in the plan (not the full catalog).

Given this pivot, the placeholder science/elective units from the original data
files were **removed** — they only made sense in the old pre-filled-map model.
The planner's "add custom unit" feature replaces that entire mechanism.

## Design direction
Presented 3 comps (Editorial/Transcript, Technical/Drafting, PCB/dark) as an
Artifact — [Course Map Comps](https://claude.ai/code/artifact/d81b088e-b282-48bb-bc06-0f3cd6090364).
Sahel picked **A — Transcript**: ink-on-paper editorial, Fraunces serif for
titles, IBM Plex Sans/Mono for body/codes and data. Built out as the real app
in that system, extended with a 5th accent colour for `type: commerce`
(the other three didn't need it).

## The actual app
- `index.html` — the whole planner (catalog sidebar + add-custom form + Year×
  Semester grid), self-contained, fetches `data/*.json` at load.
- Also published live as a multi-file Artifact for immediate use:
  [E3007 Planner](https://claude.ai/code/artifact/26d02b57-3fdb-46e6-87df-16bbd4c728af)
  (same `index.html` + `data/` files — this IS the real project, not a mockup).
- `data/common-first-year.json` — 7 units (First Year core + SCI1000).
- `data/electrical.json` — 16 units (ECE specialisation core + capstone/CPD units).
- 23 total catalog units. Validated: 0 duplicate codes, 0 dangling prereq/coreq
  references, 0 cycles.

## Testing done this session (live, via browser automation — not just claimed)
- Add/remove a catalog unit via the +/✓ toggle — confirmed.
- Missing-prerequisite flag appears when a prereq isn't placed yet, and clears
  correctly once it's placed in an earlier semester (tested ECE2131 needing
  ENG1013 + ENG1005) — confirmed.
- Click-to-highlight chain (upstream amber, downstream blue) — confirmed
  correct on a real multi-level chain.
- Add-custom-unit form (added a Commerce unit, BFC1001) — confirmed, shows its
  own accent colour, counts toward credit-point total.
- localStorage persistence across a full page reload — confirmed.
- Mobile viewport (375px) — catalog and grid both collapse to single column
  cleanly, touch targets are a reasonable size — confirmed.
- Real mouse-driven clicks (not just programmatic) — confirmed working; one
  false alarm during testing was my own coordinate-frame mistake with a custom
  browser viewport emulation, not an app bug.

## Step 3 formal pass (this session)
Ran the app on a local static server (python http.server via `.claude/launch.json`,
not file://, since fetch() of data/*.json needs real HTTP), injected two synthetic
custom units per case via the browser console calling the app's own functions
(`addUnit`/`flagsFor`/`refreshAll` — same code path the UI uses, not a separate
test harness), confirmed with both the raw flag output and a screenshot, then
cleared all test/localStorage state back to empty before finishing.
- **Prohibition-conflict flag** — two units (TESTP01 ⟷ TESTP02) each listing the
  other in `prohibitions`, both placed in the plan → both cards correctly show
  "Prohibited combination" and flag is symmetric. Confirmed.
- **Corequisite flag, all three states** — TESTC01 requires coreq TESTC02:
  unplaced → "isn't in your plan yet"; placed in a later slot (Y2S2 vs Y2S1) →
  "is placed later than Y2 S1"; moved to the same slot → flag clears (empty
  array). Confirmed, including screenshot of the "placed later" state.
- No automated test suite — all verification is manual/live, run through the
  real UI code paths rather than mocked.

No app code changes were needed — the existing `flagsFor()` logic
(index.html:319-366) handled every case correctly on first try.

## Decisions
- First Year pathway: **Foundation maths only (ENG1090)** — did not have VCE
  Specialist Maths >30, did have Physics >25.
- Campus: **Clayton** — determines two Year 4/5 units (see below).
- **ECE3121 vs ECE3122** (Engineering electromagnetics, Y4S2): course map
  names ECE3121, but the 2024 Handbook shows ECE3121 was Malaysia-only that
  year, with Clayton required to take ECE3122 instead (mutually prohibiting).
  Using **ECE3122**. Re-verify against the live Handbook closer to Year 4.
- **ECE4099 (Professional practice, Y5S1)** is not in the catalog at all —
  Malaysia-only in 2024, and the course map itself says Clayton students
  replace it with a Professional Practice domain unit of their choice. Add
  whichever one he picks as a custom unit.
- **ECE2071 title**: 2024 Handbook shows "Computer organisation and
  programming"; the current course map (updated Oct 2025) shows "Systems
  programming." Same code/content, title changed after 2024. Using the
  current title, noted on the unit.
- **Semester-offering isn't hard-checked for catalog units** (only custom
  units, which carry an explicit field). Found during testing: the 2024
  Handbook lists ECE3161 as S1-only, but the course map places it at Y4 S2 —
  a real discrepancy between "specific 2024 timetable" and "recommended
  sequence," not safe to encode as a strict rule. Known offering quirks
  (e.g. ECE2191 "Semester 2 offering only") are shown as plain-text notes on
  the card instead.

## Sources
- Course progression map (2024 commencing, E3007):
  https://www.monash.edu/__data/assets/pdf_file/0003/3303642/2024-map-E3007.pdf
  (fetched via browser — direct curl/WebFetch blocked by Cloudflare on monash.edu)
- Monash Handbook unit pages (2024 version): https://handbook.monash.edu/2024/units/{CODE}
  — prereqs/coreqs/prohibitions live behind a collapsed "Rules" accordion (must click
  to expand); WebFetch alone doesn't render this (JS SPA), browser tool required.

## Deploy (this session)
Confirmed with Sahel first: **GitHub Pages**, public repo (free tier requires
it; nothing sensitive in the code — public Handbook unit codes/titles only).
- Installed `gh` via Homebrew (wasn't present), Sahel authenticated it himself
  via `gh auth login` (browser flow — his account, his credentials).
- Repo: [github.com/TokyoFlexin/monash-course-map](https://github.com/TokyoFlexin/monash-course-map)
  — initial commit made locally first (`git init`, all project files except
  the stale `monash-course-map.zip`, gitignored), then pushed via
  `gh repo create --source=. --push`.
- Pages enabled via `gh api repos/.../pages` (branch `main`, root).
- Live URL: https://tokyoflexin.github.io/monash-course-map/

## Next up
- Formal Step 3 pass: prohibition-conflict flag with two custom units; a
  couple more corequisite cases; maybe a "known issues" scan of the whole
  catalog once he's actually used it for a while.
- Step 4 (Deploy): confirm hosting choice with Sahel (GitHub Pages vs
  Netlify) before doing anything — per INSTRUCTIONS.md, don't create accounts
  or push to a public repo without his explicit yes. Not started.
- Optional, only if he wants it later: prereq/coreq checking for custom units
  too (he'd need to name which catalog/custom codes they depend on).
