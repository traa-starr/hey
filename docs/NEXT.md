# next

Fresh session. Do B0 step 0.1 only. Read `docs/map.md` section B0, `docs/STATUS.md`, and `CLAUDE.md`.

## Do

1. Add `src/lib/build.ts` exporting `BUILD` (a number, start at 1).
2. Show it quietly at the bottom of you → settings, in the neutral style already used there (e.g. "build 1"). Look at `src/screens/Settings.tsx` and match its idiom. Don't touch copy rules: lowercase, no "you".
3. Add a "run it locally" section to `README.md`: `npm install`, `npm run dev -- --host`, finding the phone URL (the Network address Vite prints; same Wi-Fi), and the Windows firewall prompt to allow private networks. Keep it short.
4. Run `npm run check`. Fix only what you broke.

## Don't

- Don't start the dev server, run e2e, or commit/push.
- Don't change anything else (CI is step 0.2).
- This touches 3 small files; no plan needed (Sam waived it for this step).

## Then

Do the end-of-session steps in `CLAUDE.md`. In your last message, give Sam: the build number, the local-run commands, the phone tap (you → settings, scroll to bottom, see "build 1"), the suggested commit message, and the push-`dev` reminder.
