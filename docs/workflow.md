# workflow

Canonical copy. `CLAUDE.md` points here.

## Roles

- **Chat** (claude.ai Project "conductor", linked to this folder): plans, reviews, decides, writes `docs/NEXT.md`. Never edits app code.
- **Code** (a fresh Claude Code session per step): builds exactly what `docs/NEXT.md` says, then reports.
- **Sam**: runs the app locally, tests on the phone, answers the few questions chat asks, does the git steps in VS Code, starts the next session.

## Memory (all in `docs/`)

| file | writer | what |
| --- | --- | --- |
| `NEXT.md` | chat | the ONE prompt for the next Code session. Overwritten each step. Names the map section to read. |
| `REPORT.md` | Code | ~30 lines from the template inside it. Overwritten each session. |
| `STATUS.md` | Code | current build, last/next batch, open decisions, pending phone checks. Under ~40 lines. Points to `map.md`, never copies it. |
| `decisions.md` | both | append-only one-liners (date, id, answer). Settled means never re-ask. |
| `map.md` | both | the roadmap: inventory, dependencies, batches (B0, B1...) in dependency order, numbered steps (1.1, 1.2...) each with a phone check. Off-plan steps get a letter (1.1b). New steps, decisions and notes go under their batch in the same session. |

## The loop

1. Sam: "Fresh session. Do docs/NEXT.md."
2. Code builds, bumps BUILD, runs `npm run check`, writes REPORT / STATUS / decisions / map. Its last message is short: build, how to run locally, phone taps, VS Code steps.
3. Sam runs the app locally (`npm run dev -- --host`), tests on the phone, then in VS Code reviews the diff, commits and pushes `dev`.
4. Sam opens a new chat in the Project: "Review." plus notes.
5. Chat reads the files, flags drift or Sam jumping ahead of the map, decides reversible things itself, asks Sam at most 3 taste / scope / money questions (each with a default), overwrites `NEXT.md`, and ends with **YOUR NEXT ACTION**.

A Code thread is only reused for a one-line yes/no blocker mid-step. Anything bigger ends the step with a report.

## Decision protocol

- Reversible and technical: decide, log in `decisions.md`.
- Taste, scope, money: ask Sam (max 3 per review), each with a recommended default; if unanswered, the default stands.
- Settled decisions are never re-asked. Check `decisions.md` first.

## Model and token habits

- Default Sonnet, medium effort. Opus planning only for steps that are expensive to undo.
- Ask for a plan first on anything touching 3+ files.
- Code does not run e2e unless NEXT.md says so. Code does not start the dev server; it tells Sam how.
- Open only the files NEXT.md names.

## Git (Sam, in VS Code)

Work on `dev`. Code gives the commit message and push reminder at the end of each session. `main` is the live site and deploys on push, so merge `dev` into `main` only after a batch is approved on the phone.

## Paste into the Project's instructions

> You are the conductor for hey you. You plan, review and decide; you never edit app code. The repo is linked: read `CLAUDE.md`, `docs/workflow.md`, `docs/STATUS.md`, `docs/REPORT.md`, `docs/decisions.md` and `docs/map.md` at the start of every "Review." chat. Check REPORT against NEXT.md and flag drift, and flag if Sam is jumping ahead of the map. Decide reversible things yourself and log them in `docs/decisions.md`. Ask Sam at most 3 taste, scope or money questions, each with a default. Never re-ask anything in decisions.md. Update `docs/map.md`, then overwrite `docs/NEXT.md` with the single prompt for the next Code session (name the map section to read; say exactly what to do and what not to). End with "YOUR NEXT ACTION" in one or two lines. Everything you write must respect `MANIFESTO.md`.
