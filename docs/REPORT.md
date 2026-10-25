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

Step / batch: B1 step 1.1 (one companion name, SPEC.md matches code; D15)
Build: 3
Commit: not yet

## Verified by running
- `npm run check`: typecheck, lint, unit tests pass (13 files, 115 tests).
- `git grep` for `sol` / `Sol` in `src`, `content`, `scripts`, `e2e`: nothing left (only words like "resolve", "console", "cortisol").
- e2e not run (NEXT.md didn't ask). No e2e spec used the old names, so none changed.

## Needs the phone (exact taps)
- you → settings → bottom: "build 3".
- you → settings → replay the welcome: dawn shows in the sky and beside each bubble; nothing says "Sol". Close it.
- home → "check in" chip: dawn shows above the question; set it, tap "that's it", dawn shows again with the thanks.
- home and practice: dawn's line and the "what would help right now?" bubble still show.

## User-visible text changes
- None. No screen ever showed "Sol": the name on screen was always `companionDefault` ("dawn"). Only code, copy keys and docs said sol.

## Changed files
- `src/ui/Sol.tsx` → `src/ui/Dawn.tsx` (git mv); component `Sol` → `Dawn`, `SolSays` → `DawnSays` (kit.tsx and every screen and growth screen that uses it).
- CSS (`src/styles/app.css`): `.sol` → `.dawn-face`, `.solbox` → `.dawn-box`, `.welcome-sol` → `.welcome-dawn`, comments. Not `.dawn`: the sky already gets the class `dawn` at dawn hour (`sky ${tod}`), so `.dawn` would have styled the sky too.
- Copy keys: `copy.json` `sol` → `dawnSays` (the home line per time of day), `practice.sol` → `practice.dawn`; growth keys `*Sol*` → `*Dawn*` (e.g. `nearSol` → `nearDawn`, `hubSolReturn` → `hubDawnReturn`, `solHome` → `dawnHome`) in `content/growth/{ladder,lines,proof,warm}` with their Zod schemas, screens and `lines.test.ts`.
- `src/lib/build.ts`: BUILD 3. `scripts/shots.mjs`: a comment.
- Docs: sol → dawn in `docs/DESIGN.md` (heading now "dawn, the companion"), `docs/SPEC.md`, `SPEC.md` (the "loud right now" draft), `docs/growth/*` (incl. `SolSays` in PLAN.md), `docs/art`, `docs/research`, `docs/review`, `docs/ux-discovery`. Left as history: `decisions.md`, `NEXT.md`, the B0 inventory line in `map.md`.
- Time of day `dawn` (`TimeOfDay`, `greeting.dawn`, `dawnSays.dawn`, `--sky-dawn`) kept. Renaming it to `early` would touch the type, CSS variables, copy and tests for no gain; the class names above already keep the two apart.

## SPEC changes (docs/SPEC.md, code wins)
- Paths: names and order now match `index.json` (a kind start, talk to you, meet the inner voice, voice habits, what i like, what i think); lesson titles updated ("the good stuff", "small thanks", "what matters most", "changing my mind").
- Added the 7th path, "how the mind works" (6 lessons).
- Welcome step 3: the real line ("here, we practice kindness pointed inward…"); the tour starts after it.
- Home: a growth card (look back, today's line, proof) sits above "next up"; "your next step" → "next up"; "you told yourself" → "from the book".
- Lesson step types: added `know` and `recall`.
- Practice: dawn's bubble, growth tiles, way pages.
- Catch it: opened from a habit, the habit is preselected. Answer it: started from a way, the way step is skipped.
- Book: "about you" → "about me", "after you answered" → "after answering", growth sections, cover title.
- New sections: quick look around (tour), growth practices.
- Settings: real labels and order; added "replay the quick look around" and the build label.
- Data: `grown` table (Dexie v3) and `kv.tour`.
- Verified-by table: tour and growth e2e specs.
- Looks like a bug: none found. One leftover: `copy.habit.answer` ("answer it now") isn't used by any screen. Left alone.

## Differences from NEXT.md
- Also renamed sol in the root `SPEC.md` (a separate draft spec), since NEXT says "docs" and it named the companion.

## Decisions needed (each: recommendation, default)
- Remove the unused `copy.habit.answer`, or show it on the habit page? Recommendation: remove it in B2. Default: leave it.

## Map changes
- B1 1.1 marked done (build 3), with the class-name note.

## Proposed next step
- B1 step 1.2: draft `docs/thesis.md`.
