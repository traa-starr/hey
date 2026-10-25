# next

Fresh session. Do B1 step 1.1 only. Read `docs/map.md` section B1, `docs/STATUS.md`, `docs/decisions.md`, `CLAUDE.md`, `SPEC.md`.

## Context

The companion is "dawn" to the user (`copy.json` `companionDefault`, `{companion}`), but "Sol" in code (`src/ui/Sol`, `copy.json` key `sol`, class `welcome-sol`) and in 14 docs. `dawn` is also a time-of-day key in `copy.json`, so a plain search hits both.

## Do

1. One name everywhere: **dawn** (D15, confirmed by Sam). Rename the code side: component, file, props, CSS classes, copy keys, test names, docs. Keep the time-of-day `dawn` key working; rename it (e.g. `early`) only if it makes the code clearer, and say so.
2. No user-visible text changes, except where the screen shows "Sol". List each one.
3. Reconcile `SPEC.md` with the code: where they disagree, the code wins unless it's a bug. List each difference in REPORT.md under "SPEC changes", one line each, and flag any that look like bugs instead of fixing them.
4. Bump BUILD to 3. Run `npm run check`.

## Don't

- Don't change behaviour, layout or copy beyond the rename.
- Don't change e2e specs except selectors or names the rename breaks.
- Don't start the dev server or commit/push.

## Phone check (put in REPORT.md)

Settings shows "build 3"; the welcome chat and check-in still show the companion; nothing says "Sol".

## Then

End-of-session steps in `CLAUDE.md`: commit message and push-`dev` reminder.
