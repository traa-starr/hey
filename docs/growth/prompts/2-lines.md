You are agent 2 of 4 building the growth practices for **hey you** (the repo you're in). Your practice is **your lines**, id `lines`. It gives people a reason to open the app each day.

Before writing any code, read `CLAUDE.md`, then `docs/growth/PLAN.md` from start to finish, then `src/growth/feel/` (the shared feel check) and `src/growth/types.ts`. Three other agents are building `ladder`, `warm` and `proof` right now, so stay inside your own paths exactly as PLAN.md says.

**Build:** a workshop where people make their own affirmations from their values and real moments, in their own words, never templates handed down. The full flow is in PLAN.md, section "2. your lines". The parts that matter most:
- **Pick a value** from content (at least 16, warm and adult), or write your own.
- **Recall one small, recent moment** you lived it. Prompts stay everyday; never painful memories.
- **sol shapes it into a line that uses the person's name**, from content templates: *"sam shows up, like yesterday with mia."* With no name, use first person. No "you" self-talk here (see Voice in CLAUDE.md).
- **Tune it with a word bank** built from the person's own words (their book entries via `useData().entries`, and their past lines) plus content suggestions.
- **Try it on**, read aloud optionally. Ask "how true does this feel?" and keep it if it fits.
- **Feel check** (`FeelCheck`, `saveShift("lines", …)`) around the first session of the day; both skippable.
- **Save** `lines`/`line` records with at least `{ text, value, moment, truth }`, and use `regrow` when tuned. The warm room and proof read these.
- **Today's line on home** (`today.tsx`): one of their lines, rotating daily (`dailyIndex`), hidden until tapped like "you told yourself", with "still true?" leading to tuning. Priority 30 before noon, 10 after. With no lines yet, invite the first one gently, with no guilt.
- **Book section:** your lines as a small gallery. Tile: `plum`, order 2.
- **Teach the why** in short bubbles: values affirmation (Steele 1988; Cohen & Sherman 2014), why using your own name helps (Kross 2014), and why generic affirmations can backfire (Wood et al. 2009). Sources and evidence labels go in content.

**Rules:** stay in `src/growth/lines/`, `content/growth/lines/`, `e2e/growth-lines.spec.ts`, `docs/growth/lines.md` and `docs/growth/requests/lines.md`. No streaks or counts that pressure. Nothing revealing on home until tapped. Follow the voice and never-words in CLAUDE.md. Everything must be accessible, and work fully with reduced motion.

**Done means:**
- `npm run check`, `npm run e2e` (with your own e2e spec, including axe) and `npm run scope lines` all pass.
- Screenshots of every screen, and of home with today's line, at 390px in light, dark and reduced motion have been looked at.
- `docs/growth/lines.md` is written.

Work on branch `growth/lines`, push, and open a pull request titled "growth/lines: your lines" with the screenshots and checks. Set `enabled: true` in your plugin from your first commit, so your e2e tests can see it. Don't merge the pull request.
