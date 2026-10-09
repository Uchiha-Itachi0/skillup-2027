# Skill-up 2027

My public learning tracker: DSA, databases and system design, and AI engineering, from October 2026 to December 2027. The goal is to pass interviews without AI help.

Built with Next.js. Every page reads from the JSON files in `src/data/`, so updating the site means editing data, not code.

## Data files

| File | What it holds | Update when |
| --- | --- | --- |
| `log.json` | One entry per thing done: `problem`, `resolve`, `theory`, `post`, `anki`, `mock`. Drives the heatmap, streak and weekly score. | Every learning session |
| `dsa.json` → `log` | Each problem solved: date, minutes, hints, my pattern line, re-solve results (`"pass"`, `"fail"` or `null`) for d1/d3/d7/d21 | A new problem or a re-solve |
| `dsa.json` → `groups` | NeetCode 150 groups; the current group lists its problems by name | Starting a new group: replace `count` with its `problems` list |
| `journal.json` | Notes on what clicked, newest first. Track is `dsa`, `systems`, `ai` or `plan`. | Something makes sense |
| `ai.json` | The AI path: blocks with `status` `done` / `current` / `next` | A block finishes |
| `plan.json` | Phases, track stops (`done` / `current` / `next`) on the map, rules, job gates | A topic finishes |
| `profile.json` | Name, links, start and goal dates | Rarely |

Dates are `YYYY-MM-DD` in India time. A failed re-solve restarts that problem: set `solved` to the fail date and clear its re-solves.

Pages revalidate every hour, so "due today" stays correct between deploys. Pushing to `main` redeploys on Vercel.

## Run locally

```bash
npm install
npm run dev
```
