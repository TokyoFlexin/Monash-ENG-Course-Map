# Monash Engineering Course Map

A course planner for Monash Engineering (Honours) — you place units into a
Year × Semester grid yourself. The catalog carries real Handbook data (credit
points, prerequisites, corequisites, prohibitions, semester offering) and
flags issues as you go, but never blocks placement.

**[Open the live planner →](https://tokyoflexin.github.io/monash-course-map/)**

## Scope

- **Phase 1**: Electrical & Computer Systems Engineering (E3007, single degree)
- **In progress**: a Commerce side for a possible E3005 double-degree transfer

## Repo guide

| File | What it's for |
|---|---|
| [`PROGRESS.md`](PROGRESS.md) | Source of truth — current state, decisions, what's done and what's next. Read this first. |
| [`CLAUDE.md`](CLAUDE.md) | Instructions for working on this project with Claude Code. |
| [`INSTRUCTIONS.md`](INSTRUCTIONS.md) | The original project brief. |
| [`PERSONALITY.md`](PERSONALITY.md) | How Claude should work and communicate on this project. |
| [`index.html`](index.html) | The planner itself — self-contained, fetches `data/*.json` at load. |
| [`data/`](data) | Unit catalog: common first year, Electrical, Commerce. |
