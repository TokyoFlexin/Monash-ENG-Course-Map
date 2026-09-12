Monash Course Map

You drag units onto a Year × Semester grid. The catalog knows the real Handbook: credit points, prerequisites, corequisites, prohibitions, and which semester a unit is actually offered. It flags problems as you go, but it never stops you. Want to put ENG1012 in Year 4? Go ahead. It'll raise an eyebrow, not a barrier.

→ Open the planner

Why this exists

Planning an Engineering (Honours) degree at Monash means holding a mess in your head. What unlocks what. What clashes with what. Which units only run in Semester 1, and whether that elective you actually want counts toward anything. The Handbook has all of it, spread across dozens of pages that never talk to each other.

So I built the thing I wanted. One grid, every rule loaded in, nothing hidden. Advisers block you and spreadsheets don't know the rules. This sits in between: it knows what the Handbook knows, then it gets out of your way.

It covers E3007 (Electrical & Computer Systems Engineering) first, with a Commerce side wired in for anyone thinking about the E3005 double-degree transfer.

What it does

Place units, see problems instantly

Drag-and-drop across a Years 1–5 × Semester 1–2 grid, with a plain dropdown as a fallback on mobile
Missing a prerequisite? The card tells you. Drop two units together that prohibit each other and it catches that too. Park something in a semester it isn't offered and you get a "not usually offered in S2" note.
Every flag clears the moment you fix it. Move the prereq earlier and the warning just disappears.

See the whole dependency chain

Click any unit and its lineage lights up: everything it depends on in amber (upstream), everything that depends on it in blue (downstream). One click and you know what a change ripples into.

A real catalog, organised sanely

70 units in a collapsible folder tree with counts on each folder. 23 are electrical or common first-year, 47 are commerce.
Search auto-expands whatever matches
Add your own custom units for anything outside the catalog (looking at you, economics electives)

Made yours

It asks your name on the first visit. The header then reads "{Your name}'s course plan", with a little ink-stamp monogram of your initials.
Quick-start onboarding: pick a cutoff like "Through Y2 S1" and it pre-fills everything up to that point, then hands you the wheel
Export and import your whole plan as .json so it moves between devices
Autosaves locally, so a refresh never eats your work
The look

I went for a "ledger, evolved" feel. Warm paper background, saturated colours by unit type, a left rule and soft shadow on each card so the whole thing reads like a notebook someone actually keeps rather than a form. Headings are Fraunces, everything else is IBM Plex Sans and Mono.

No gradient soup. No emoji standing in for icons. It's meant to look like something a person made on purpose.

Getting started

It's a static site, so there's no build step and no dependencies. No account either.

Just use it: tokyoflexin.github.io/monash-course-map

Run it locally:

bash
git clone https://github.com/TokyoFlexin/monash-course-map.git
cd monash-course-map
# open index.html in your browser, or serve it:
python3 -m http.server 8000
# then visit http://localhost:8000
Status & roadmap

Phase 1 is live and tested. Prerequisite chains, prohibition pairs, all three corequisite states, localStorage persistence, mobile down to 375px, and export/import round-trips are all verified.

Still on the bench:

Commerce major selection (Finance / Economics / Business Analytics / Econometrics)
E3005 double-degree transfer sequencing
Prerequisite checking for custom units

See PROGRESS.md for the running status log.

Fine print

This is unofficial and not affiliated with Monash University. I keep the data as accurate as I can, but the Handbook is the real source of truth, so check it (and your course adviser) before you enrol based on anything here. Found a unit with the wrong data? Open an issue.

Built by a Monash Engineering student who got sick of planning in a spreadsheet.

See task progress for longer tasks.
