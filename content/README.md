# content

Everything hey you says lives here as JSON, separate from the code. Adding a lesson, a voice habit, a way to answer, or a question never requires changing code. Every file is checked against a schema (`src/content/schema.ts`): a broken file fails the tests, and in the app the broken piece is skipped while the rest keeps working.

- `index.json`: the welcome, ways to answer, questions, habits, copy, help, credits, and the learn **paths** (each with `id`, `name`, `blurb`, `color`, and `lessons`).
- `start/welcome.json`: the welcome chat with dawn.
- `tour.json`: the quick look around after the welcome. Each step has a `tab` (home, learn, practice, book or you) to light up and a short `say`; `{companion}` is filled in. Edit, add or reorder steps with no code change.
- `habits.json`: the ten voice habits, the voice check note, and their source.
- `formulas.json`: the ways to answer, plus `catchIdeas`.
- `questions.json`: quick this-or-that questions.
- `copy.json`: every interface string. Its shape is the app's type, so a missing string fails the typecheck.
- `help.json`, `credits.json`: real help lines; third-party assets with licenses.
- `inner-voice/`, `talk-to-you/`, `what-you-like/`, `what-you-think/`: lessons.
- `language/`: early drafts, not shipped.
- `growth/<feature>/`: content for each growth practice (one rung up, your lines, the warm room, proof, the feel check). Each practice loads and validates its own files; see `docs/growth/PLAN.md`.

## Paths

A path lists lessons by file path (`"inner-voice/everyone-has-one.json"`) or by habit (`"habit:rules"`). A habit lesson is built from the habit's data, so adding a habit and listing it is all it takes. Colors: violet, pink, coral, gold, teal, plum, blue, orange, lime, mint.

## Voice habits (`habits.json`)

Each: `id`, `name` ("the rule keeper"), `short`, `color`, `glyph` (ruler, eye, loop, cloud, scales, tag, shrink, target, split, wave), `says` (what it tends to say), `quiz` (lines for the voice check), `job` (what it's trying to do, said with appreciation), `misses` (what it can leave out), `spot` (`scene`, `quote`), `answers` (`way` from formulas.json, `line`), `kind` (two or three short kind lines offered to keep in the book; the answers often quote the voice, so they stay in the lesson), `keep` (a takeaway), `try` (a small experiment).

## Lessons

Top level: `id`, `title`, `subtitle`, `minutes`, `steps`, `grounding` (sources). In text, `{name}` is what the person is called and `{companion}` is dawn's name.

| type | what it shows | fields |
| --- | --- | --- |
| `say` | a bubble from dawn | `text`, optional `mood` (calm, happy, curious, sleepy) |
| `scene` | a line the inner voice says | `quote`, optional `label` |
| `mine` | a line in your own voice | `text` |
| `ask` | a question with tap replies; dawn answers each | `text`, `options` (`label`, `reply`) |
| `tryon` | lines to try on and notice | `prompt`, `lines`, `reply` |
| `pick` | choose any; optionally kept | `prompt`, `options`, `reply`, optional `keep`, `as` (with `{x}`), `max` |
| `write` | finish a sentence; ideas always offered | `prompt`, `template` (with `{x}`), `ideas`, optional `keep`, `placeholder`, `said` (true when the sentence wraps something the inner voice says, so it's never resurfaced on home) |
| `spot` | which habit is talking? dawn offers one reading, never a grade | `scene`, `quote`, `options`, `answer` (the reading dawn offers), `explain` |
| `tot` | quick this or that, kept as likes | `prompt`, `pairs`, `keep` |
| `takeaway` | a line to keep, with its source | `text`, `source` (`label`, `url`), optional `evidence` |
| `experiment` | one small thing to try today | `text` |
| `know` | a short background card: where the idea comes from, as a break mid-lesson | `text` (about 35 words at most), `source` (`label`, `url`, which may be empty), optional `evidence` |
| `recall` | a look back at an earlier lesson's idea: dawn asks, the person thinks, then taps "show me" or "i remember it". If that lesson isn't done yet, it shows as a small preview instead | `from` (a lesson key, like `talk-to-you/the-you-trick`), `prompt`, `answer` |
| `breathe` | asks, then three slow breaths; skippable | none |
| `list` | a short list | `text`, `items` |
| `name` | what to call the person (welcome) | `text`, `placeholder` |
| `end` | the welcome's last line | `text`, `button`, `then` (check or home), `later` |

`keep`: `my-words`, `what-i-like`, or `what-i-think`. Write kept sentences in first person; your book reads about-you entries back in second person.

## Writing rules

Follow `CLAUDE.md`: exploring, not correcting; lowercase; adult and warm, never cute; one idea per bubble, about 30 words at most; every lesson ends with a takeaway (with an honest source and evidence label) and an experiment; always a way to skip. Habits are described by what they're trying to do, never as flaws.

**The book keeps kind things.** Ideas offered to keep (a `write` or `pick` with `keep`) are kind lines, good moments, likes, values and opinions, never a hard feeling or a harsh thought ("i'm sad", "i failed"). A lesson can meet a hard moment briefly, with one example and without keeping it, then turn toward something kinder. A test checks kept ideas for heavy words.

**Background and look backs.** Every lesson has at least one `know` card between steps, so there's something to latch onto and a real source behind it. Every lesson after the first in a path opens with a `recall` of the one before: trying to remember (Roediger & Karpicke, 2006), spaced over days (Cepeda et al., 2006), helps ideas stick. Home also brings a finished lesson's takeaway back after 1, 3, 7 and 21 days (`src/growth/review/`), so write takeaways that stand on their own.
