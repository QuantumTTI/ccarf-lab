# CCAR-F Tutor Kit

A self-contained Claude Code tutoring environment for the Claude Certified
Architect – Foundations (CCAR-F) exam. Clone it, open Claude Code, and it
teaches you, drills you, and examines you against all 30 exam task statements.

## Install (first learner)
1. Copy everything in this kit into the root of your `ccarf-lab` repo
   (merge the `.claude/` folder if one exists).
2. Copy `PROGRESS.template.md` → `PROGRESS.md` (gitignored — personal).
3. Commit and push. Run `claude` in the repo.

## Use
- `/teach 1.1`   — guided walkthrough, one verified step at a time
- `/practice 1.1` — independent task; the tutor verifies against acceptance
  criteria and gives feedback, but won't do it for you
- `/quiz 3` · `/quiz weak` · `/quiz mock` — exam-style questions → full
  60-question simulation
- `/progress`    — coverage, scores, weakest areas, exact next step

Rhythm per statement: teach → practice (next day) → quiz. Book the exam when
`/progress` says every statement is Practiced, every domain ≥85%, and a mock
clears the 720 pass mark.

## Teammates
Clone the repo, copy the template to your own `PROGRESS.md`, run `/teach`.
Everything shared lives in git (`CLAUDE.md`, `CURRICULUM.md`,
`.claude/commands/`); progress stays personal. This is itself the exam's
project-vs-user scoping lesson in action.

## Note
Task statement 3.1 (CLAUDE.md hierarchy) uses a separate throwaway sandbox
repo so its experiments never clash with this repo's tutor CLAUDE.md.
