# next

Fresh session. Do B0 step 0.1b only (Windows check fix, decision D10). Read `docs/map.md` section B0, `docs/STATUS.md`, `docs/decisions.md` and `CLAUDE.md`.

## Do

1. Rename `src/growth/ladder/ladder.ts` to `src/growth/ladder/ladder-logic.ts` with `git mv`. Update the 4 imports of `"./ladder"` (`book.tsx`, `ladder.test.ts`, `Ladder.tsx`, `Screen.tsx`). Grep for any other importer before you finish.
2. In `src/content/content.test.ts`, make the file keys use forward slashes (e.g. `.split(path.sep).join("/")` or `.replaceAll("\\", "/")`) so `start/welcome.json` is found on Windows.
3. Bump `BUILD` to 2 in `src/lib/build.ts`.
4. Run `npm run check`. It must pass fully on Windows now. Fix only what this step touches.
5. In `docs/map.md`, add 0.1b under B0 (done, waiting on phone check) and remove the "fails on Windows" note from 0.1.

## Don't

- Don't change ladder behaviour, exports or names inside the file. Rename only.
- Don't start the dev server, run e2e, or commit/push.
- Don't start 0.2 (CI profiling).

## Then

Do the end-of-session steps in `CLAUDE.md`. In your last message, give Sam: the build number, the phone tap (you → settings, scroll to bottom, see "build 2"; also open the growth ladder once to confirm it still loads), the suggested commit message, and the push-`dev` reminder.
