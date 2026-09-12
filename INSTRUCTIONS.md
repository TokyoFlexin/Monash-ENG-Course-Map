# Monash Engineering Course Map — Project Brief

## What we're building
An interactive course map for Monash Engineering (Honours) specialisations.
Every unit, its year/semester placement, and prerequisite / corequisite
relationships shown as a visual dependency graph a student can plan from.

## Scope discipline (READ THIS)
- Phase 1 = ELECTRICAL ONLY (E3007), including the shared First Year.
- Structure the DATA layer so adding a specialisation later = adding a data
  file, no UI rewrite. Design for expansion, build for one.
- Don't gold-plate. Ship electrical working end-to-end first.

## The 4 steps (in order)

### 1. Research
Authoritative sources:
- Course progression map PDFs:
  https://www.monash.edu/engineering/current-students/enrolment-and-re-enrolment/course-information/course-maps
  (Electrical & Computer Systems single degree = E3007; use the canonical
  commencing-year map I confirmed in setup)
- Unit detail (pre-reqs, co-reqs, credit points, semester): Monash Handbook
  https://handbook.monash.edu/ — search each unit code
- Verify pre-reqs/co-reqs against the Handbook unit pages, NOT just the PDF.
  The PDF shows sequencing; the Handbook shows actual enrolment rules.

For EACH unit capture:
- code, title, credit points
- year + semester normally taken
- prerequisites (codes + any "X of the following" logic)
- corequisites, prohibitions
- type: core / specialisation / elective / free elective / breadth

Note units flagged "From 2026 replace with…" — record both, prefer current.
Write the data as the file below. Log all sources in the Obsidian page.

### 2. Build the UI
- Use the design skills available to you (anti-slop-web-design,
  frontend-design, web-design-guidelines). Must NOT look like generic AI output.
- Present 2–3 distinct design directions FIRST; let me pick before building out.
- Core interactions:
  - Units laid out by year -> semester (grid or timeline)
  - Click a unit -> highlight its prereq chain (upstream) and what needs it
    (downstream)
  - Visual distinction for core vs elective vs breadth
  - Hover/tap -> title, credit points, prereqs in plain language
- Single-page, self-contained, static site, no backend.

### 3. Test
- Every prereq edge points to a unit that exists in the data
- No dangling references, no cycles in the prereq graph
- Layout works desktop + mobile widths
- Highlight-the-chain interaction verified against 3-4 known units
- Show me the check output — don't just claim it passes

### 4. Deploy
- Static hosting, personal use. Recommend the simplest path (GitHub Pages or
  Netlify). Confirm which with me before deploying. Do NOT create accounts or
  push to a public repo without my explicit yes.

## Data model
```json
{
  "specialisation": "Electrical and Computer Systems Engineering",
  "courseCode": "E3007",
  "units": [
    {
      "code": "ECE2072",
      "title": "Digital systems",
      "creditPoints": 6,
      "year": 2, "semester": 2,
      "type": "core",
      "prerequisites": ["ENG1013"],
      "corequisites": [],
      "prohibitions": []
    }
  ]
}
```
Keep specialisations in separate data files so First Year is shared and reused.
