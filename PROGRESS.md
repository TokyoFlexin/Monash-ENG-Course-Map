# PROGRESS — Monash Engineering Course Map

Running log across sessions. Claude updates this as work happens.

## Setup answers
- Intake year: 2024
- Degree: E3007 single degree — Electrical & Computer Systems Engineering
  (currently enrolled/confirmed). Also applying to transfer into **E3005**
  (Electrical + Commerce double degree) — not confirmed yet, see "Commerce
  expansion" below.

## Status
- [x] Step 1 — Research (unit data + prereqs/coreqs) — DONE
- [x] Step 2 — UI (design directions -> build) — DONE, see below
- [x] Step 3 — Test — DONE, formal pass complete, see below
- [x] Step 4 — Deploy — DONE, see below
- Live at https://tokyoflexin.github.io/monash-course-map/

## Post-launch revision round (this session)
Sahel came back with feedback after using the deployed planner for real:
1. **Redesign** — original "Transcript" comp felt too flat, cards blended into
   the background, wanted more color/soul. Presented 3 new comps ([Planner
   Redesign Comps](https://claude.ai/code/artifact/4b20ec59-5166-48ba-8282-688b5c1675d5) —
   PCB/circuit board, Blueprint/drafting, Ledger-evolved). He picked **C —
   Ledger, evolved**: kept the Fraunces/editorial bones but pushed to real
   saturated per-type color, a colored left-rule + drop shadow on every card
   so they lift off the page. Built into the real `index.html` — new palette
   (warm paper `#f2ead9` ground, deep-forest/burnt-sienna/indigo/plum/teal
   per type instead of the old muted tones), `.card.t-{type}` classes driving
   the left-rule, bolder Fraunces headings (700 weight).
2. **"Add custom unit" relocated** — was a `<details>` accordion at the very
   bottom of the catalog sidebar (had to scroll past all ~30 units to reach
   it). Now a full-width button directly under the search box that expands
   inline; same form/logic, just moved and restyled as a real button.
3. **Quick-start onboarding** — added a modal (`#onboardVeil`) offering 8
   cutoff options (Through Y1 S1 ... Through Y4 S2). Picking one adds every
   *catalog* (non-commerce) unit at or before that point into its canonical
   slot; he edits/removes from there. Auto-opens once on a truly empty plan
   (tracked via a separate `e3007-planner-onboarded-v1` localStorage flag, so
   it doesn't reappear after he's started), and is always reachable again via
   a "Quick start…" button in the topbar. Decided against export/import or
   account sync for now — he confirmed the real problem was first-time setup
   effort, not cross-device sync.
4. **Commerce expansion** — see below.

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

## Commerce expansion (E3005 double degree)
Sahel is applying to transfer into E3005 (Bachelor of Engineering Honours +
Bachelor of Commerce, Electrical and Computer Systems specialisation) and
wants to see Commerce progress in the same planner. Researched with the same
rigor as electrical.json (Handbook `Rules` accordion per unit, not just the
course map).

**Added** — `data/commerce.json`, 8 catalog units, all `type: "commerce"`:
Part A ("Commerce specified study") core, the 36cp-worth of it that's fixed
regardless of major:
- ACC1100 *or* ACC1001 (Y1 S1) — both listed, pick one (ACC1100 required if
  majoring in Accounting/Actuarial Studies)
- ECC1000 *or* ECX2953 (Y1 S2) — both listed; ECX2953 is Accounting-major-only
  (confirmed E3005 is on its restricted-enrolment allow-list)
- ETC1000 (Y2 S1), MKC1200 + MGC1010 (Y2 S2), BTC1110 (Y3 S1)
- None of these 8 have real prerequisites/corequisites (verified on the
  Handbook, not assumed) — only course-level prohibitions against B2007
  (Bachelor of Business), irrelevant to this planner. Not encoded as
  catalog prohibitions since it's not a real conflict for this student.
- Wired into `index.html`: third `loadCatalog()` fetch, sidebar grouping
  updated so commerce units don't fall into the Common-First-Year bucket by
  year-number alone.

**Part B added (this session, follow-up)** — Sahel hadn't picked a major yet
("still haven't made my mind, not even in the degree"), shortlisted 4:
Finance, Economics, Business Analytics, Econometrics. Decided to add all 4 as
explorable options rather than wait. Researched via 4 parallel background
research agents (one per major/group), each independently browsing the
Handbook major pages (`handbook.monash.edu/2024/aos/{CODE}`) and every unit's
Rules accordion — same rigor as electrical.json, not just the major overview
page. commerce.json grew from 8 to **47 units**; each now carries a `major`
field (`core`/`finance`/`economics`/`business-analytics`/`econometrics`) and
the sidebar splits Commerce into 5 sub-groups accordingly (was one flat list).
- **Finance** (17): 5 core (BFC2140, BFC2751, BFC3241, BFC3999, ETC2410) +
  12 electives (choose 3). Real prereq chains found: BFC2751/BFC3241 need
  BFC2140 first; several electives need BOTH BFC2140 AND BFC2751; BFC3999 is
  the major's capstone (96cp threshold, no unit prereq, placed last).
- **Economics** (3 core only — ECC1100, ECC2000, ECC2010): the full elective
  pool (24cp from 30+ units across 6 overlapping themes) was deliberately
  **not enumerated**, too large/open to be useful as catalog cards — noted in
  openDecisions instead, add specific ones as custom units once chosen.
  Real chain: ECC2010 needs BOTH ECC1000 AND ECC1100.
- **Econometrics** (5 unique + shares ETC3460 with Finance): core ETC1000 (Part
  A) + ETC1010 (Business Analytics) + ETC2410 (Finance) already double as its
  entry units; ETC2440/ETC2520 both accept an engineering substitution — the
  Handbook explicitly allows ECE2191 (already in this student's Electrical
  catalog) in place of ETC2520. All 4 "Level 3, choose 3" units need ETC2410.
- **Business Analytics** (14): 3 core (ETC1010, ETC2420, ETC3250) + 12
  electives (choose 5, min 2 at Level 3). Found a genuine cross-catalog
  break: FIT3171 and FIT3179's prerequisites include ENG1003/ENG1013/ENG1014
  — core Electrical units already in this student's plan — so those may
  already be unlocked. Found a real gap: FIT3154 needs FIT2086, which isn't
  in any major's list at all (documented, not silently dropped). Found a real
  **prohibition pair already in the data**: FIT2094 vs FIT3171 (same
  "Databases" content at Level 2 vs 3) — tested live, both flag correctly.
- Every unit's `year`/`semester` is **Claude's suggested placement, not
  Handbook fact** — Monash doesn't mandate a semester for major electives,
  only a level 1/2/3 credit mix. Placed Level 1/2 major units in Year 3,
  Level 3 units in Year 4/5, ordered to respect every real prerequisite chain
  found (validated: 0 dangling prereq/coreq refs except the documented
  FIT2086 gap, 0 prerequisite cycles, 0 placements that violate their own
  chain's ordering).
- One real bug caught and fixed during validation: several agents correctly
  found OR-logic prerequisites (e.g. "one of X/Y satisfies this") but the
  `prerequisites` array only supports AND — I'd initially transcribed a few
  of these as multi-entry arrays (which the app reads as "need ALL of
  these"), corrected to single representative codes (ETC3550, ETC3580,
  ETF3500, FIT3171, FIT3003, FIT3179), full OR logic kept in `prerequisiteText`.
- The "Additional commerce unit" (6cp, flexible/FREE-eligible) and the
  "Capstone/consulting/international/internship" unit (6cp, ~30 possible
  codes, Y4 S2 slot) still have no fixed code — add as custom units once
  chosen, same pattern as ECE4099's Professional Practice replacement.
- Some Finance/Business Analytics electives turned out not to be normal
  Clayton semester units: BFX3301 is Caulfield-only (trading-lab, quota
  limited), BFX3871 and BEX3726 are overseas/immersion study-tour blocks with
  their own extra costs, ETF3500 was Caulfield-only in the 2024 Handbook.
  Left in the catalog (they're real Handbook-listed options) but flagged.
- **electrical.json was deliberately NOT changed**, even though the E3005
  double-degree map places several ECE units in different semesters than the
  E3007 single-degree map already in there (ECE2191 and ECE4132 move to Y3 S2,
  ECE3141 moves to Y4 S1, plus an extra Level 4/5 ECE elective slot in Y4 S1).
  Since the transfer isn't confirmed and E3007 is what's actually enrolled
  right now, changing the confirmed data for an unconfirmed transfer felt
  like the wrong risk to take silently. Revisit if the transfer goes through.
- Sources: https://handbook.monash.edu/2024/courses/E3005,
  https://handbook.monash.edu/2024/courses/B2001,
  https://handbook.monash.edu/2024/aos/{FINANCE07,ECONOMIC07,BUSANLMJ01,ECONOMTR05},
  https://www.monash.edu/__data/assets/pdf_file/0020/3303641/2024-map-E3005.pdf
  (fetched via r.jina.ai reader proxy — direct browser navigation to Monash
  PDF assets triggers a download the automation can't complete; the Cloudflare
  block that stops raw curl/WebFetch doesn't apply to jina's fetcher).

## Collapsible catalog folders (this session, follow-up)
70 units across 7 groups made the sidebar too long to scan (especially after
the Commerce major expansion). Converted `renderCatalog()` to build a
two-level folder tree using native `<details>`/`<summary>`: Common first
year, Electrical specialisation, and Commerce (which itself contains 5
nested subfolders — Core/Finance/Economics/Business Analytics/Econometrics).
Every folder shows a unit count and is collapsed by default.
- Open/closed state lives in a module-level `openGroups` Set, not on the DOM
  — necessary because `renderCatalog()` rebuilds the whole sidebar on every
  add/remove/refreshAll(), which would otherwise snap every folder shut the
  moment you added a unit. Tested explicitly: state survives a full
  add-unit → refreshAll() cycle.
- Typing in the search box auto-expands (and only shows) folders that
  contain a match, without touching the user's own manually-opened folders.
- Tested all three levels of toggling (top-level, and a nested major
  subfolder within Commerce) via direct DOM inspection of each `<details>`
  element's `open` state, not just visually.

## Drag and drop (this session, follow-up)
Sahel wanted to drag units between semester cells instead of using the
per-card `<select>` dropdown. Added native HTML5 drag-and-drop:
- Placed cards are draggable — drop on any cell to move them there.
- Catalog rows (sidebar) are also draggable — drop directly on a cell to add
  that unit there (doesn't have to be its canonical slot).
- Drop target cell highlights (dashed border) while dragging over it.
- The per-card `<select>` dropdown was kept, not removed — native HTML5 drag
  doesn't work on touch devices, so it's the fallback for mobile/tablet.
- Tested by dispatching synthetic DragEvents (dragstart/dragover/drop) via
  the browser tool rather than simulated mouse movement, since this sandboxed
  browser can't perform real OS-level drag gestures that Chrome's native DnD
  requires — confirmed both move-a-placed-card and drag-from-catalog work,
  and that click-to-select-chain and the remove button still work unaffected.

## Next up
- Once Sahel actually picks a major, trim the other 3 out (or just leave them
  — they don't affect validation, only add sidebar length).
- Optional, only if he wants it later: prereq/coreq checking for custom units
  too (he'd need to name which catalog/custom codes they depend on).
- If the E3005 transfer is confirmed: update electrical.json's year/semester
  placements to match the double-degree sequence (see note above).
