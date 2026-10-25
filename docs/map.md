# map

The roadmap. Edit under the right batch in the same session as any change. Decisions live in `decisions.md`.

## Inventory (as of 2026-10-24, branch `dev` from `main` at edf0f76)

- Built: React + TS + Vite PWA on GitHub Pages `/hey/`; five tabs; welcome, lessons, voice check, catch it, answer it, breathe, book, you/settings, tour; growth practices (ladder, lines, warm, proof) on their own branches; content as JSON under `content/`.
- Docs: `MANIFESTO.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/DESIGN.md`, `docs/growth/PLAN.md`, `docs/review/negativity-audit.md`.
- Known mismatches: companion is "dawn" in `CLAUDE.md` but "sol" in `docs/SPEC.md`; CLAUDE.md's old "where we left off" note was stale (removed).
- Unmerged branches on origin (not yet reviewed): `gentle-learning`, `growth/ladder`, `growth/lines`, `growth/proof`, `growth/warm`, others.
- CI (`deploy.yml`): typecheck, lint, unit, then Playwright e2e on every push and PR; deploy on `main` only. Slow; not yet profiled.

## Dependencies

B0 before everything. B1 (the mark) before B2 (audit) before B3 (rework). B4 depends on B1. B5 last.

## B0 - setup

Goal: workflow files, `dev`, BUILD number, local-run guide, a look at CI speed.
Done when: Sam runs the app locally from Code's instructions and sees the build number on the phone.

- 0.1 Add `src/lib/build.ts` (`BUILD`), show it quietly in you → settings. Write the local-run guide in `README.md` (install, dev server with `--host`, phone URL, firewall tip on Windows). Phone check: open settings on the phone, see "build 1". **Done (build 1), phone-checked 2026-10-24.**
- 0.1b Fix `npm run check` on Windows (D10): rename `src/growth/ladder/ladder.ts` to `ladder-logic.ts` (rename only), forward-slash file keys in `content.test.ts`. `npm run check` passes on Windows. Phone check: settings shows "build 2", the ladder still opens. **Done (build 2), phone-checked 2026-10-24.**
- 0.2 CI speed (D12): chat profiled it (e2e ~370s of ~430s, runs twice per merge). Code skips e2e on push to `main` and on docs-only PRs, reports why e2e doubled, and adds a README tip (phone browser, not the home-screen icon). Phone check: none.
- 0.3 Sam pastes the Project instructions from `workflow.md` into the Project. Phone check: none.

## B1 - the mark

Goal: say what hey you is for and how we would know it works.
Done when: `docs/thesis.md` is written and Sam agrees with it; every feature is mapped to a claim; unsupported claims are listed.

- 1.1 Fix the dawn / sol mismatch (one name, everywhere) and reconcile `SPEC.md` with the code.
- 1.2 Draft `docs/thesis.md`: purpose, who it's for, claims with evidence labels (Kross 2014, Wood 2009, CBT traps, etc.), what it cannot claim.
- 1.3 Feature-to-claim table and gap list.

## B2 - honest audit

Goal: a keep / rework / cut verdict per feature against the thesis.
Done when: Sam has approved every verdict.

## B3 - rework and ship pending work

Goal: merge in-review branches that survive B2 and do the rework.
Done when: checks pass; each screen checked at 390px in light, dark and reduced motion.

## B4 - evidence of value

Goal: decide how value is shown within "no analytics, on-device" (e.g. private self-report in the book, or an opt-in study design).
Done when: Sam picks an approach.

## B5 - release

Goal: `dev` into `main`.
Done when: the live site matches the approved build and works offline.
