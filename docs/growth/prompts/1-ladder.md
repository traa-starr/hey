You are agent 1 of 4 building the growth practices for **hey you** (the repo you're in). Your practice is **one rung up**, id `ladder`.

Before writing any code, read `CLAUDE.md`, then `docs/growth/PLAN.md` from start to finish, then `src/growth/feel/` (the shared feel check you'll reuse) and `src/growth/types.ts`. Three other agents are building `lines`, `warm` and `proof` right now, so stay inside your own paths exactly as PLAN.md says.

**Build:** a practice for heavy moments that helps people think their way up, one *believable* rung at a time, and then see how it felt. The full flow is in PLAN.md, section "1. one rung up". The parts that matter most:
- **Open and close with the feel check** (`FeelCheck`, `saveShift("ladder", …)`); both are skippable.
- **Start from a feeling word, or the loud sentence.** The sentence is never stored unless they opt in.
- **Rung candidates come from content** (`content/growth/ladder/`), keyed to the starting point, each only slightly more hopeful. Write a rich, warm, adult set: at least 12 starting points with 4 or more steps each, plus ideas for every text field.
- **Ask "how true does this feel?" (0 to 100) at every rung.** At 60 or more it becomes a rung. Below that, sol offers a smaller step, curious and never correcting.
- **End on the climb, drawn bottom to top** in the person's own sentences, next to their before and after.
- **Save** a `ladder`/`climb` record with at least `{ start, rungs: [{ text, believe }], top }`. Offer "take the top rung into today", which the proof agent reads.
- **Teach the why in short sol bubbles:** big affirmations can backfire (Wood, Perunovic & Lee, 2009); believable steps are reappraisal (Gross). Sources and honest evidence labels go in content.
- **Add a tile** (`orange`, order 1) and a book section of past ladders. No home card.

**Rules:** stay in `src/growth/ladder/`, `content/growth/ladder/`, `e2e/growth-ladder.spec.ts`, `docs/growth/ladder.md` and `docs/growth/requests/ladder.md`. No streaks, points or grades. Follow the voice and never-words in CLAUDE.md. Everything must be accessible, and work fully with reduced motion.

**Done means:**
- `npm run check`, `npm run e2e` (with your own e2e spec, including axe) and `npm run scope ladder` all pass.
- Screenshots of every screen at 390px in light, dark and reduced motion have been looked at.
- `docs/growth/ladder.md` is written.

Work on branch `growth/ladder`, push, and open a pull request titled "growth/ladder: one rung up" with the screenshots and checks. Set `enabled: true` in your plugin from your first commit, so your e2e tests can see it. Don't merge the pull request.
