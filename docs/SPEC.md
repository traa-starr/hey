# hey you — spec (v3)

hey you helps adults grow a second inner voice: their own, in their own words. This spec covers v1 as rebuilt in v3. Scope, stance, and voice rules live in `CLAUDE.md` and win over anything here.

## Screens

Five tabs in a floating bar: **learn**, **practice**, **home** (in the middle; the app opens here), **book**, **you**. Full-screen flows (welcome, lessons, voice check, catch it, check-in, answer it, breathe, habit, way, growth practices, the book's pages, settings) hide the tabs and show a close button, a progress bar where there are steps, and read aloud when it's on.

### Welcome (first open)

A chat with dawn (`content/start/welcome.json`) that starts with thanks, not questions about the inner voice:
1. hey you, and meet dawn, who thanks the person for being here.
2. What to call you (optional).
3. "here, we practice kindness pointed inward, the same kind we give the people we love."
4. The person writes their first kind line to themselves, with ideas to tap. It becomes the first line in their book.
5. "how does it land?", where every answer is welcome.
6. The promises.
7. Home, where the quick look around starts.

Closing it at any point skips it, and it can be replayed from settings. The voice check is offered later, from practice and you, never as the first thing.

### Home

A sky (dawn, day, dusk, night, following the clock) with dawn, a greeting with the person's name, and one line from dawn for that time of day (`copy.json` → `dawnSays`). Below it, at most one card from a growth practice (the one with the highest priority: a look back at a finished lesson, today's line, or a proof check). Then **next up** (the first unfinished lesson, path by path, with a progress ring), two shortcuts (a kind minute, or a good moment when the kind minute is already the next step; and "it's loud right now" → answer it), and "from the book", a kept line that stays hidden until tapped (shared-phone safe; never shows what the inner voice said; can be turned off). A "check in" chip in the sky opens the check-in. Nothing else.

### Learn

Paths (`index.json` → `paths`), in this order, each with a color, an icon, and a progress row of its lessons:

| path | lessons |
| --- | --- |
| a kind start | a kind minute · the good stuff · small thanks · savor it |
| talk to you | the "you" trick · the friend test · three kind lines · why to what |
| meet the inner voice | everyone has one · where it comes from · a thought is not a fact · turn down the volume |
| voice habits | one lesson per habit (generated from `habits.json`) |
| what i like | small wants count · this or that · what matters most · asking for it |
| what i think | i think… because… · for now · disagreeing kindly · changing my mind |
| how the mind works | why the mind talks to itself · why the hard moment weighs more · self-esteem and self-compassion · self-talk and the people around us · putting a name to it · what changing a habit of thought takes |

A path shows its lessons with done, pick up again, or minutes.

### A lesson

A conversation with dawn: one step at a time, a continue button for dawn's lines, replies as tappable chips. Step types: `say`, `scene` (an inner-voice line), `mine` (a line in your voice), `ask` (chips, dawn replies), `tryon` (try lines on), `pick` (multi-select, optionally kept), `write` (template plus ideas, optionally kept), `spot` (which habit is talking; dawn offers one reading and never grades the pick), `tot` (this or that), `takeaway` (keep this, with source and evidence, optionally saved as a keeper), `experiment` (try it today), `know` (a background card with its source), `recall` (a look back at an earlier lesson: think first, then "show me" or "i remember it"; a small preview when that lesson isn't done yet), `breathe` (asks first, skippable), `list`, `name`, `end`. Every lesson has a takeaway and an experiment. Progress is saved per lesson after every step; finishing marks it done.

### Voice check

Twenty cards, two per habit, interleaved: "does your inner voice ever say…" → that's me / sometimes / not really (or swipe right or left). Back undoes the last card; a quick double tap never answers two. Scores each habit 0–1 and saves the check. Ends on the voice map, or a kind note when nothing matched; when habits score about evenly, the map says so instead of naming a "loudest".

### Practice

dawn asks what would help. Tiles: catch it, answer it, breathe, voice check, this or that, then one tile per growth practice that has one (one rung up, your lines, the warm room, proof). Below: every way to answer, each opening its own page (the frame, an example, why it works, source, evidence, try it on a real one).

### Catch it

Three taps: which habit (the person's loudest first, or "not sure which") → where (work, home, people, my body, money, the future, the past, online, something else, or skip) → how loud. Opened from a habit, the habit is already picked. Saved as a moment. Then: answer it now (the habit's own lines become the ideas), or done.

### Check-in

Opened only by the person (never on arrival): how loud is your inner voice today, plus optional habits. Feeds "how loud it's been".

### Answer it

As before (v2): catch → how loud → optional breath at loud or all i can hear → way → write → and now → kept. Started from a habit, its lines are the ideas. Started from a way, the way step is skipped. The inner sentence is never stored unless opted in; when the answer contains it, the kept screen says so and offers to change it. The draft lives in `sessionStorage` and expires after 30 minutes.

### You

- **your voice map**: up to six habits as bubbles sized by the latest voice check (75%) and what's been caught (25%), then the top three with what each is trying to do. Tap a habit for its page.
- **when it shows up**: where caught habits happen, as bars.
- **how loud it's been**: one point per day from check-ins and caught moments, last 14 days.
- **settings**, at the bottom.

### Your book

Its own tab. A cover and, one tap away, the pages.

- **the cover**: a night sky with one star for each thing kept (gold for words, teal for about me, pink for keepers). The oldest sit in the middle and the sky grows outward; each star joins its nearest older neighbour. Something kept in the last few seconds lands with a small burst. Shows the person's name and the month the book began; never the words themselves.
- **pages**: three tiles (words, about me, keepers) with how many each holds. Each opens its list (`#/book/voice`, `#/book/about`, `#/book/keeper`), grouped by month, with edit and remove tucked behind one button per entry.
- **what you've read**: every lesson is a book on a shelf, grouped by path. Read ones stand in their color; the rest stay pale, as room. Tap a set to open its path.
- **after answering**: for kept answers with a loudness before and after, a line from one to the other (last ten). Shown only once there is one.
- **your range**: the ways to answer, filled when used with how many times, dashed when not tried yet; and the voice habits met (lesson done or caught). Range, never a score.
- **growth sections**: each growth practice may add its own section (climbs, lines, the warm room, proof, feel checks).

The cover's title reads "sam's book" when there's a name, "the book" when not.

### Habit page

Its glyph and color, what it says, what it's trying to do, what it can leave out, ways to answer it (each opens the way), learn about it, I caught it just now.

### Quick look around

After the welcome, a short tour (`content/tour.json`) lights up one part of each tab in turn while dawn explains it. It can be skipped, resumes where it stopped, and can be replayed from settings.

### Growth practices

Each lives in `src/growth/<id>/` with its content in `content/growth/<id>/`, and is found by its folder (plan in `docs/growth/PLAN.md`): one rung up (`ladder`), your lines (`lines`), the warm room (`warm`), proof (`proof`), the shared feel check (`feel`) and spaced look-backs at finished lessons (`review`). Each may add a practice tile, a card on home and a section in the book.

### Settings

A name to go by · companion (name, show dawn) · read aloud (on, auto, voice, speed, test) · soft sounds · show a kept line on home · appearance (match my phone, always light, always dark) · real help · about hey you and credits · replay the welcome · replay the quick look around · add to home screen · data and privacy (save a copy, clear everything) · a quiet "build N" label.

## Data model

IndexedDB `heyyou` (Dexie). Version 1 tables carry over unchanged; version 2 adds `logs`; version 3 adds `grown`.

| table | key | fields |
| --- | --- | --- |
| `entries` | `id` | `kind` (`voice` \| `about` \| `keeper`), `sub` (`like` \| `think`), `text`, `from`, `at`, `before?`, `after?`, `said?` |
| `logs` | `id` | `type` `moment` (`habit`, `where`, `loud`) \| `checkin` (`loud`, `habits`) \| `check` (`scores`), `at` |
| `grown` | `id` | `feature`, `type`, `at`, `data` (what each growth practice keeps; the feature owns `type` and `data`) |
| `kv` | `key` | `name`, `welcomed`, `tried`, `answered`, `settings`, `progress` (`{[lessonKey]: {i, locals}}`), `done` (`{[lessonKey]: iso}`), `companion` (`{name, on}`), `tour` (`{i, end}` or null), `migratedV1` |

A lesson key is its file path without `.json`, or `habit:<id>`. About-you text is stored in first person and shown in second person. Entries that hold the inner voice's words (`said`, or `holdsSaid` for answers and lesson lines built on them) are kept but never resurfaced on home. Doing a lesson again never keeps the same line twice. If IndexedDB is unavailable, everything runs in memory.

## Migration

From `heyyou.v1` (localStorage), as in v2: name, welcomed, tried, every entry with weights as loudness, retried if saving fails, the old key removed only by "clear everything". v2 databases upgrade in place (Dexie versions 2 and 3).

## Content

Validated at build time (tests) and at load (Zod). Strict in development, forgiving in production. See `content/README.md`.

## Accessibility

WCAG 2.2 AA (habit colors darkened in light mode for 4.5:1 with white; dark text on light colors in dark mode). Full keyboard use, visible focus, focus moves to each new step's heading. The voice check works with buttons as well as swipes. Loudness is a native range with `aria-valuetext`. The voice map and trend chart have text alternatives, and the top habits are listed as links. Reduced motion removes all movement, including dawn's breathing and the card swipes.

## Out of scope

Everything in CLAUDE.md's list, plus syncing, reminders, sharing, and the language drafts in `content/language/`.

## Later: app stores

Wrap the same build with Capacitor for native haptics and store distribution. Not built in v1.

## How each part is verified

| part | check |
| --- | --- |
| content | unit tests parse every file; every path item loads; every lesson has a takeaway, an experiment and at least three interactive steps; dawn's bubbles stay short; habit lessons spot the right habit; avoided words never appear (except inside the inner voice's own lines) |
| voice logic | unit tests for the deck, scoring, weights, places and loudness trend; the book's stars, shifts, range and months |
| store and migration | unit tests (v1 blob, malformed input, retry, logs, memory fallback) |
| flows | Playwright at 390px: welcome, voice check to map to habit, catch it to answer it, check-in, a full lesson with resume, a habit lesson, this or that, answer it, the book cover and pages, settings, the quick look around, each growth practice, offline |
| accessibility | axe (WCAG 2.2 AA) on every screen in light and dark |
| look | screenshots of every screen at 390px in light and dark (`scripts/shots.mjs`) |
| quality | Lighthouse mobile: 90+ performance, accessibility, best practices |
