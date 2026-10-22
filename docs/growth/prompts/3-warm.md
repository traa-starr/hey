You are agent 3 of 4 building the growth practices for **hey you** (the repo you're in). Your practice is **the warm room**, id `warm`.

Before writing any code, read `CLAUDE.md`, then `docs/growth/PLAN.md` from start to finish, then `src/growth/feel/` (the shared feel check), `src/growth/types.ts` and `src/ui/Breath.tsx`. Three other agents are building `ladder`, `lines` and `proof` right now, so stay inside your own paths exactly as PLAN.md says.

**Build:** self-compassion as a practice people do, not a definition they read. The full flow is in PLAN.md, section "3. the warm room". The parts that matter most:
- **Feel check first and last** (`FeelCheck`, `saveShift("warm", …)`); both skippable.
- **A short settling:** reuse the breath (`src/ui/Breath.tsx`, import it, don't change it) and an optional hand on your chest. Label the soothing-touch evidence honestly (Dreisoerner et al., 2021, one study).
- **First visit: build a compassionate voice.** Pick 2 to 3 qualities from content (steady, warm, funny, fierce, gentle, wise…) and an optional name. Save a `warm`/`voice` record with at least `{ name, qualities }`. It can be changed later.
- **Bring today's small hard thing** in a few words, or by tapping an idea. Never ask for painful memories, and always offer skip. The thing itself is stored only if they choose to keep the visit.
- **The voice answers** in the chosen qualities' tone, from rich content templates: at least 3 responses per quality, across kindness, common humanity and mindfulness. When the person has `lines` records (read `useData().grown` defensively), weave one of their own lines in.
- **End on the before and after** (`Shift`), and offer to keep what the voice said.
- **Teach the why** in short bubbles: the three parts of self-compassion (Neff), why it isn't self-indulgence, and what the research shows (Neff & Germer 2013; Gilbert's compassion-focused therapy). Sources and evidence labels go in content.
- **Tile:** `mint`, order 3. Book section: your voice and kept visits. No home card.

**Rules:** stay in `src/growth/warm/`, `content/growth/warm/`, `e2e/growth-warm.spec.ts`, `docs/growth/warm.md` and `docs/growth/requests/warm.md`. Not therapy: never diagnose, never revisit painful memories. Follow the voice and never-words in CLAUDE.md; warm but adult, never cute. Everything must be accessible, and work fully with reduced motion (the breath has a text version).

**Done means:**
- `npm run check`, `npm run e2e` (with your own e2e spec, including axe) and `npm run scope warm` all pass.
- Screenshots of every screen at 390px in light, dark and reduced motion have been looked at.
- `docs/growth/warm.md` is written.

Work on branch `growth/warm`, push, and open a pull request titled "growth/warm: the warm room" with the screenshots and checks. Set `enabled: true` in your plugin from your first commit, so your e2e tests can see it. Don't merge the pull request.
