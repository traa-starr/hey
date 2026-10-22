# hey you

A relationship-with-yourself app for adults. Most people have one loud inner voice. hey you helps them grow a second one: their own, in their own words. People answer what their inner voice says, find out what they actually like and think, and keep it all in **your book**, a private, growing book about them, written by them.

The name is always lowercase: **hey you**. It is the idea itself: talking to yourself as "you", the way you'd talk to a friend, makes hard moments lighter (Kross et al., 2014).

## v1 scope (build only this)

- **Core practice: answer it.** Catch a sentence your inner voice said → set how loud it is (a whisper to all i can hear; the sentence itself grows) → optional calm moment when it's loud → pick a way to answer → write your answer → set how loud the original is now → keep it in your book, try another way, or let it go. The inner voice's sentence is never stored unless the person opts in.
- **Ways to answer** (`content/formulas.json`): frames from published research or recognized therapy approaches that people fill with their own words. Never auto-rewrite someone's sentence. Each shows its source and an honest evidence label.
- **Welcome** (`content/start/welcome.json`): a short story (8 screens or fewer) about the two voices that ends with answering a first one. Asks (optionally) what to call the person.
- **Getting to know you:** a daily question on today (`content/questions.json`) plus short sets (`content/desires/`, `content/opinions/`) for discovering what you like and think. Tools, never corrections.
- **Your book:** two parts. *things you've told yourself* (answers, with loudness before → after) and *about you* (likes and thoughts, read back in second person: "you'd pick rain"). Editable and deletable. No counts, milestones, or streaks. Settings, real help, and data controls live at the bottom of the book.
- **Today is simple:** greeting, one line you once told yourself, one main action (answer it), one small question about you. Tabs: today, explore, your book.
- **Never leave an empty box alone.** Every text field offers tappable ideas.
- **Read aloud** (on-device Web Speech) and **soft sounds**, both off by default. Haptics where the platform allows.
- **Pick up where you left off:** an unfinished set resumes. An unfinished answer resumes only within the same session (the inner voice's words are never written to lasting storage).

Out of scope for v1 (do not build unless asked): rooms hub, customizable space, rehearsal room, garden, out-there steps, library, AI companion, accounts, notifications, streaks, milestones, resource shelf.

## Tech decisions

- React + TypeScript, built with Vite, as an installable PWA (vite-plugin-pwa) on GitHub Pages under `/hey/`. No server, no accounts, no analytics, no AI. Works offline after the first load; fonts are self-hosted.
- Content lives in `content/` as JSON (lessons, ways to answer, questions, UI copy, help lines, credits), validated at load with Zod schemas in `src/content/`. Adding a lesson, way, or question must never require code changes.
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

- In the app: **answer it** (language), **about you** (desires and opinions), **your book** (what's kept), **ways to answer** (formulas).
- Lowercase, warm, plain, adult. Short sentences. Show, don't tell: scenes and examples, never definitions or lectures. Never cute.
- Never: toxic, broken, fix, should (as an instruction), wrong, disorder, healing journey.
- Lean on: makes sense, of course, want to try, no pressure.
- Never ask "how do you feel?" on arrival. Welcome first, ask later, and always offer skip.
- Not therapy. Never diagnose, never ask people to revisit painful memories, never tell anyone to leave a relationship.

## Look

Typography is the illustration. The inner voice is set in a plain grey sans that fades; the person's own voice is set in a warm serif that stays. The page color follows the time of day (dawn, day, dusk, night). Calm, precise motion. See `docs/DESIGN.md`.

## Every feature must pass

1. Does it show rather than tell?
2. Would someone used to being blamed feel judged by it?
3. Does it move toward real life?
4. Is it safe on a phone someone else might see? (neutral look, nothing revealing on screen by default)
5. Can we stand behind every claim it makes?
6. Would people come back because they want to, not because they were nudged? (no streaks, no counts, no guilt)

## Workflow

- One piece at a time. Plan, build, check at phone size, then commit.
- Real help (crisis lines) is always reachable from the bottom of your book, quietly, never stamped on every screen.
- Spec: `docs/SPEC.md`. Design: `docs/DESIGN.md`. Content format: `content/README.md`.
