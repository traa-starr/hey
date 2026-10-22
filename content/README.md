# content

Everything hey you says lives here as JSON, separate from the code. Adding a lesson, a voice habit, a way to answer, or a question never requires changing code. Every file is checked against a schema (`src/content/schema.ts`): a broken file fails the tests, and in the app the broken piece is skipped while the rest keeps working.

- `index.json`: the welcome, ways to answer, questions, habits, copy, help, credits, and the learn **paths** (each with `id`, `name`, `blurb`, `color`, and `lessons`).
- `start/welcome.json`: the welcome chat with sol.
- `habits.json`: the ten voice habits, the voice check note, and their source.
- `formulas.json`: the ways to answer, plus `catchIdeas`.
- `questions.json`: quick this-or-that questions.
- `copy.json`: every interface string. Its shape is the app's type, so a missing string fails the typecheck.
- `help.json`, `credits.json`: real help lines; third-party assets with licenses.
- `inner-voice/`, `talk-to-you/`, `what-you-like/`, `what-you-think/`: lessons.
- `language/`: early drafts, not shipped.

## Paths

A path lists lessons by file path (`"inner-voice/everyone-has-one.json"`) or by habit (`"habit:rules"`). A habit lesson is built from the habit's data, so adding a habit and listing it is all it takes. Colors: violet, pink, coral, gold, teal, plum, blue, orange, lime, mint.

## Voice habits (`habits.json`)

Each: `id`, `name` ("the rule keeper"), `short`, `color`, `glyph` (ruler, eye, loop, cloud, scales, tag, shrink, target, split, wave), `says` (what it tends to say), `quiz` (lines for the voice check), `job` (what it's trying to do, said with appreciation), `misses` (what it can leave out), `spot` (`scene`, `quote`), `answers` (`way` from formulas.json, `line`), `keep` (a takeaway), `try` (a small experiment).

## Lessons

Top level: `id`, `title`, `subtitle`, `minutes`, `steps`, `grounding` (sources). In text, `{name}` is what the person is called and `{companion}` is sol's name.

| type | what it shows | fields |
| --- | --- | --- |
| `say` | a bubble from sol | `text`, optional `mood` (calm, happy, curious, sleepy) |
| `scene` | a line the inner voice says | `quote`, optional `label` |
| `mine` | a line in your own voice | `text` |
| `ask` | a question with tap replies; sol answers each | `text`, `options` (`label`, `reply`) |
| `tryon` | lines to try on and notice | `prompt`, `lines`, `reply` |
| `pick` | choose any; optionally kept | `prompt`, `options`, `reply`, optional `keep`, `as` (with `{x}`), `max` |
| `write` | finish a sentence; ideas always offered | `prompt`, `template` (with `{x}`), `ideas`, optional `keep`, `placeholder` |
| `spot` | which habit is talking? gentle feedback | `scene`, `quote`, `options`, `answer` (index), `explain` |
| `tot` | quick this or that, kept as likes | `prompt`, `pairs`, `keep` |
| `takeaway` | a line to keep, with its source | `text`, `source` (`label`, `url`), optional `evidence` |
| `experiment` | one small thing to try today | `text` |
| `breathe` | three slow breaths | none |
| `list` | a short list | `text`, `items` |
| `name` | what to call the person (welcome) | `text`, `placeholder` |
| `end` | the welcome's last line | `text`, `button`, `then` (check or home), `later` |

`keep`: `my-words`, `what-i-like`, or `what-i-think`. Write kept sentences in first person; your book reads about-you entries back in second person.

## Writing rules

Follow `CLAUDE.md`: exploring, not correcting; lowercase; adult and warm, never cute; one idea per bubble, about 30 words at most; every lesson ends with a takeaway (with an honest source and evidence label) and an experiment; always a way to skip. Habits are described by what they're trying to do, never as flaws.
