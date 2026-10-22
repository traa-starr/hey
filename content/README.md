# content

Everything hey you says lives here as JSON, separate from the code. Adding a lesson, a way to answer, or a question never requires changing code: edit or add a file, list it in `index.json` if it's a lesson, and push. Every file is checked against a schema (`src/content/schema.ts`): a broken file fails the tests, and in the app the broken piece is skipped while the rest keeps working.

- `index.json`: which files exist and in what order (the welcome, ways to answer, questions, copy, help, credits, and the lesson sets).
- `start/welcome.json`: the welcome story.
- `formulas.json`: the ways to answer, plus `catchIdeas` (inner-voice sentences people can tap).
- `questions.json`: the daily "getting to know you" question on today.
- `copy.json`: every interface string that isn't in a lesson.
- `help.json`: real-help lines shown at the bottom of your book.
- `credits.json`: third-party assets (fonts) with license and how we use them.
- `desires/`, `opinions/`: lesson sets for what you like and what you think.
- `language/`: early drafts kept for later; not shown in the app.

## Ways to answer (`formulas.json`)

Each: `id`, `name`, `frame` (the shape, with `___`), `why`, `example` (`before`, `after`), `template` (with `{key}` slots), `slots`, `source` (`label`, `url`, may be empty), `evidence` (an honest label).

Each slot: `key`, `label`, and one of: `fill` (`name` for what the person is called, `original` for the inner voice's sentence, `original-i` for that sentence turned into first person), `chips` (pick one), or free typing with `placeholder` and `ideas` (tappable suggestions). Every typed slot needs `ideas`, so nobody starts from an empty box.

## Questions (`questions.json`)

Each: `id`, `prompt`, `options` (two or more), `keep` (`like` or `think`), and `as`: how the answer is written in the book, in first person, with `{x}` for the option (for example `i'd pick {x}.`). Your book reads it back in second person ("you'd pick sunrise.").

## Lesson format

One JSON file per set. Top-level: `id`, `practice`, `kind` (`tool`), `title`, `subtitle`, `minutes`, `steps`, `grounding` (the research or practice it draws on).

| type | what it shows | fields |
| --- | --- | --- |
| `welcome` | a short opener. never asks how you feel. | `text`, `button`, optional `visual` |
| `show` | one short line, then a soft button. | `text`, `button`, optional `more` (behind "tell me more"), `source`, `visual` |
| `try-on` | the same moment said a few ways, to notice how each lands. never graded. | `prompt`, `options`, `question`, optional `answers`, `reply` |
| `promises` | what hey you promises. | `prompt`, `items`, `button` |
| `this-or-that` | quick gut picks between pairs, kept as likes. | `prompt`, `pairs`, `extras` (both, neither), `keep` |
| `build` | make your own sentence from chips and typing. | `prompt`, `template`, `parts` (`key`, `label`, `chips` and/or `input`, `placeholder`, `ideas`, `allowCustom`), `reply`, `keep`, `optional` |
| `write` | optional free writing, with chips as starters. | `prompt`, `chips`, `input` (`label`, `placeholder`), `keep`, `skip` |
| `pocket` | phrases to keep for later. | `prompt`, `phrases`, `keep` |
| `try` | one optional small thing for real life today. | `prompt`, `options`, `skip` |
| `close` | a short ending. | `text`, `button`, optional `then` (`answer`) and `later` |

`visual` (welcome only) picks a typographic scene: `hey`, `inner`, `answer`, `you`.

`keep` says where an answer goes: `my-words` (things you've told yourself), `what-i-like` or `what-i-think` (about you), or `name`. Write kept sentences in first person; the book turns about-you entries into second person when it shows them.

## Writing rules

Follow the core stance, voice, and feature tests in the root `CLAUDE.md`: exploring, not correcting; lowercase; adult and plain; show, don't tell; no grades; every option makes sense; always a way to skip. `start/welcome.json` is the reference for tone.
