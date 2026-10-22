You are agent 4 of 4 building the growth practices for **hey you** (the repo you're in). You own **proof**, id `proof`, and the science path **how your mind works**.

Before writing any code, read `CLAUDE.md`, then `docs/growth/PLAN.md` from start to finish, then `src/growth/feel/`, `src/growth/types.ts`, `content/README.md` and one existing lesson (`content/talk-to-you/the-you-trick.json`). Three other agents are building `ladder`, `lines` and `warm` right now, so stay inside your own paths exactly as PLAN.md says.

**Build proof:** taking a kinder voice into real life, and collecting evidence. The full flow is in PLAN.md, section "4. proof". The parts that matter most:
- **Morning:** choose today's experiment. Offer sources: a ladder `top`, a `line` (read `useData().grown` defensively, since they may not exist yet), or "something your inner voice predicts" with ideas. Capture the claim and a prediction.
- **Evening:** a home card (`today.tsx`, priority 40, after 17:00, only with an open experiment) asks what actually happened. Keep any evidence as proof. Experiments can stay open or be let go, never "failed".
- **Save** `proof`/`experiment` records with at least `{ claim, prediction, result, closedAt }`, and `proof`/`proof` records with at least `{ text, from }`.
- **When the same claim comes back**, show the proof already gathered against it.
- **Feel check** (`FeelCheck`, `saveShift("proof", …)`) around the evening reflection; skippable.
- **Teach the why** in short bubbles: behavioural experiments (Bennett-Levy et al., 2004) and the negativity bias.
- **Tile:** `blue`, order 4. Book section: the proof collection.

**Build the science path:** 5 or 6 lessons in `content/how-your-mind-works/`, added as one path appended to the end of `paths` in `content/index.json` (id `how-your-mind-works`, color `blue`). Use only the existing step types. Every lesson needs:
- at least three interactive steps
- a takeaway with real sources and an honest evidence label
- an experiment

Topics are listed in PLAN.md. No overclaiming: careful with "neuroplasticity", and never promise fast change. The existing content tests must pass with your lessons.

**Rules:** stay in `src/growth/proof/`, `content/growth/proof/`, `content/how-your-mind-works/`, your single `index.json` path entry, `e2e/growth-proof.spec.ts`, `docs/growth/proof.md` and `docs/growth/requests/proof.md`. No streaks or guilt; open experiments never nag. Follow the voice and never-words in CLAUDE.md. Everything must be accessible, and work fully with reduced motion.

**Done means:**
- `npm run check`, `npm run e2e` (with your own e2e spec covering proof and one science lesson, including axe) and `npm run scope proof` all pass.
- Screenshots of every screen, the evening home card and a science lesson, at 390px in light, dark and reduced motion, have been looked at.
- `docs/growth/proof.md` is written.

Work on branch `growth/proof`, push, and open a pull request titled "growth/proof: proof and how your mind works" with the screenshots and checks. Set `enabled: true` in your plugin from your first commit, so your e2e tests can see it. Don't merge the pull request.
