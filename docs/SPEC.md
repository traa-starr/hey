# hey you — spec

hey you helps adults grow a second inner voice: their own, in their own words. This spec covers v1. Scope, stance, and voice rules live in `CLAUDE.md` and win over anything here.

## Screens

Three tabs, shown as a small pill bar at the bottom: **today**, **explore**, **your book**. Full-screen flows (welcome, answer it, a set) hide the tabs and show a close button and a thin progress line.

### Welcome (first open, replayable from your book)

Driven by `content/start/welcome.json`. Eight screens or fewer, each one idea with 20 words or fewer:

1. "hey you." (typographic: the words settle in)
2. most of us carry one loud inner voice. (a grey sentence appears, grows louder)
3. here, you grow a second one. yours. (a serif answer appears beneath; the grey one fades)
4. why "you": talking to yourself as "you" makes hard moments lighter. (source shown, "tell me more")
5. a few promises (no right answers, skip anything, no streaks ever, stays on this phone, not therapy)
6. what should we call you? (optional, with skip)
7. "whenever you're ready, answer one." → answer it, or "look around first"

Finishing sets `welcomed`. Closing the welcome at any point skips it (it can be replayed from your book, always from the start).

### Today

- Greeting by time of day, with the name if given ("morning, sam.").
- **you told yourself**: one line from the book, chosen once per day, with its date. Shared-phone safe: the line stays hidden behind "tap to read it" until the person taps. Lines that record what the inner voice said are never resurfaced. Without any lines, a one-line explanation of what will appear there. Can be turned off in settings.
- **did your inner voice say something?** → starts answer it.
- **getting to know you**: today's question from `content/questions.json` (rotates daily). Answering adds to about you and shows "noted in your book." Skippable, never repeats an answered question until all are answered, then they come round again.
- A quiet link to explore.

### Answer it (the core flow, under two minutes)

Steps, shown by a thin progress line:

1. **catch**: "what did your inner voice say?" Textarea plus "sound familiar?" ideas from `catchIdeas`. Note: "nothing here is saved unless you choose to keep it."
2. **how loud**: the sentence shown large; a 5-step range (a whisper, quiet, clear, loud, all i can hear). The sentence's size, weight, and contrast follow the value. "hard to say" skips.
3. **calm moment** (offered only at loud or all i can hear, always optional): "want to take a breath first?" → three slow breaths with an expanding circle (static, counted text under reduced motion) → continue.
4. **way**: "how do you want to answer it?" The list of ways, each with its name, evidence label, and a before → after example in the two voices. Opening one starts writing.
5. **write**: the inner sentence small in grey above, the answer forming in serif below. Slots filled from `name`, `original`, `original-i`, chips, or typed text, each with idea chips; filled slots stay editable. "about this way" shows why it works; source and evidence are always shown. "this is mine" enables once every slot is filled.
6. **again**: "and now?" The original at its earlier size with the answer beneath; the same range. Optional.
7. **kept**: the answer as a page, loudness before → after, and a message by outcome (quieter / same / louder, never graded). When the answer still contains the inner voice's own words (ways that build on them), the screen says so and offers "change it" before anything is kept. Options: keep it in my book (with an opt-in "also keep what the inner voice said" as its own entry), try another way, let it go.

Started from a specific way (explore or today), step 4 is skipped.

### Explore

- **ways to answer**: every formula, with name, frame, evidence label. Opens a detail view (why, before → after, source, "try it on one of yours").
- **getting to know you**: the sets from `content/index.json` with minutes and "tried".

### A set (lesson player)

Plays any lesson file. Supported step types: `welcome`, `show`, `try-on`, `promises`, `this-or-that`, `build`, `write`, `pocket`, `try`, `close`. One step per screen, progress line, close and back buttons. Each step keeps its own answers, so going back never keeps the same thing twice. Progress is saved per set after every step, so every unfinished set resumes where it left off.

### Your book

- Title, then two tabs: **things you've told yourself** and **about you**.
- Entries newest first: text (about-you entries read in second person), date, the way used, loudness before → after when both were set.
- Each entry: edit (inline field) and remove (with an in-page confirm).
- Empty states explain, in one line, what will appear.
- Then settings: what to call you · read aloud (off/on, read each screen automatically, voice, speed) · soft sounds (off/on) · appearance (follow the time of day / always light / always dark) · real help · about and sources · replay the welcome · add to home screen · your data (export as a file, clear everything with confirm).

## Data model

IndexedDB database `heyyou` (Dexie), version 1:

| table | key | fields |
| --- | --- | --- |
| `entries` | `id` | `kind` (`voice` \| `about`), `sub` (`like` \| `think`, about only), `text`, `from`, `at` (ISO), `before?`, `after?` (1–5) |
| `kv` | `key` | `value` (JSON): `name`, `welcomed`, `tried` (`{lessonId: iso}`), `settings`, `progress` (`{[lessonPath]: {i, locals}}`), `answered` (`{questionId: iso}`), `migratedV1` |

Settings: `{ readAloud: boolean, autoRead: boolean, voice: string | null, rate: number, sound: boolean, appearance: "time" | "light" | "dark" }`.

Text is stored in first person, as written. About-you entries are shown in second person by `toSecondPerson()` at display time, so editing shows the person's own words.

The in-progress answer (including the inner sentence) lives only in memory and `sessionStorage`. It is cleared when the answer is kept or let go, and expires after 30 minutes without changes, so a shared phone never shows it later.

If IndexedDB is unavailable, the store runs in memory and the app still works.

## Migration from v1

On first load, if `localStorage["heyyou.v1"]` exists and `migratedV1` is not set:

| v1 | v2 |
| --- | --- |
| `name`, `welcomed`, `tried` | same keys in `kv` |
| `collected["my-words"][]` | `entries` with `kind: "voice"` |
| `collected["what-i-like"][]` | `kind: "about"`, `sub: "like"` |
| `collected["what-i-think"][]` | `kind: "about"`, `sub: "think"` |
| entry `id`, `text`, `from`, `at` | kept as is |
| entry `before`, `after` (feather 1 … boulder 5) | kept as loudness 1 … 5 |

Then `migratedV1` is set, only once the move has really been saved (a failed move is tried again next time). The old key is left in place, so nothing can be lost; only "clear everything" removes it. Malformed JSON or entries are skipped, not fatal.

## Content schema

Every file in `content/` is validated at build time (Vitest) and at load (Zod `safeParse`). In development a broken file throws with the path and issue; in production the broken item is skipped and the rest of the app works.

- `index.json`: `start`, `formulas`, `questions`, `copy`, `help`, `practices[]` (`id`, `name`, `blurb`, `lessons[]`).
- `formulas.json`: `intro`, `catchIdeas[]`, `formulas[]` (`id`, `name`, `frame`, `why`, `example {before, after}`, `template`, `slots[]` (`key`, `label`, `fill?` name/original/original-i, `chips?`, `placeholder?`, `ideas?`), `source {label, url}`, `evidence`).
- `questions.json`: `questions[]` (`id`, `prompt`, `options[]`, `keep` like/think, `as` template such as `i'd pick {x}.`).
- `copy.json`: every UI string not in a lesson (greetings, loudness names, flow prompts, replies, settings text, empty states).
- `help.json`: crisis lines (`name`, `detail`, `url?`, `href?` for tel: and sms: links), with region note.
- `credits.json`: third-party assets with license and use.
- Lessons: as documented in `content/README.md`.

## Accessibility

WCAG 2.2 AA contrast in every time of day in light and dark. Full keyboard use with visible focus. On every new step, focus moves to its heading; confirm dialogs take focus. Screen-reader labels on every control. The loudness control is a native range input with `aria-valuetext`. Every animation has a static equivalent under `prefers-reduced-motion`. Text scales with browser settings. Touch targets of at least 44px.

## Out of scope

Everything in CLAUDE.md's out-of-scope list, plus: syncing between devices, reminders, sharing, the three language lessons (`content/language/`, kept on disk, not wired up).

## Later: app stores

Wrap the same build with Capacitor (iOS and Android) to add native haptics (`@capacitor/haptics`) and a home-screen icon without the browser. The web app stays the source of truth; storage moves to the native WebView's IndexedDB unchanged. Not built in v1.

## How each part is verified

| part | check |
| --- | --- |
| content schemas | unit test parses every file in `content/` |
| first-person and second-person converters | unit tests with real catch ideas and lesson sentences |
| templates and slot filling | unit tests for every formula |
| migration | unit test: a real v1 blob → expected entries and kv, idempotent on second run, survives malformed input |
| store | unit tests: add, edit, remove, clear, memory fallback |
| welcome, answer it, a set, your book, settings | Playwright end-to-end at 390px |
| look | screenshots of every screen at 390px, light and dark, and reduced motion |
| quality | Lighthouse on the built app: 90+ performance, accessibility, best practices; installable PWA |
| words | a check that no avoided word appears in `content/` or `src/` copy |
