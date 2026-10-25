# report

Code overwrites this each session, ~30 lines, using the template below.

## Template

```
# report
Step / batch:
Build:
Commit: (Sam commits; leave blank or "not yet")

## Verified by running
-
## Needs the phone (exact taps)
-
## Changed files
-
## Differences from NEXT.md
-
## Decisions needed (each: recommendation, default)
-
## Map changes
-
## Proposed next step
-
```

## This session

Step / batch: B0 step 0.2 (CI speed, D12)
Build: 2 (not bumped; no app change)
Commit: not yet

## Verified by running
- `npm run check`: typecheck, lint, unit tests pass (13 files, 115 tests).
- The workflow change is not run yet. It is proven only when the next PR from `dev` runs (and again on the merge push to `main`).

## Needs the phone (exact taps)
- None.

## Changed files
- `.github/workflows/deploy.yml`: new `scope` step decides `e2e=true|false`. Push to `main` → false (runs `npm run build`, then deploy). PR → false when every changed file is under `docs/` or ends in `.md`. `workflow_dispatch` → true. All Playwright steps are gated on it. Checkout now uses `fetch-depth: 0` so the diff against the PR base works.
- `README.md`: one line, open the URL in the phone's browser, not the home-screen icon.
- `docs/map.md`, `docs/STATUS.md`, `docs/decisions.md` (D13), `docs/REPORT.md`.

## Docs-only skip: how
- Simplest option: a shell `git diff --name-only origin/$BASE...HEAD | grep -qvE '^docs/|\.md$'` in the same job. No third-party action, no `paths-ignore` (that would skip the whole workflow and leave a required check hanging). The job always runs, so `check` always reports green.

## Why e2e went from ~200s to ~370s (report only)
- Code-side growth since 2026-10-23 is small: the tour (2 tests, ~15 taps) and one catch-step test. That explains maybe 10–20s, not ~170s. The 8 `waitForTimeout` calls add ~10s total and are fixed, so they can't double the time.
- Cause 1 (most likely): `retries: 1` hiding a flaky test. A test that hits the 60s timeout and then passes on retry costs ~60–120s of wall time with 2 workers, and the run still shows green. To confirm: open a slow run's e2e step and look for "flaky" in the `github` reporter annotations. Fix: make that test wait on state (e.g. replace `waitForTimeout` with `expect(...)` waits; pin the clock in tests that touch home, since the sky and returning ideas follow the hour and date).
- Cause 2: workers. Playwright's default on CI is half the cores, so 2 workers on the 4-vCPU `ubuntu-latest`. The long walk-through tests (growth-proof lesson loop, ladder, 20-card voice check) run back to back on those 2. Fix: try `workers: 4` on CI in `playwright.config.ts` and compare one run.
- The app build (`tsc -b && vite build`) also runs inside the e2e step via `webServer`, so a slower build shows up as slower e2e.

## Differences from NEXT.md
- None.

## Decisions needed (each: recommendation, default)
- Fix the e2e slowdown? Recommendation: first read the flaky annotations on one slow run, then a small step for the flaky test plus `workers: 4`. Default: leave as is until B3.

## Map changes
- B0 0.2 marked done (no BUILD bump), with a note on the unfixed slowdown. Inventory CI line updated.

## Proposed next step
- B0 step 0.3 (Project instructions), after the next `dev` PR shows the new workflow working.
