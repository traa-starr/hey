# decisions

Append-only. One line each: date, id, answer. Settled means never re-ask.

- 2026-10-24 D1: Existing `CLAUDE.md` stance, voice and scope rules stay; workflow added on top.
- 2026-10-24 D2: Testing is local-first. Sam launches the app (`npm run dev -- --host`) and tests on the phone before committing; Code doesn't start servers, it gives instructions. Code runs `npm run check` itself; e2e only when NEXT.md says so.
- 2026-10-24 D3: Git is Sam's, in VS Code. Code ends each session with the commit message and push / merge reminders.
- 2026-10-24 D4: Working branch is `dev`. `main` is live and gets a merge only after phone approval.
- 2026-10-24 D5: Roadmap centres on defining "the mark" (B1 thesis, B2 audit) before more features. No new out-of-scope features.
- 2026-10-24 D6: CI speed is worth investigating (B0 step 0.2), propose before changing.
- 2026-10-24 D7: Chat is a claude.ai Project linked to the local folder; it reads the repo files directly.
- 2026-10-24 D8: BUILD lives in `src/lib/build.ts`, shown in you → settings.
- 2026-10-24 D9: The "build N" label is written in `Settings.tsx`, not in `content/copy.json`. It's a debug label, not copy.
- 2026-10-24 D10: Fix `npm run check` on Windows now, as B0 step 0.1b, before 0.2: rename `ladder.ts` to `ladder-logic.ts`, forward-slash keys in `content.test.ts`. Reason: D2 has Code run the check locally on Windows, so it must pass there. Decided (veto window).
- 2026-10-24 D11: 0.1b done as D10 said. `npm run check` now passes on Windows (115 tests). The stale path in `docs/growth/ladder.md` was updated to `ladder-logic.ts` too.
- 2026-10-24 D12: B0 0.2 goes beyond proposing. Chat profiled CI (e2e ~370s of ~430s; it runs twice per merge). Code applies two changes: no e2e on push to `main`, and no e2e for docs-only PRs. The e2e slowdown is reported, not fixed. Decided (veto window).
- 2026-10-24 D13: 0.2 done. Docs-only PRs are found by a plain `git diff --name-only origin/<base>...HEAD` step in the `check` job (no third-party action, no second workflow); e2e steps are skipped by `if:`, so the required `check` job still finishes green. Push to `main` runs `npm run build` in place of e2e.
