# PROGRESS — Monash Engineering Course Map

Running log across sessions. Claude updates this as work happens.

## Setup answers
- Intake year: **2025** (corrected 2026-09-16 — was recorded as 2024 for months, which is
  why the original Electrical/common research was done against the 2024 Handbook)
- Degree: E3007 single degree — Electrical & Computer Systems Engineering
  (currently enrolled/confirmed). Also applying to transfer into **E3005**
  (Electrical + Commerce double degree) — not confirmed yet, see "Commerce
  expansion" below.

## Status
- [x] Step 1 — Research (unit data + prereqs/coreqs) — DONE
- [x] Step 2 — UI (design directions -> build) — DONE, see below
- [x] Step 3 — Test — DONE, formal pass complete, see below
- [x] Step 4 — Deploy — DONE, see below
- Live at https://tokyoflexin.github.io/Monash-ENG-Course-Map/

## Current state (quick orientation — read this first, details below)
The planner is live and has been through several iteration rounds since
initial deploy. As of now:
- **Catalog**: 84 units across 4 files/disciplines — Common core (6) +
  Electrical (12, E3007/E3001) + Civil (15, E3001) + Commerce (47, E3005
  double degree, Part A core + Part B for 4 shortlisted majors — no major
  picked yet). Every unit carries a `discipline` field (`common`/
  `electrical`/`civil`/`commerce`); `data/manifest.json` lists which catalog
  files load, so adding a discipline is a new file + one manifest line, no
  index.html changes. `node scripts/validate-catalog.mjs` checks the whole
  catalog (required fields, duplicate codes, dangling prereq/coreq refs,
  prerequisite cycles) — currently 0 problems. Sidebar is collapsible
  folders, driven by discipline + (for Commerce) `major`, filtered to the
  user's chosen specialisation once onboarding sets one (see below).
- **Personalization**: onboarding modal (first visit, re-openable via
  Settings) asks name, specialisation (dropdown, auto-populated from loaded
  disciplines), an "also doing Commerce" checkbox, and a quick-start
  year+semester cutoff (reused from the existing grid, now live-filtered to
  the chosen specialisation). Once a specialisation is set, the catalog
  sidebar hides every other discipline (fails open — shows everything — until
  one is actually chosen, so old saved plans from before this feature never
  lose visibility into units they already had). Switching specialisation
  later (Settings panel) only changes sidebar visibility going forward —
  never touches units already placed in the grid.
- **Validation**: warn-not-block flags for prerequisites, corequisites,
  prohibitions, AND semester-offering (every catalog unit has a real
  Handbook-verified `semesterOffered` — this is a LIVE flag now, not just a
  note; see "Offering notes → real flags" below for why that distinction
  matters).
- **Interactions**: click a card to highlight its up/downstream chain; drag
  cards between semester cells (or drag straight from the catalog) to move/
  place units; per-card `<select>` dropdown kept as a touch-device fallback.
- **Design**: "Ledger, evolved" — warm paper palette, saturated per-type
  colour + left-rule + shadow on cards, Fraunces/IBM Plex Sans+Mono.
- **Live URL**: https://tokyoflexin.github.io/Monash-ENG-Course-Map/ — deployed
  via GitHub Pages from github.com/TokyoFlexin/Monash-ENG-Course-Map, pushed
  directly after every change this session (nothing pending, working tree
  clean as of the last commit below).
- **Not yet done**: Commerce major choice (waiting on Sahel), Part B
  elective-only units beyond core (Economics' large pool intentionally not
  enumerated), Civil's Part E electives (also intentionally not enumerated),
  custom-unit prereq checking (never asked for), E3005 transfer confirmation
  (would trigger updating electrical.json's year/semester to match the
  double-degree sequence).

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
   account sync at this point in the session — he confirmed the real problem
   was first-time setup effort, not cross-device sync. (Revisited later the
   same session anyway once the Settings panel came in — see
   "Personalization" below, which added export/import as a natural fit there.)
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
- `data/commerce.json` — 47 units (E3005 double-degree Commerce side — Part A
  core + Part B for 4 shortlisted majors; see "Commerce expansion" below).
- **70 total catalog units** (as of the semester-flag audit below). Validated:
  0 duplicate codes, 0 dangling prereq/coreq references (one documented
  exception — FIT3154's FIT2086 prereq, a deliberate external gap, not a
  bug), 0 cycles, every unit carries a verified `semesterOffered` value.

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
- **Semester-offering IS now hard-checked for every catalog unit**
  (superseded — originally decided against this, see "Offering notes → real
  flags" near the end of this file for why that changed). Every unit carries
  a verified `semesterOffered` value and gets a real, live flag if placed off
  its actual Handbook semester — same warn-not-block treatment as
  prereqs/coreqs/prohibitions. ECE3161 is the one deliberate exception worth
  knowing: the 2024 Handbook lists it as S1-only, but the course map places
  it at Y4 S2 — a real discrepancy between "specific 2024 timetable" and
  "recommended sequence." Kept at the course map's Y4 S2 slot (so it WILL
  show a flag there by design) rather than silently moved, since sequencing
  can shift year to year — the flag plus its note explain why.

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
- Repo: [github.com/TokyoFlexin/Monash-ENG-Course-Map](https://github.com/TokyoFlexin/Monash-ENG-Course-Map)
  — initial commit made locally first (`git init`, all project files except
  the stale `monash-course-map.zip`, gitignored), then pushed via
  `gh repo create --source=. --push`.
- Pages enabled via `gh api repos/.../pages` (branch `main`, root).
- Live URL: https://tokyoflexin.github.io/Monash-ENG-Course-Map/

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

## Personalization (this session, follow-up)
Sahel asked for a name prompt on first visit + a settings section top-right,
and gave free rein on the rest ("surprise me"). Delivered:
- **First-visit name prompt** — folded into the existing onboarding modal
  rather than a separate step (it already owns the "first thing you see"
  moment). Updates the header live as you type, before you've even
  dismissed the modal.
- **"{Name}'s course plan"** replaces "Your course plan" once a name is set;
  falls back to the generic title if it's ever cleared.
- **Ink-stamp monogram** — a small circular badge with the user's initials
  next to the title, double-ringed and tilted a few degrees like a rubber
  stamp on a transcript. This is the "surprise" — ties into the same
  stamp/ledger visual language already used for semester tags on cards in
  the Ledger-evolved redesign, rather than being a random addition.
- **Settings panel** (gear icon, top-right, replaces the old Quick
  start/Reset button pair in the topbar): edit your name anytime, Quick
  start, Reset plan (moved here, kept its confirm dialog), plus two new
  ones —
- **Export plan (.json)** and **Import plan** — the "move your plan to
  another browser/device" need that came up earlier (when quick-start was
  discussed) and was deliberately deferred. Added now as part of settings
  since it fits naturally: export downloads `{name, placements,
  customUnits}` as a file; import validates the shape (every placements key
  must match `Y[1-5]S[12]`) before applying, rejects with an alert
  otherwise rather than silently corrupting the plan.
- Name is now part of the same `STORAGE_KEY` payload as the plan (not a
  separate localStorage key) — so it round-trips through export/import too.
- Tested: live header update while typing, full reload persistence (name +
  monogram + plan all survive), export→import round-trip (via direct JS,
  since this sandboxed browser can't drive real file download/upload
  dialogs), import validation correctly rejecting malformed JSON, and the
  whole settings modal at mobile width (375px).

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

## Data-quality fix: ECE2071 missing offering note (this session, follow-up)
Sahel noticed placing ECE2071 in Semester 2 gave no warning and asked about
it. Checked the 2024 Handbook directly (not assumed): ECE2071 is genuinely
Clayton-Semester-1-only, no S2 offering exists at all. This was a real gap —
it just never got the same "Semester X offering only" plain-text note that
ECE2191 already carries, not a bug in the deliberate "don't hard-check
semester for catalog units" design decision (see Decisions section above).
Fixed the note on ECE2071 in electrical.json.

**Follow-up: full offering audit (Sahel asked for this explicitly).**
Cross-checked the 47 Commerce units first — the Finance/Business
Analytics/Econometrics elective research already captured offering data
during the original parallel-agent research, so no re-checking needed there
(verified programmatically: every unit either has an explicit offering note
or was confirmed both-semester). Part A core (8 units) and Economics core (3
units) were previously checked live and are genuinely both-semester at
Clayton — correctly have no note.

That left 24 units never systematically checked: all 7 common-first-year +
16 electrical (minus ECE2071/ECE2191 already fixed) + the 3 Economics core
units, re-verified as a final sanity pass. Split across 2 parallel research
agents checking only the Handbook "Offerings" section (prereqs/coreqs were
already correct, no need to redo). Result: **11 more units had the exact
same silent gap as ECE2071** — genuinely single-semester at Clayton with no
note saying so. Fixed all 11:
- **Common first year**: ENG1090 (S1 only)
- **Electrical**: ECE2131 (S1 only), ECE2072 (S2 only), ECE2111 (S2 only),
  ECE3051 (S1 only), ECE3073 (S1 only), ECE3122 (S2 only, appended to its
  existing ECE3121-substitution note), ECE3141 (S1 only), ECE4191 (S2 only,
  appended to its existing note), ECE4132 (S2 only)
- **ECE3161** was the most important find — this is the exact discrepancy
  already described in this file's Decisions section above (course map
  places it Y4 S2, Handbook says Semester 1 only) but that decision was
  apparently never actually written into the JSON `notes` field. Same class
  of bug as ECE2071: documented in PROGRESS.md, never landed in the data.
  Fixed now with a note explaining the discrepancy and why the placement
  was kept as-is.
- Economics core (ECC1100, ECC2000, ECC2010) re-confirmed both-semester,
  no note needed, no change.
- All placements were already consistent with their real offering semester
  except ECE3161 (documented above) — no other silent conflicts found.
- Validated: all 12 fixed units (this pass + ECE2071 from before) now
  actually carry the note in the JSON, spot-checked live in the app that it
  renders on the card.

## Offering notes → real flags (this session, follow-up)
Sahel placed ECE2071 in Semester 2 after the audit above and still got no
warning. Root cause: the earlier fix only added plain-text `notes` — static
text that renders regardless of which semester you place a unit in. It
never actually checked anything. The app *already* has a real semester-check
in `flagsFor()` (`index.html`), driven by a `semesterOffered` field — but
that field was only ever set by the "add custom unit" form, never present
on catalog units, so the check silently never fired for anything in the
catalog. The `notes` text was cosmetic; the actual bug was this missing
field.

Fixed properly: added a verified `semesterOffered` ("1"/"2"/"both"/"unknown")
to all 70 catalog units — the 23 electrical/common-first-year ones from
this session's audit, plus all 47 Commerce units (cross-referencing the
offering data already captured in their `notes` during the original major
research, so no re-checking needed there). `"unknown"` used for the 4
units that are real Handbook options but campus-restricted rather than
semester-restricted (BFX3301, BFX3871, BEX3726, ETF3500) — the app's model
only understands semesters, not campus, so asserting "both" for those would
overstate what we actually verified.
- This turns every single-semester unit's `notes` text into a live,
  reactive flag exactly like prereqs/coreqs/prohibitions — appears when
  placed off-semester, clears when moved to the right one. Tested live:
  ECE2071 in S2 now shows "Not usually offered in S2 (offered S1)." next to
  its two prerequisite flags; moving it to S1 clears just that one flag.
- ECE3161 now flags at ITS OWN course-map canonical slot (Y4 S2), since
  that's genuinely not its real offering semester — intentional, matches
  the discrepancy already explained in its `notes`. This is exactly what
  warn-not-block is for: surface the tension, let Sahel decide, never block.
- Updated the stale code comment in `flagsFor()` that explained the *old*
  (incorrect) reasoning for not checking catalog units.

## Civil Engineering added + multi-specialisation system (this session, follow-up)
Sahel's showing the planner to a Civil Engineering friend and wanted: (1) Civil
added with the same research rigor as electrical.json, but via a *repeatable
system* so future disciplines (Phase 2+, "all disciplines of eng") are fast;
and (2) an onboarding popup asking name/year/specialisation, which personalises
(pre-fills up to that year, hides other disciplines' units from someone doing
a different one — "if im doing electrical i don't wanna see civil units").

**Course-code discovery, important for future discipline research**: Monash
restructured undergrad course codes between the 2024 and 2026 commencing
cohorts — in 2026, E3007 means Eng+Science double degree same as 2024 (that
part didn't change), but the *specialisation itself* (Civil, Electrical, etc.)
was always chosen within the single-degree course **E3001** (or within a
double-degree code like E3007/E3005), never its own top-level course code.
Confirmed via handbook.monash.edu/2024/courses/E3001 → "Engineering
specialisations" → Civil's actual identifier is **area-of-study code
CIVILENG03** (144cp: Part C core units, Part D professional practice via
ENG0001, Part E — 36cp technical electives). This AoS-code pattern is exactly
how Commerce majors were found before (FINANCE07 etc.) — confirms the research
method generalizes cleanly to every future discipline: find the AoS code from
the relevant course's Handbook "Structure" page, then
`handbook.monash.edu/2024/aos/{CODE}` gives the real unit list.

**Data added** — `data/civil.json`, 15 Civil-specific units (Part C's 18 core
units minus 3 shared with Electrical: ENG2005, ENG4701, ENG4702, already living
in electrical.json — re-tagged `discipline:"common"` there instead of
duplicating, see below). Researched via 2 parallel background agents (8+7
units), same rigor as Commerce: each unit's Handbook Rules/Requisites
accordion expanded live via the Browser tool, not just Overview text.
- Real OR-prerequisite chains found and correctly collapsed to one
  representative AND-compatible code per the `prerequisites` array's known
  limitation (full logic kept in `prerequisiteText`) — e.g. CIV3221 accepts
  CIV2225 OR CIV2235, used CIV2235 (the current, non-superseded code).
- **CIV4249 (Foundation engineering) was not offered at all in the 2024
  Handbook** — no Offerings section, just a Notes line saying so.
  `semesterOffered: "unknown"`, flagged in its notes and in openDecisions.
- **CIV4286 (Project management for civil engineers) carries an explicit
  Handbook replacement instruction** — "Replace CIV4286 with one Professional
  Practice domain unit from Semester 2, 2024" — structurally identical to
  electrical.json's ECE4099 precedent. Kept at its nominal Y4 S1 slot with the
  instruction documented; add the real replacement as a custom unit.
- One prohibition (CIV2242 ⟷ CIV2241) was hidden inside free-text "Enrolment
  Rule" rather than a dedicated Prohibition accordion — caught by explicitly
  checking Rules text, not just the Requisites summary.
- Part E's 36cp technical-elective pool (~35 units) deliberately **not
  enumerated** — same call already made for Economics' elective pool in
  commerce.json, too large/open to be useful as catalog cards.
- Year/semester placement is Claude's own suggested sequencing (unit level +
  validated prerequisite/corequisite chains, checked so nothing sits before
  its real prerequisite and every placement matches its actual verified
  offering semester) — **not** from the official course-map PDF. That PDF
  exists but couldn't be fetched: direct download is Cloudflare-blocked (same
  as before), and this session's r.jina.ai reader-proxy attempt (used
  successfully for the E3005 map in an earlier session) hit an interactive
  Cloudflare "verify you are human" challenge, which was correctly **not**
  bypassed — solving CAPTCHAs/bot-detection is a hard no regardless of how
  minor the ask seems. Documented as a real limitation in civil.json's
  `_meta.sources`, same transparency standard as the Commerce elective
  placements' "suggested, not Handbook fact" caveat.

**The reusable "system" (the actual ask — do this fast/correctly for future
disciplines too)**:
1. `data/manifest.json` — the list of catalog files the app loads. Adding a
   discipline is now "drop a JSON file + add one line here," not an edit to
   `loadCatalog()`'s JS.
2. Every unit across all 4 catalog files now carries an explicit
   **`discipline`** field (`common` / `electrical` / `civil` / `commerce`) —
   replaces the old `YEARS_FIRST()` heuristic (which inferred "common first
   year" purely from year/semester numbers, a hack that wouldn't have
   survived a second specialisation). Shared cross-specialisation units
   (ENG2005, ENG4701, ENG0001, ENG4702 — used by both Electrical's and Civil's
   Part C) are tagged `discipline:"common"` regardless of which physical file
   they live in, so they're never duplicated and never hidden from either
   specialisation's filtered view.
3. `scripts/validate-catalog.mjs` — a zero-dependency Node script (reads
   `manifest.json`, checks every file it lists) replacing the old
   per-session manual "add synthetic units, check via console" pass. Checks:
   required fields present, valid `type`/`semesterOffered`/year/semester
   values, duplicate codes, dangling prerequisite/corequisite references
   (deliberately **not** prohibitions — those routinely reference real
   Handbook codes for equivalent units at other campuses that were never
   going to be catalog entries, e.g. Caulfield/Malaysia variants — flagging
   those would be noise, not a bug), and prerequisite cycles (deliberately
   **not** corequisite cycles — two units requiring each other, like
   ENG4701⟷ENG0001, is a normal same-semester pairing, not a logical
   impossibility). `KNOWN_EXTERNAL_GAPS` documents deliberate exceptions (e.g.
   FIT3154's FIT2086 prereq). Currently: **85 units across 4 files, 0
   problems.** Run with `node scripts/validate-catalog.mjs`.
4. Sidebar rendering (`renderCatalog()`), the specialisation options
   (`availableSpecialisations()`), and course-code/label branding
   (`disciplineLabel()`, reading each file's `_meta.specialisation`) are all
   now derived from whatever disciplines are actually loaded — a 5th
   discipline file needs zero code changes to appear everywhere it should.

**Onboarding + personalisation** — the modal (`#onboardVeil`) now asks, in
addition to the existing name field:
- **Specialisation** — a `<select>` populated from `availableSpecialisations()`
  (currently Electrical, Civil).
- **"Also doing Commerce (E3005 double degree)"** — a checkbox, separate from
  the specialisation picker (per Sahel's choice: "primary + optional Commerce
  toggle," matching how Monash double degrees actually work — one engineering
  specialisation plus one companion course — rather than a free multi-select).
- The existing quick-start cutoff grid (Y1 S1 … Y4 S2) is reused as-is for the
  "year" ask (his choice: year+semester precision, not year-only) — its counts
  now live-preview against whichever specialisation is currently selected in
  the form, updating before the choice is even saved.
- Choices only **persist** when the user actually proceeds (clicks a cutoff
  button or "start from a blank plan") via `commitOnboardChoices()` — not on
  every dropdown change — so opening the modal and dismissing it via the
  veil/X never silently saves a default nobody picked. Settings panel's
  matching fields, by contrast, save immediately (no separate "proceed" step
  there).
- **Filtering** (his choice: hide entirely, not just collapse) — once a
  specialisation is set, the sidebar only shows Common core + that
  specialisation (+ Commerce if ticked); `visibleDisciplines()` **fails open**
  or (shows every discipline) when no specialisation is set yet, so an
  existing saved plan from before this feature — like Sahel's own, mid-session
  — never silently loses visibility into units it already had.
- **Non-destructive**: switching specialisation later (via Settings) only
  changes what the *catalog sidebar* shows going forward — units already
  placed in the grid stay exactly where they are, regardless of discipline.
  Confirmed live: placed Civil units while testing, switched Settings to
  Electrical + Commerce, grid still showed all 17 previously-placed units
  untouched.
- Branding (topbar/catalog/modal eyebrows, e.g. "E3001 · Civil Engineering")
  now derives from the chosen specialisation via `updateBranding()` instead of
  being hardcoded "E3007 · Electrical" — same static markup would've been
  wrong the moment a second discipline existed.
- Export/import plan `.json` now round-trips `specialisation`/`hasCommerce`
  too, not just name/placements/customUnits.

**Tested live** (local static server, real browser automation, not just
claimed): fresh onboarding modal shows all 4 disciplines pre-filter → selected
"Civil Engineering" → grid counts updated live (2/4/7/10/13/17/20/23, provably
different from Electrical's 2/4/7/9/11/13/15/17) → clicked "Through Y3 S2" →
sidebar correctly showed only Common core + Civil Engineering (Electrical and
Commerce hidden) → branding read "E3001 · Civil Engineering" → 17 units/102cp
placed exactly matching the expected filtered set → clicked a placed CIV3221
card and confirmed upstream-chain highlighting correctly reached into
civil.json's CIV2235 (cross-file prerequisite resolution) → opened Settings,
switched specialisation to Electrical + ticked Commerce, confirmed sidebar
updated to show Electrical + Commerce (Civil hidden) and the plan's
already-placed Civil units were untouched in the grid → mobile viewport
(375px) confirmed still collapsing cleanly with the new settings fields.
localStorage cleared back to empty before finishing.

## Data-quality fix: SCI1000 removed from common-first-year.json (this session)
Sahel flagged this directly: "where did you get SCI1000, that's not a unit I
did, that's not a first year eng [unit]." He was right. Checked the live 2024
Handbook for E3007 (his Eng+Science double degree) — its Science component
(96cp) is **entirely elective**: "six science listed units (36cp) at level 1,
and ten science listed units (60cp) at levels 2 and 3," chosen from 20+ science
areas. SCI1000 is a real Faculty of Science unit, but it's never named as a
requirement anywhere in E3007's structure — it's one option among dozens, not
a compulsory unit. It had been hard-coded into `common-first-year.json`
(tagged `discipline:"common"`, meaning every specialisation's onboarding/quick
start would auto-add it) since the very first research session, apparently
mistaken for compulsory back then — the mistake predates this session's
detailed sourcing discipline and was never caught until Sahel noticed it
didn't match his actual enrolment.
- Removed entirely (not reclassified — it isn't a genuine requirement for any
  discipline currently in the catalog, Civil included, which has no Science
  component at all). Confirmed nothing else in any catalog file referenced
  SCI1000 as a prerequisite/corequisite before removing it.
- `common-first-year.json` now 6 units (was 7). Catalog-wide total 84 (was 85).
  Re-ran `node scripts/validate-catalog.mjs` — still 0 problems.
- If Sahel's actual Science elective choices are ever worth tracking, they
  belong as custom units (same pattern as Economics' unenumerated elective
  pool), not as a fake "common" catalog entry.

## Animation pass (this session)
Sahel asked for a collapsible catalog sidebar (with an open/close animation),
an animation for placing a unit whether by drag or by the catalog +/arrow
button, and free rein on anything else worth adding — same "Ledger, evolved"
visual language throughout, nothing gradient/pill-shaped/emoji-based per the
existing design guardrails.
- **Sidebar collapse/expand** — new `.sidebar-toggle` button (chevron icon,
  flips 180° when collapsed) sits on the border between catalog and main
  content. `.catalog`'s `width` animates 320px→0 (`overflow-x:hidden` so
  nothing spills out mid-transition), content fades via a separate faster
  opacity transition so text doesn't visibly squash first. State persists in
  its own `e3007-sidebar-collapsed-v1` localStorage key (separate from the
  main plan blob — it's a UI preference, not plan data) and is restored
  instantly on load (set before the first paint, so reopening the app never
  shows a spurious animation). Disabled below the existing 860px mobile
  breakpoint, where the sidebar already stacks above the grid instead of
  sitting beside it — collapsing it there wouldn't reclaim useful space and
  would just add complexity, so the toggle button is hidden and any
  collapsed state is neutralised back to full width by a media query.
- **Placing a unit down** — the existing fresh-add entrance animation
  (`card-enter`/`cardIn`) got more physical: a slight overshoot-and-settle
  (drop in, rise 2px past rest, ease back) instead of a flat fade+slide.
  Added a **second, distinct animation (`card-settle`)** for the case that
  had *zero* animation before: dragging an already-placed unit to a
  different cell, or using its own move-`<select>` dropdown — previously
  these caused an instant jump-cut (vanish from the old cell, reappear in
  the new one, no transition at all). A one-shot `justMovedCode` variable
  set right before the relevant `refreshAll()` call tells the next
  `renderGrid()` which card to mark `card-settle` instead of `card-enter` —
  a quick scale+shadow pop rather than a full fade-in, since the card was
  already visible, just relocated. Tested all three paths via synthetic
  events (catalog add → `card-enter`; per-card select move → `card-settle`;
  synthetic `DragEvent('drop')` → `card-settle`, landed in the correct slot).
- **Other polish, self-directed**: a subtle scale/slide entrance for every
  modal (onboarding, settings) instead of just the veil fading in; catalog
  folders now get a brief fade+drop-in reveal when a user actually opens one
  (native `<details>` doesn't animate its own reveal; hooked the existing
  `toggle` event listener, which only fires on genuine clicks — never on the
  programmatic `.open` sets during a routine re-render — so this can't
  misfire every time the catalog rebuilds); catalog rows now nudge right
  slightly on hover, matching the lift the plan-grid cards already had, for
  a more consistent "everything here is grabbable" feel.
- All of the above respects the existing global
  `prefers-reduced-motion: reduce` override (durations already forced to
  ~0 there), so nothing new bypasses that.

## Civil data re-audit + cross-platform animation fixes (2026-09-14)
Sahel's Civil-engineering friend, trying the planner, reported prerequisite/
semester data looking wrong (specifically: "Structural design" shown as
Semester 2 when it's actually Semester 1) — and separately that the
animations looked less smooth on his (non-Mac) laptop than on Sahel's.

**Civil data re-audit.** Ran a full Handbook re-check of all 15 civil.json
units via a background research agent, this time against the CURRENT
Handbook (`handbook.monash.edu/current/units/{CODE}`), not just the 2024
archive the original research used — Monash's course structure and unit
offerings shift year to year, and this was 2 years stale. The friend was
right, plus more was found:
- **CIV3294 (Structural design)** — the reported bug, confirmed: it's
  Semester 1 only, not "both" as the 2024-sourced data claimed.
  `semesterOffered` corrected to `"1"`. Its canonical slot stays at Y3S2
  though, not moved to Y3S1 — moving it collides with its own prerequisite
  CIV2206 (which can't be pulled any earlier than Y3S1 without landing in the
  same semester as ENG1011, itself pinned at Y2S1 by Sahel's own
  foundation-maths first-year pathway), and moving downstream would need a
  Y5S1 that doesn't exist in this 4-year single degree. Kept at Y3S2 with the
  tension fully documented in its notes — same treatment as the existing
  ECE3161 precedent in electrical.json: correct the data, accept the
  resulting off-semester flag at the canonical slot, let warn-not-block
  surface the real tension rather than hiding it. (First attempt actually
  moved CIV2206 earlier to "fix" this cleanly — caught as wrong by writing a
  standalone chronological-ordering check, since ENG1011 itself sits at Y2S1,
  not the standard-pathway Y1S2. Reverted before it shipped.)
- **CIV4286 (Project management for civil engineers)** — gone entirely from
  the current Handbook (404, zero search results), past the 2024 vintage's
  "replace with a Professional Practice unit" instruction. Removed from the
  catalog outright (was 15 units, now 14) — same "not in the catalog, add the
  real replacement as a custom unit" treatment as ECE4099.
- **CIV4249 (Foundation engineering)** — was "not offered in 2024," now
  genuinely offered Semester 1 only. `semesterOffered` corrected from
  `"unknown"` to `"1"`, moved from its old Y4S2 placeholder to Y4S1 to match,
  picked up a new prohibition (CIV5149, the postgrad equivalent).
- **Stale prohibition codes** — CIV2241, CIV3264, CIV3222, CIV2226 have all
  been retired/404'd from the Handbook since 2024. Removed from CIV2242 (also
  lost its specific ENG1011+ENG1014 prereqs — the current Handbook only has a
  generic 30cp-of-engineering-study rule now) and CIV3285; replaced with
  current postgraduate-level equivalents on CIV4280 (→CIV5170) and CIV4288
  (→CIV5178).
- Full per-unit source citations and the complete diff are in civil.json's
  `_meta.sources`/`openDecisions`. Re-ran `node scripts/validate-catalog.mjs`
  (83 units now, was 84 — 0 problems) plus a standalone chronological-order
  sanity script (every prerequisite genuinely lands in an earlier semester
  than its dependent, CIV3294's documented by-design exception aside).

**Cross-platform animation fixes.** Three animations in `index.html` were
animating layout/paint properties instead of compositor-only ones — cheap on
a Mac's GPU/compositor pipeline, visibly janky on weaker non-Apple GPUs:
- Sidebar collapse toggle button was animating `left` (position/layout);
  switched to `transform: translateX(...)` (compositor-only), same visual
  result.
- Catalog sidebar's width-collapse animation got `contain: layout paint
  style` + `will-change: width` so its reflow/repaint cost is scoped to just
  the sidebar rather than the whole page.
- The "card settle" animation (plays when dragging or select-moving an
  already-placed unit) was animating `box-shadow` directly in its keyframe —
  a classic non-GPU-accelerated animation, forces CPU repaint every frame.
  Moved the shadow onto a `::after` pseudo-element and animate only its
  `opacity` instead (compositor-only), same "pop" effect.
- Verified live: sidebar collapse/expand, and a select-triggered card move
  (confirmed via computed styles that the card's own box-shadow never
  changes value now — only the `::after` layer's opacity animates). No
  console errors. Testing on the friend's actual (non-Mac) laptop is still
  the real proof — worth asking him to check again next time he tries it.

## Data-accuracy hardening before Mechatronics (2026-09-16)
Sahel asked, before any Mechatronics work started, to confirm there's a real
*system* for getting prerequisites, semester offerings and unit facts right —
because the Civil data had mistakes his friend caught by hand. Fair challenge.
The honest answer was that the Civil pipeline had three holes, all of which
are now closed by machine checks rather than by promising to be careful:

**Root causes of the Civil errors (named, not hand-waved):**
1. **Wrong Handbook vintage.** Research read `handbook.monash.edu/2024/units/...`
   (matching Sahel's own intake) instead of `/current/`. Monash moves offerings
   and requisites year to year; the data was 2 years stale on arrival. That's
   what produced the CIV3294 "Semester 2" error the friend reported.
2. **No machine check on the facts, only on the shape.**
   `validate-catalog.mjs` verified structure (fields, dangling refs, cycles) but
   nothing about whether a unit was placed in a semester it's actually taught,
   or whether a prerequisite genuinely lands earlier than its dependent. A
   chronological check was written ad-hoc during the re-audit and then thrown
   away instead of being kept.
3. **No provenance in the data.** Sources were file-level prose in `_meta`, so
   there was no way to tell which unit was checked, against which URL, on what
   date — staleness was invisible until a human noticed.

**What changed (`scripts/validate-catalog.mjs`, now 4 new checks):**
- **Placement vs offering** — a unit's canonical `year`/`semester` slot must be
  a semester it's actually taught in. Violations are FATAL unless the code is
  in the new `PLACEMENT_EXCEPTIONS` map with a written reason.
- **Prerequisite chronology** — every prereq must sit *strictly* earlier in the
  sequence than the unit needing it (same-semester = corequisite, not prereq).
- **Corequisite chronology** — a coreq may be earlier or same-semester, never
  later.
- **Per-unit provenance** — a data file opting in with
  `"_meta": { "provenance": "per-unit" }` must give every unit a `sourceUrl`
  (must be a handbook.monash.edu URL) and an ISO `verifiedOn` date. Existing
  files predating the convention are left alone until they're re-audited, so
  no verification dates get fabricated for units nobody actually re-checked.
- Verified the checks actually FAIL by running them against a deliberately
  broken fixture (8 synthetic units, one bug of each class) — all 4 fired,
  exit 1. A validator that has only ever been run on passing data isn't
  evidence of anything.

**What it immediately caught in existing data — 7 placement/offering
mismatches, only 2 of which were previously known:**
- `ECE3161`, `CIV3294` — the two already-documented verified conflicts (real
  Handbook offering vs. a prereq chain with nowhere else to go). Now printed
  as loud acknowledged exceptions on every run instead of living only in prose.
- `ETC2520`, `ETC2420`, `ETC3400`, `ETC3450`, `FIT3179` (all commerce.json) —
  **not previously known.** Every one of them has a note that literally says
  "Semester 2 only" while sitting in a Semester 1 slot. Same bug class as the
  Civil one, five instances, never spotted. Listed as UNVERIFIED exceptions
  rather than silently moved — commerce.json is still 2024-vintage and needs
  the same current-Handbook re-audit civil.json got, and guessing a new slot
  without re-verifying would just be the original mistake again.

**Confirmed for the Mechatronics build:** specialisation is "Robotics and
Mechatronics engineering", area-of-study code **ROBMCTRN04** (144cp), found
the documented way — E3001's current Structure page → AoS link — not guessed.
(A guess at `MECTRONG01` 404'd first, which is exactly why the pipeline starts
from the course structure page.) Current Handbook confirmed reachable via the
browser pane.

## Mechatronics added + official course maps + full re-audit (2026-09-16, same session)
Sahel asked for Robotics & Mechatronics for a friend, but first asked to CONFIRM there was a real
system for getting requisites/semesters right, since the Civil data had errors his friend caught.
Answering that honestly turned into a much larger correction pass. He then supplied the two
official course progression map PDFs, which removed the biggest source of error entirely.

### The harvester — the actual answer to "do you have a system"
`scripts/harvest-handbook.mjs` (new, zero-dependency Node). The Handbook is a Next.js app that
embeds a `__NEXT_DATA__` JSON payload containing the REAL requisite tree (with genuine AND/OR
containers), the real offering rows per campus, and the enrolment rules as data. Previous sessions
read the rendered page as prose and hand-collapsed "A or B and C" sentences — lossy, and the direct
cause of the Civil errors. The harvester reads the structured payload instead.
- Fetches over plain HTTPS (no browser needed, no Cloudflare block on handbook.monash.edu).
- Emits requisites as **conjunctive groups** — `[[A,B],[C]]` meaning "(A or B) AND C" — which is
  what a planner actually needs: one representative satisfied PER GROUP.
- Derives `semesterOffered` **per campus**, because a unit can run S1 at Clayton and S2 in Malaysia.
- Deliberately emits NO year/semester: placement comes from the course map, not the unit page.
  Conflating the two is how inferred sequencing got mistaken for Handbook fact before.
- Usage: `node scripts/harvest-handbook.mjs --codes-from data/x.json --out h.json CODE...`

**It caught a bug in its own first draft.** The initial representative-picker took one code across
the whole flattened rule, which silently dropped an entire required group on MMA3101
(`(MMA2003 or ...) AND (MEC3456 or MMA3001 or ECE3093)`). The validator's chronology check caught
it. That is the system working: two independent mechanisms, not one careful pass.

### Official course progression map PDFs (supplied by Sahel 2026-09-16)
Previous sessions could not fetch these (Cloudflare), so ALL placement was inference. Sahel
downloaded both. **They are not committed** — the repo is public and they're Monash documents.
- `2025-map-E3001.pdf` — 12 pages, single degree. p1 common first year, p6 Electrical, p10 Robotics
  and Mechatronics.
- `2025-map-E3005.pdf` — 10 pages, Eng(Hons)+Commerce. p5 Electrical and Computer Systems.

### Corrections to EXISTING data (all Handbook- or map-verified)
- **E3007 is 240cp = a 5-year double degree** (Eng Hons + Science). An earlier claim this session
  that electrical.json's Y5 placements were a "foundation maths shift" was WRONG and was retracted.
- **`ECE3122` is a dead code** — 404. The unit is **`ECE3121`** (Engineering electromagnetics) in
  both the current Handbook and both 2025 maps. Replaced.
- **`ECE3161` is Semester 2, not Semester 1.** PROGRESS previously recorded this as a "VERIFIED
  CONFLICT" needing a placement exception. It was never a conflict — just wrong data from the 2024
  vintage. Both maps put it in S2. The exception has been deleted from the validator.
- **`ENG2005` prerequisites** were `ENG1005 + ENG1014`; the current tree is `ENG1005` alone. NOTE:
  the old entry was correct for the 2025 Handbook (`ENG1005 AND (ENG1060 OR ENG1014)`) and had
  gone stale — it was not fabricated. See "Which Handbook vintage governs" below.
- **`ECE4191`** had 4 invented prerequisites. Real rule: prereq `(TRC3500 OR ECE3141)`, corequisite
  `(ECE3073 OR ECE3161)` — the corequisite was missing entirely.
- **`PHS1001` (Foundation physics) was missing** from common-first-year.json despite being on the
  official common-first-year map. Added, marked `optional` (conditional on VCE Physics <25).
- **NO first-year unit has a unit-coded prerequisite.** Every first-year rule is a VCE entry
  requirement. `ENG1090` was listed as a hard prerequisite of `ENG1005` — removed, because it
  would have flagged every student who met the VCE Specialist Maths score instead.
- **`ENG1011`/`ENG1012` were at Y2S1**; every official pathway puts them in Year 1. Whole common
  first year re-placed from map page 1 (the "no foundation units" pathway is canonical).
- **`ENG1012` renamed** by Monash: "Engineering design" (2025) → "Engineering for people and
  planet" (current). 2025 name kept in notes.
- **electrical.json re-placed to the official E3005 sequence** (map p5). Ten units moved — the
  engineering sequence had been up to a FULL YEAR late. Endpoints (ENG4701/4702 at Y5) were right.

### Per-course placements — the shared-unit problem, solved
The same unit sits at different points in different courses: `ENG4701` is Year 4 in the 4-year
E3001 single degree and Year 5 in the 5-year E3005 double degree. One canonical slot cannot serve
both, and duplicating codes is rejected by the validator.
- Units now take an optional **`placements`** map keyed by course code:
  `"placements": { "E3001": { "year": 4, "semester": 1 } }`, with the top-level year/semester as
  the default. A data file never has to enumerate every course to stay correct.
- `index.html` gained `activeCourseCode()` (E3005 when the Commerce toggle is on, else
  `COURSE_CODES[spec]`) and `unitSlot(u, spec, commerce)`. Used by the catalog row's "canonical"
  label, catalog add, quick-start counts and quick-start placement.
- Only 4 units actually needed an override: `ENG2005`, `ENG4701`, `ENG4702`, `ENG0001`.

### `sharedWith` — a unit in two specialisations without being universal
`ECE2071`, `ECE2072`, `ECE2131`, `ECE3073` are Part C CORE for both Electrical and Mechatronics,
but Civil never touches them — so tagging them `discipline:"common"` would be wrong, and the
single-valued `discipline` field hid them from Mechatronics students entirely (they were missing
from the friend's quick start). New optional **`sharedWith: ["mechatronics"]`** array; the catalog
files a shared unit under the borrowing discipline's folder only when its own folder isn't on
screen, so it never appears twice.

### `optional` — quick start was overstating the degree
Quick start auto-placed conditional foundation units (`ENG1090`, `PHS1001` — required only without
the VCE scores) and all four `ENG480x` Professional Practice units (you complete exactly ONE), plus
every Part E elective. Now `quickStartEligible()` skips `type === 'elective'` and anything marked
`optional: true`.

### data/mechatronics.json — 26 units
`ROBMCTRN04`, 144cp, E3001, Clayton, `provenance: "per-unit"` (every unit carries its Handbook URL
and `verifiedOn`). AoS unit list verified **identical between the 2025 and current Handbook**, so
there is no vintage ambiguity for a 2025 commencing student.
- **Part C**: 10 specialisation units placed straight off map p10 + the 4 ENG480x (choose one).
  The other 7 Part C units are shared with electrical.json and not duplicated.
- **Part E**: 12 technical electives. **11 of the Handbook's 29-unit pool have NO Clayton
  offering** (Malaysia-only or not offered at all: ENG0002, TRC2001, MMA3102, CHE4806, CHE4807,
  ECE4044, ECE4146, TRC4200, TRC4902, ECE5881, MEC3821) and are deliberately omitted. `ECE4045` is
  also omitted — its prereq ECE3141 sits at Y4S1, leaving no valid slot inside a 4-year degree.
- **Cross-validation that would have caught the Civil bug**: every Part C unit's Handbook offering
  semester matches its official map placement. Two independent sources agreeing, not one asserted.

### Pre-commit double-check caught one more fabricated edge
Before committing, every unit in the three touched files was re-fetched from the Handbook and
diffed field-by-field (title, credit points, Clayton offering, source URL, every requisite code)
rather than trusting the write. Two corequisites in the data were absent from the structured
requisite tree:
- **`ENG4701` -> `ENG0001` is REAL** — it lives in the free-text enrolment rule ("Clayton-based
  students must also be concurrently enrolled in ENG0001 alongside ENG4701"), which the first pass
  of the checker didn't read. Kept, with the rule quoted verbatim in corequisiteText.
- **`ENG1014` -> `ENG1005` is NOT REAL** (in any vintage — this one genuinely was fabricated). ENG1014's only corequisite is a course-enrolment rule
  ("must be enrolled in the Bachelor of Engineering (Honours)..."). The ENG1005 edge was invented
  at some earlier point and had never been challenged. **Removed.**
The checker now tests the structured tree AND the free-text rules; re-run clean across 49 units.
Lesson worth keeping: "the validator passes" is not the same as "the data is true" — the validator
checks internal consistency, the harvest diff checks correspondence with reality. Both are needed.

### Verified live, not claimed
- `node scripts/validate-catalog.mjs` — **110 units across 5 files, 0 problems.**
- Independent re-verification of all 49 units in the touched files against a FRESH Handbook fetch:
  every title, credit-point value, Clayton offering, source URL and requisite code matches.
- Quick start as Mechatronics → 23 units / 132cp, **matching official map p10 slot-for-slot**.
  Reconciles: 108cp Part C + 36cp Part E + 48cp first year = 192cp = 4 years.
- Quick start as Electrical+Commerce → **matches official E3005 map p5 slot-for-slot**, Y2S1
  through Y5S2, from the same catalog at the same time.
- Sidebar for Mechatronics shows "Common core (11)" + "Robotics and Mechatronics Engineering (30)";
  branding reads "E3001 · Robotics and Mechatronics Engineering". Topbar year corrected 2024→2025.
- localStorage cleared afterwards.

## Which Handbook vintage governs — settled (2026-09-16)
Sahel pushed back on a correction with a screenshot: the 2025 Handbook shows ENG2005 requiring
"(ENG1014 OR ENG1060) AND ENG1005", but he took the unit in 2026 where the only prerequisite is
ENG1005. He was right, and the earlier commit message overstated the case: it said "ENG1014 was
never a prerequisite". **It was** — in 2025, as one branch of an OR group. The old catalog entry
was CORRECT for the 2025 vintage and had rotted, which is a different failure from a fabrication.
(The ENG1014 -> ENG1005 corequisite removed earlier in the session WAS a genuine fabrication —
it appears in no vintage. Two different problems, and they should not have been described alike.)

**The governing rule, which is a split one:**
- A unit's **requisites/offerings** are those published for the year you **ENROL in that unit**.
- A course's **structure** (which units the degree requires) locks at the year you **COMMENCED**.

So the catalog tracks the **current** Handbook for unit facts and the **commencing year** (2025)
for course structure. That is what was already built — ROBMCTRN04's structure was checked 2025 vs
current and found identical, so the split never surfaced until Sahel asked.

**`scripts/check-vintage-drift.mjs`** (new) compares any two Handbook years and reports only
SUBSTANTIVE changes. It normalises requisites structurally before comparing, because the Handbook
reorders groups freely — a raw string diff reported 17 differences where only 8 were real, and
9 were "(A or B) AND C" vs "C AND (B or A)".

**2025 -> current across the 49 units in the three audited files: 15 real changes in 14 units.**
- 7 units (MMA2001/2002/2003/2004/2005, MMA3001, MMA3101) **do not exist in the 2025 Handbook at
  all** — new from 2026. The 2025 progression map already lists them ("Replacing MEC2402",
  "Replacing TRC2201", "Replacing TRC3600", "Replacing TRC4802"), so the map anticipated units the
  2025 Handbook had not published yet. A 2025 commencer reaches them in 2026, when they exist, so
  tracking current is correct for both Sahel and his friend.
- ENG2005 prerequisite loosened (the one Sahel spotted). ECE2111 gained an ENG2005 corequisite.
  ECE3121 tightened to ENG2005 AND ECE2131. TRC3200/TRC4800 gained the new MMA units as accepted
  alternatives. TRC4407 lost its prerequisite and gained a Clayton Semester 2 offering.
  ENG1012 renamed.
- All 14 now carry a `vintageNote` in the data, and the three files carry a `_meta.vintagePolicy`
  stating the rule above, so "why does this say X when I remember Y" answers itself.

## Civil re-audited through the harvester + drift check (2026-09-16)
Ran civil.json through `harvest-handbook.mjs` and `check-vintage-drift.mjs`.

**The 2026-09-14 page-reading re-audit held up on unit FACTS: 0 mismatches** on titles, credit
points, Clayton offerings, prerequisites and corequisites across all 14 units. Drift 2025 ->
current is a single change (CIV2242 lost its specific prerequisites for a generic 30cp rule),
which that audit had already caught. Credit where it is due.

**But the harvester had a bug that had been hiding every prohibition in the project.** The
Handbook's requisite type for prohibitions is `prohibitions` (PLURAL) while prerequisites come
through as `prerequisite` (singular). The parser only matched the singular, so `prohibition` came
back null for every unit — indistinguishable from "this unit has none". A false clean bill of
health, and it means the prohibition checks earlier in this session verified nothing at all.
Fixed with a type-alias map; re-ran everything.
- **mechatronics.json had NO prohibitions on any of its 26 units** — it was generated with the
  broken parser.
- **ECE3121 prohibited ITSELF** — the ECE3122 -> ECE3121 rename updated the code but not its own
  prohibition list. The Handbook says it prohibits ECE3122.
- Re-synced prohibitions across all four files from the Handbook: **+88 added, -4 removed**
  across 29 units. A catalog-only prohibition is now kept only if it appears in the free-text
  enrolment rules; Civil's six "stale" ones turned out to be correct all along.

**Civil placements are now official, not inferred.** Page 5 of the 2025 E3001 map. Five units
moved — and one of them is the bug that started all of this:
- **CIV3294 (Structural design) Y3S2 -> Y3S1.** Sahel's friend reported months ago that Structural
  design showed Semester 2 when it is Semester 1. The 2026-09-14 audit fixed `semesterOffered` but
  KEPT the Y3S2 placement, documenting a "VERIFIED CONFLICT" because moving it would collide with
  its prerequisite CIV2206. The official map puts CIV2206 at **Y2S1**, not Y3S1 — so there was
  never a conflict. The entire documented tension was an artifact of inferred placement. The
  exception has been deleted from the validator and the friend's original report is now fully
  resolved.
- CIV2206, CIV2263, CIV2282 Y3S1 -> Y2S1; CIV3285 Y4S1 -> Y3S1.
- civil.json's `_meta` no longer claims placement is Claude's own suggested sequencing.

**Professional Practice units unblocked for every specialisation.** ENG4801/4802/4803/4804 were
tagged `discipline:"mechatronics"` purely because mechatronics.json is the file they were first
written into — which hid them from Civil and Electrical students, who each need one to graduate.
Retagged `discipline:"common"`, with the per-specialisation map slots documented on the units
(Civil Y3S1, Mechatronics Y4S2, Electrical Y4S1 in E3001 / Y5S1 in E3005). They are `optional`,
so quick start never auto-places one at the wrong slot. **This resolves the open item left when
CIV4286 was removed** — the replacement no longer has to be added as a custom unit.

**Verified:** validator clean (110 units, 5 files); all 63 units across the four audited files
re-diffed against a fresh Handbook fetch including prohibitions and free-text rules — everything
matches; quick start as Civil matches official map page 5 slot-for-slot, as Mechatronics matches
page 10. (First run of that test showed Civil at the OLD slots — stale browser HTTP cache of
data/civil.json, not a code bug; confirmed by diffing on-disk against in-memory, then re-run
clean after a cache-bypassing reload. Worth remembering when testing data edits locally.)

## commerce.json re-audited — catalog now 100% Handbook-verified (2026-09-16)
Last file through the harvester. It was still 2024-vintage, two years unchecked.

**Requisites were clean — 0 issues across all 46 units.** The original Commerce research was sound
on prerequisites and corequisites, as Civil's was. The failures were elsewhere:
- **ETF3500 (High dimensional data analysis) is a 404** — removed, same as ECE3122 and CIV4286.
  Nothing referenced it.
- **6 title/offering corrections**: ACX3150 both->S1, BFC3341 both->S2, BFX3355 both->S1,
  ETC2420 S2->both, ETC3550 S1->S2, and BTC3200 retitled "Finance law" -> "Banking and finance law".
- **14 units had prohibitions missing entirely** — the plural-key parser bug again.
- **The 5 placement contradictions flagged earlier this session are RESOLVED.** ETC2420 fixed
  itself (it genuinely runs both semesters now). The other four plus ETC3550 were moved to the
  semester they are actually taught. **`PLACEMENT_EXCEPTIONS` is now EMPTY** — every unit in the
  catalog sits in a semester it is really offered, with no exceptions carried.
- Part A core placements were checked against the official 2025 E3005 map page 5 and were
  **already correct**.

**Known limitation, now detected instead of silent.** `toGroups` flattens a rule shaped
OR-of-AND into a single alternatives list, losing the conjunction. Found via FIT2094, whose real
rule is "(FIT1045 OR FIT1048 OR FIT1051 OR FIT1053) OR (ENG1013 AND ENG1014)" — the flat array
wrongly implies ENG1013 alone suffices, when an engineering student needs ENG1013 AND ENG1014
together. The harvester now emits `groupsAreLossy`; a scan of the whole catalog found exactly
**two** affected units (FIT2094, and ENG1013's own prohibition), both now carrying an explicit
RULE LOGIC NOTE. The `expression` string was always faithful — only the flat array is lossy.

**Vintage drift 2025 -> current: 20 changes across 17 units.** Most are prohibition additions for
new Indonesia-campus equivalents (ACI1001, ECI1100, MKI1120, MGI1010, BTI1010, ETI1100) —
irrelevant to a Clayton student. Six substantive ones carry a `vintageNote`, notably FIT2094
gaining the ENG1013+ENG1014 engineering pathway and ETC3550 moving to Semester 2.

### Catalog status: fully verified
- `node scripts/validate-catalog.mjs` — **109 units, 5 files, 0 problems, 0 acknowledged
  exceptions.**
- **All 109 units** re-diffed against a fresh Handbook fetch: titles, credit points, Clayton
  offerings, prerequisites, corequisites AND prohibitions, checked against both the structured
  requisite tree and the free-text enrolment rules. Everything matches.
- Every catalog file now carries `provenance: "per-unit"`, so every unit has its own Handbook URL
  and verifiedOn date, plus a `vintagePolicy` and a `placementSource`.
- Quick start verified for Civil, Mechatronics and Electrical+Commerce; no console errors.

**Every placement in the catalog is now sourced from an official Monash progression map.** No
discipline still relies on inferred sequencing. The only remaining suggested placements are
elective-pool slots (Civil Part E, Mechatronics Part E, Commerce Part B majors), where the map
itself only says "technical elective" / "major unit N" and the choice is genuinely the student's —
each carries the unit's real offering semester and is labelled suggested in the data.

## Clayton confirmed; Electrical labelled E3005, not E3007 (2026-09-16)
Two clarifications from Sahel that close open items rather than opening them.

**Campus: everyone using the planner is Clayton-based.** The "CAMPUS ASSUMED CLAYTON" caveat in
mechatronics.json is now a CONFIRMED note. The 11 Part E units with no Clayton offering stay
omitted, and ENG0001 (not ENG0002) is the correct Part D unit. Only revisit if a Malaysia-based
student ever uses it.

**The E3007 map was never needed — that was my confusion, not a missing document.** Sahel had
already sent the map that matters. E3007 is Engineering + Science, his CURRENT enrolment;
E3005 is Engineering + Commerce, the course he is transferring into and planning against. Asking
repeatedly for an E3007 map was asking for the sequence he is leaving.
- The real defect was narrower: electrical.json holds the official E3005 sequence, but
  `COURSE_CODES` still mapped Electrical to 'E3007', so with the Commerce toggle OFF the app
  printed "E3007 ·" above slots that are E3005's. Labelling a sequence with the wrong course code
  is a lie even when the slots themselves are right.
- `COURSE_CODES.electrical` is now `'E3005'`, and electrical.json's `_meta.courseCode` matches,
  with a `courseCodeNote` recording that E3007 shares the engineering unit set but interleaves
  Science instead of Commerce and has its own map we deliberately do not hold.
- Fixed the resulting duplicate: the eyebrow read "E3005 · ... + Commerce (E3005)". The suffix now
  drops the parenthetical when the course code is already E3005. Civil + Commerce still shows
  "(E3005)", which is informative there since Civil's own code is E3001.

Verified across all four views: Electrical "E3005 · ... + Commerce", Civil "E3001 · Civil
Engineering", Mechatronics "E3001 · Robotics and Mechatronics Engineering"; ECE2071 resolves Y2S1
everywhere, ENG4701 Y5S1 under E3005 and Y4S1 under E3001. No console errors.

## Next up
- Once Sahel actually picks a Commerce major, trim the other 3 out (or just
  leave them — they don't affect validation, only add sidebar length).
- Optional, only if he wants it later: prereq/coreq checking for custom units
  too (he'd need to name which catalog/custom codes they depend on).
- If the E3005 transfer is confirmed: update electrical.json's year/semester
  placements to match the double-degree sequence (see note above).
- Phase 2 (future, not now): adding another discipline is now "research its
  AoS code + units the same way Civil was done, write its data file with a
  `discipline` tag, add one line to manifest.json, run
  `node scripts/validate-catalog.mjs`" — no index.html changes needed unless
  its course code should show in `COURSE_CODES`.
- CIV4249's real 2024 non-offering and CIV4286's Handbook-mandated
  replacement are documented but not yet resolved with an actual substitute
  unit — same "add as custom unit once decided" pattern as ECE4099.
- **"What's left to graduate" view (Sahel liked this idea, 2026-09-13)** — a
  progress-focused view answering "given what I've placed so far, what still
  needs to go in before I can graduate?" Not scoped/designed yet; worth
  thinking through against the credit-point/level rules already known (e.g.
  Civil's 144cp Part C + Part D + Part E structure, Commerce major
  credit-point minimums) rather than just counting placed units.
- E3007 (Eng+Science, Sahel's pre-transfer enrolment) is deliberately NOT mapped — he plans
  against E3005. Only worth revisiting if the transfer falls through.
- **More disciplines (Sahel confirmed interest, 2026-09-13)** — same session
  discussed expanding breadth using the Civil-style pipeline (AoS code →
  parallel Handbook research → `discipline`-tagged data file → one
  manifest.json line → `node scripts/validate-catalog.mjs`). No specific
  discipline requested yet (Mechanical/Chemical/Aerospace/Software/Robotics
  &amp; Mechatronics/Materials/Environmental all still open per E3001's
  Handbook list) — ask which one(s) when he's ready to pick up this thread.
