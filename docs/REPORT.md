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

Step / batch: B0 step 0.1
Build: 1
Commit: not yet

## Verified by running
- `npm install` (node_modules was missing; the lockfile change it made was reverted).
- `npm run lint`: passes.
- `npm run test`: 100 tests pass; 1 suite (`src/content/content.test.ts`) fails on Windows only, before this change too (see below).
- `npm run typecheck`: the only errors are in `src/growth/ladder/` on Windows, from before this change. No errors in the changed files.

## Needs the phone (exact taps)
- you → settings → scroll to the bottom → see "build 1".

## Changed files
- `src/lib/build.ts` (new), `src/screens/Settings.tsx` (shows "build N" under the data section), `README.md` ("run it locally" section).

## Differences from NEXT.md
- "build" is written in `Settings.tsx`, not in `content/copy.json`, so that only the 3 files NEXT.md named changed. It's a debug label, not copy.
- `npm run check` can't pass on Windows, for two reasons that came before this change. Both pass on Linux CI:
  1. `src/growth/ladder/` has both `Ladder.tsx` and `ladder.ts`. Windows filenames ignore case, so tsc sees them as one file (TS1149/TS2305).
  2. `content.test.ts` builds its file keys with `path.relative`, which gives backslashes on Windows (`start\welcome.json`), so the loader can't find `start/welcome.json`.

## Decisions needed (each: recommendation, default)
- Make `npm run check` pass on Windows. Recommendation: one small step that renames `ladder.ts` to `ladder-logic.ts` (or similar) and changes the test's keys to forward slashes (`.replaceAll("\\", "/")`). Default: leave as is; CI stays green.

## Map changes
- B0 0.1 marked done (waiting on the phone check). Notes added for the Windows check failures.

## Proposed next step
- B0 step 0.2 (profile CI), or the Windows check fix first if Sam wants a clean local `npm run check`.
