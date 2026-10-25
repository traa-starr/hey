# next

Fresh session. Do B0 step 0.2 only (CI speed, decision D12). Read `docs/map.md` section B0, `docs/STATUS.md`, `docs/decisions.md`, `CLAUDE.md` and `.github/workflows/deploy.yml`.

## What chat measured (last 6 runs)

- `check` job: ~430s. `npm run e2e` is ~370s of that (85%). It was ~200s on 2026-10-23, so it nearly doubled in a day.
- Everything else is small: npm ci ~5s, `npm run check` ~20s, playwright deps ~20s, deploy ~10s.
- A merge runs the full job twice back to back: once on the PR, again on the push to `main`.

## Do

1. In `deploy.yml`, on push to `main`: run `npm ci`, `npm run check` and the build, then deploy. Skip e2e there; the PR already ran it. Keep e2e on `pull_request` and `workflow_dispatch`.
2. Skip e2e when a PR only changes `docs/**` or `*.md`. The `check` job must still finish green, so a required check never hangs. Pick the simplest way to do that and say which in REPORT.md.
3. Find out why e2e went from ~200s to ~370s. Look at the e2e specs (8 `waitForTimeout` calls), retries (`retries: 1` on CI), and the worker count. **Report only, don't fix.** Give the top 1–2 causes and the fix you'd propose.
4. README "run it locally": add one line saying to open the URL in the phone's browser, not the home-screen icon, because the icon opens the live app (`main`).
5. Run `npm run check`.

## Don't

- Don't bump BUILD (no app change, no phone check).
- Don't change e2e specs or `playwright.config.ts`.
- Don't start the dev server, run e2e, or commit/push.

## Then

Do the end-of-session steps in `CLAUDE.md`. In your last message, give Sam the suggested commit message and the push-`dev` reminder. Say that the workflow change is only proven when the next PR from `dev` runs.
