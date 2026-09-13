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
- Live at https://tokyoflexin.github.io/Monash-ENG-Course-Map/

## Current state (quick orientation — read this first, details below)
The planner is live and has been through several iteration rounds since
initial deploy. As of now:
- **Catalog**: 85 units across 4 files/disciplines — Common core (7) +
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
