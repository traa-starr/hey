# hey you

A relationship-with-yourself app for adults. Most people have one loud inner voice. hey you helps them grow a second one: their own, in their own words. People answer what their inner voice says, find out what they actually like and think, and keep it all in **your book**, a private, growing book about them, written by them.

The name is always lowercase: **hey you**. It is the idea itself: talking to yourself as "you", the way you'd talk to a friend, makes hard moments lighter (Kross et al., 2014).

## v1 scope (build only this)

- **Home is just home:** a sky that follows the hour, sol, a greeting, one next step, two shortcuts. Tabs: home, learn, practice, you.
- **sol, the companion:** a small dawn-light character who teaches lessons as short chat bubbles and reacts with simple moods. Scripted, never AI. It can be renamed or turned off.
- **Voice habits** (`content/habits.json`): ten common ways inner voices talk, from CBT thinking traps, each named warmly and described by what it's trying to do. The **voice check** (swipe or tap, no typing) maps them; **catch it** (three taps) logs when and where one shows up. A voice check is for noticing, never a diagnosis.
- **Learn** (`content/index.json` paths): real lessons as chats with sol, built from interactive steps (spot it, try it on, pick, write with ideas, takeaways, experiments). Every voice habit gets a lesson generated from its data.
- **Practice:** catch it, answer it, breathe, voice check, this or that, ways to answer.
- **Answer it:** catch a sentence (or start from a caught habit and pick one of its lines) → set how loud it is → optional breath when it's loud → pick a way to answer (`content/formulas.json`, each with source and honest evidence label) → write your answer → set the loudness again → keep it, try another way, or let it go. The inner voice's sentence is never stored unless the person opts in.
- **You:** your voice map, where habits show up, how loud it's been, your book (words, about you, keepers), settings with real help at the bottom.
- **Never leave an empty box alone.** Every text field offers tappable ideas.
- **Read aloud** (on-device Web Speech) and **soft sounds**, both off by default. Haptics where the platform allows.
- **Pick up where you left off:** every unfinished lesson resumes. An unfinished answer resumes only within the same session, for 30 minutes.

Out of scope for v1 (do not build unless asked): rooms hub, customizable space, rehearsal room, garden, out-there steps, library, AI companion (sol is scripted), accounts, notifications, streaks, points, resource shelf.

## Tech decisions

- React + TypeScript, built with Vite, as an installable PWA (vite-plugin-pwa) on GitHub Pages under `/hey/`. No server, no accounts, no analytics, no AI. Works offline after the first load; fonts are self-hosted.
- Content lives in `content/` as JSON (paths and lessons, voice habits, ways to answer, questions, UI copy, help lines, credits), validated at load with Zod schemas in `src/content/`. Adding a lesson, habit, way, or question must never require code changes.
- User data stays on the device in IndexedDB (Dexie). Everything from the old `heyyou.v1` localStorage key migrates on first open. If storage fails, the app keeps working in memory.
- Motion (`motion/react`) for transitions, always honoring reduced motion.
- Mobile first. Check every screen at 390px wide in light and dark, and with reduced motion, before calling it done.
- `npm run check` runs typecheck, lint, and unit tests. `npm run e2e` runs Playwright.

## Core stance: exploring, not correcting

IMPORTANT: hey you never treats people as doing something wrong. Nothing a person says or does is a "pattern to fix." The inner voice isn't an enemy to defeat; it has usually been trying to help. The app shows how a person's words, wants, and thoughts already work, with curiosity and appreciation, then offers more range: more words, more ways to answer, more room to be themselves.

- Explore what a word or habit means for this person; appreciate the work it has done for them.
- Let people try things on and notice how each lands. Never grade answers or attach a "cost" to how they already speak.
- Collect, don't replace. The goal is range, not better sentences.

## Voice

- In the app: **voice habits**, **catch it**, **answer it**, **ways to answer** (formulas), **about you** (desires and opinions), **your book** (what's kept), **sol** (the companion).
- One idea per screen. sol's bubbles stay short (about 30 words at most); longer ideas become more bubbles.
- Lowercase, warm, plain, adult. Short sentences. Show, don't tell: scenes and examples, never definitions or lectures. Never cute.
- Never: toxic, broken, fix, should (as an instruction), wrong, disorder, healing journey.
- Lean on: makes sense, of course, want to try, no pressure.
- Never ask "how do you feel?" on arrival. Welcome first, ask later, and always offer skip.
- Not therapy. Never diagnose, never ask people to revisit painful memories, never tell anyone to leave a relationship.

## Look

Confident dusk violet with sunrise coral, gold and teal; every voice habit has its own color and glyph. Bricolage Grotesque for headings, Instrument Sans for text, Newsreader italic for quotes and the person's own words. sol and a sky that follows the hour carry warmth. Calm motion with small springs at key moments. Adult, never childish. See `docs/DESIGN.md`.

## Every feature must pass

1. Does it show rather than tell?
2. Would someone used to being blamed feel judged by it?
3. Does it move toward real life?
4. Is it safe on a phone someone else might see? (neutral look, nothing revealing on screen by default)
5. Can we stand behind every claim it makes?
6. Would people come back because they want to, not because they were nudged? (no streaks, points, or guilt; counts only where they help someone see their own patterns)

## Workflow

- One piece at a time. Plan, build, check at phone size, then commit.
- Real help (crisis lines) is always reachable in settings (you → settings), quietly, never stamped on every screen.
- Spec: `docs/SPEC.md`. Design: `docs/DESIGN.md`. Content format: `content/README.md`.
