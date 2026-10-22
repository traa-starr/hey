# hey you

A relationship-with-yourself app. People rebuild who they are by learning how their words shape their mind (language), what they actually want (desires), and what they actually think (opinions). Everything they discover is kept privately in "me, collected."

The name is always lowercase: **hey you**.

## v1 scope (build only this)

- **Core practice: weigh it.** Catch a sentence your inner voice said → feel its weight (feather to boulder, optional body location) → optional curiosity (what is the voice doing, does it sound like anyone) → pick a formula → write your own version → feel the new weight → keep it in my words. The original sentence is never saved unless the person opts in. Research basis: the Self-Talk Toolkit doc and `content/formulas.json` sources.
- **Formulas** (`content/formulas.json`): frames from published research or recognized therapy approaches that people fill with their own words. Never auto-rewrite someone's sentence. Each formula shows its source and an honest evidence label. Talking to yourself as "you" (Kross et al., 2014) is the namesake technique.
- **start:** `content/start/welcome.json` shows what hey you is before anything else, and asks (optionally) what to call the person.
- **wants and thoughts:** short tool lessons (`content/desires/`, `content/opinions/`) for discovering what you like and think. Lessons are tools, not corrections.
- **me, collected:** my words (with before → after weights), what I like, what I think. Editable and deletable.
- **resource shelf:** small, curated, every item tagged with its license and how we may use it (not built yet).

Out of scope for v1 (do not build unless asked): rooms hub, customizable space, rehearsal room, garden, out-there steps, library, AI companion, accounts, notifications, streaks.

## Tech decisions

- Static home-screen web app (PWA), hosted on GitHub Pages. No server, no accounts, no AI.
- Content lives in `content/` as data files, separate from code. Adding a lesson must never require code changes.
- User data stays on the device (localStorage). Wrap every storage read/write in try/catch; the app must still work if storage fails.
- Mobile first. Check every screen at phone width in light and dark mode before calling it done.

## Core stance: exploring, not correcting

IMPORTANT: hey you never treats people as doing something wrong. Nothing a person says or does is a "pattern to fix." The app shows how their words, wants, and thoughts already work, with curiosity and appreciation, then offers more range: more words, more ways to say what's true, more room to be themselves. Like learning more of a language, nothing already known is wrong.

- Explore what a word or habit means for this person; appreciate the work it has done for them.
- Let people try things on and notice how each lands. Never grade options or attach a "cost" to the way they already speak.
- Collect, don't replace. The goal is range, not better sentences.

## Voice

- In the app, the three practices are called **words** (language), **wants** (desires), and **thoughts** (opinions).
- Lowercase, warm, short sentences. Show, don't tell: scenes and examples, never definitions or lectures.
- Never: toxic, broken, fix, should (as an instruction), wrong, disorder, healing journey.
- Lean on: makes sense, of course, want to try, no pressure.
- Never ask "how do you feel?" on arrival. Welcome first, ask later, and always offer skip.
- Not therapy. Never diagnose, never ask people to revisit painful memories, never tell anyone to leave a relationship.

## Every feature must pass

1. Does it show rather than tell?
2. Would someone used to being blamed feel judged by it?
3. Does it move toward real life?
4. Is it safe on a phone someone else might see? (neutral look, nothing revealing on screen by default)
5. Can we stand behind every claim it makes?
6. Would people come back because they want to, not because they were nudged? (no streaks, no guilt)

## Workflow

- One piece per session. Plan, build, check at phone size, then commit.
- Real help (crisis lines) is always reachable from settings, quietly, never stamped on every screen.
- Full plan: `docs/v1-plan.md`.
