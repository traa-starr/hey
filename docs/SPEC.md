# hey you — spec (v3)

hey you helps adults grow a second inner voice: their own, in their own words. This spec covers v1 as rebuilt in v3. Scope, stance, and voice rules live in `CLAUDE.md` and win over anything here.

## Screens

Four tabs in a floating bar: **home**, **learn**, **practice**, **you**. Full-screen flows (welcome, lessons, voice check, catch it, check-in, answer it, breathe, habit, book, settings) hide the tabs and show a close button, a progress bar where there are steps, and read aloud when it's on.

### Welcome (first open)

A chat with sol (`content/start/welcome.json`): hey you → meet sol → the two voices → why "you" (Kross et al., 2014) → promises → what to call you (optional) → "want to find out how your inner voice tends to talk?" → voice check, or look around first. Closing it at any point skips it; it can be replayed from settings.

### Home

A sky (dawn, day, dusk, night, following the clock) with sol, a greeting with the person's name, and one line from sol for that time of day. Below: **your next step** (the first unfinished lesson, path by path, with a progress ring), two shortcuts (voice check until one is done, then catch it; and "it's loud right now" → answer it), and "you told yourself", which stays hidden until tapped (shared-phone safe; never shows what the inner voice said; can be turned off). A "check in" chip in the sky opens the check-in. Nothing else.

### Learn

Paths (`index.json` → `paths`), each with a color, an icon, and a progress row of its lessons:

| path | lessons |
| --- | --- |
| meet your inner voice | everyone has one · where it comes from · a thought is not a fact · turn down the volume |
| your voice habits | one lesson per habit (generated from `habits.json`) |
| talk to you | the "you" trick · the friend test · three kind lines · why to what |
| what you like | small wants count · this or that · what matters to you · asking for it |
| what you think | i think… because… · for now · disagreeing kindly · changing your mind |

A path shows its lessons with done, pick up again, or minutes.

### A lesson

A conversation with sol: one step at a time, a continue button for sol's lines, replies as tappable chips. Step types: `say`, `scene` (an inner-voice line), `mine` (a line in your voice), `ask` (chips, sol replies), `tryon` (try lines on), `pick` (multi-select, optionally kept), `write` (template plus ideas, optionally kept), `spot` (which habit is talking; sol offers one reading and never grades the pick), `tot` (this or that), `takeaway` (keep this, with source and evidence, optionally saved as a keeper), `experiment` (try it today), `breathe` (asks first, skippable), `list`, `name`, `end`. Every lesson has a takeaway and an experiment. Progress is saved per lesson after every step; finishing marks it done.

### Voice check

Twenty cards, two per habit, interleaved: "does your inner voice ever say…" → that's me / sometimes / not really (or swipe right or left). Back undoes the last card; a quick double tap never answers two. Scores each habit 0–1 and saves the check. Ends on the voice map, or a kind note when nothing matched; when habits score about evenly, the map says so instead of naming a "loudest".

### Practice

Tiles: catch it, answer it, breathe, voice check, this or that. Below: every way to answer.

### Catch it

Three taps: which habit (the person's loudest first, or "not sure which") → where (work, home, people, my body, money, the future, the past, online, something else, or skip) → how loud. Saved as a moment. Then: answer it now (the habit's own lines become the ideas), or done.

### Check-in

Opened only by the person (never on arrival): how loud is your inner voice today, plus optional habits. Feeds "how loud it's been".

### Answer it

As before (v2): catch → how loud → optional breath at loud or all i can hear → way → write → and now → kept. Started from a habit, its lines are the ideas. The inner sentence is never stored unless opted in; when the answer contains it, the kept screen says so and offers to change it. The draft lives in `sessionStorage` and expires after 30 minutes.

### You

- **your voice map**: up to six habits as bubbles sized by the latest voice check (75%) and what's been caught (25%), then the top three with what each is trying to do. Tap a habit for its page.
- **when it shows up**: where caught habits happen, as bars.
- **how loud it's been**: one point per day from check-ins and caught moments, last 14 days.
- **your book** (words, about you, keepers; edit and remove) and **settings**.

### Habit page

Its glyph and color, what it says, what it's trying to do, what it can leave out, ways to answer it (each opens the way), learn about it, I caught it just now.

### Settings

What to call you · your companion (name, show sol) · read aloud (on, auto, voice, speed, test) · soft sounds · show a line from your book on home · appearance (match my phone, always light, always dark) · real help · about and sources · replay the welcome · add to home screen · your data (save a copy, clear everything).

## Data model

IndexedDB `heyyou` (Dexie). Version 1 tables carry over unchanged; version 2 adds `logs`.

| table | key | fields |
| --- | --- | --- |
| `entries` | `id` | `kind` (`voice` \| `about` \| `keeper`), `sub` (`like` \| `think`), `text`, `from`, `at`, `before?`, `after?`, `said?` |
| `logs` | `id` | `type` `moment` (`habit`, `where`, `loud`) \| `checkin` (`loud`, `habits`) \| `check` (`scores`), `at` |
| `kv` | `key` | `name`, `welcomed`, `tried`, `answered`, `settings`, `progress` (`{[lessonKey]: {i, locals}}`), `done` (`{[lessonKey]: iso}`), `companion` (`{name, on}`), `migratedV1` |

A lesson key is its file path without `.json`, or `habit:<id>`. About-you text is stored in first person and shown in second person. Entries that hold the inner voice's words (`said`, or `holdsSaid` for answers and lesson lines built on them) are kept but never resurfaced on home. Doing a lesson again never keeps the same line twice. If IndexedDB is unavailable, everything runs in memory.

## Migration

From `heyyou.v1` (localStorage), as in v2: name, welcomed, tried, every entry with weights as loudness, retried if saving fails, the old key removed only by "clear everything". v2 databases upgrade in place (Dexie version 2).

## Content

Validated at build time (tests) and at load (Zod). Strict in development, forgiving in production. See `content/README.md`.

## Accessibility

WCAG 2.2 AA (habit colors darkened in light mode for 4.5:1 with white; dark text on light colors in dark mode). Full keyboard use, visible focus, focus moves to each new step's heading. The voice check works with buttons as well as swipes. Loudness is a native range with `aria-valuetext`. The voice map and trend chart have text alternatives, and the top habits are listed as links. Reduced motion removes all movement, including sol's breathing and the card swipes.

## Out of scope

Everything in CLAUDE.md's list, plus syncing, reminders, sharing, and the language drafts in `content/language/`.

## Later: app stores

Wrap the same build with Capacitor for native haptics and store distribution. Not built in v1.

## How each part is verified

| part | check |
| --- | --- |
| content | unit tests parse every file; every path item loads; every lesson has a takeaway, an experiment and at least three interactive steps; sol's bubbles stay short; habit lessons spot the right habit; avoided words never appear (except inside the inner voice's own lines) |
| voice logic | unit tests for the deck, scoring, weights, places and loudness trend |
| store and migration | unit tests (v1 blob, malformed input, retry, logs, memory fallback) |
| flows | Playwright at 390px: welcome, voice check to map to habit, catch it to answer it, check-in, a full lesson with resume, a habit lesson, this or that, answer it, book, settings, offline |
| accessibility | axe (WCAG 2.2 AA) on every screen in light and dark |
| look | screenshots of every screen at 390px in light and dark (`scripts/shots.mjs`) |
| quality | Lighthouse mobile: 90+ performance, accessibility, best practices |
