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
