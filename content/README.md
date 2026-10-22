# content

All lessons, prompts, and shelf items live here as data files, separate from the app's code. Adding content should never require changing code.

- `start/` — the first lesson, showing what hey you is (`welcome.json`)
- `language/` — one file per everyday word or phrase (`its-fine.json` is an early draft, to be rewritten as exploration rather than correction)
- `desires/` — prompt sets for what you like and want
- `opinions/` — low-stakes questions to form and say a view
- `shelf/` — resource shelf items, each with source, license, and allowed use

## Language lesson format

Each lesson is one JSON file in `language/`. `language/its-fine.json` is the reference example.

Top-level fields: `id`, `practice`, `kind` (`tool` for practice lessons), `title`, `subtitle`, `minutes`, `steps` (in order), `grounding` (the research or practice the lesson draws on).

Every practice lesson is a **tool**: a small technique that adds range, never a correction. See `language/the-dial.json` and `desires/want-words.json`.

Each step has a `type`. Most also carry a `stage` (`notice`, `understand`, `rewrite`, `keep`, `try`) so the app can show progress.

| type | What it shows | Fields |
| --- | --- | --- |
| `welcome` | A short, warm opener. Never asks how you feel. | `text`, `button` |
| `show` | One short line that shows an idea, then a soft button. | `text`, `button` |
| `try-on` | The same moment said a few ways, to notice how each lands. Never graded. | `prompt`, `options`, `question`, optional `answers`, `reply` |
| `map` | A simple overview of the practices. | `prompt`, `items` (`name`, `practice`, `text`), `button` |
| `promises` | What hey you promises the person. | `prompt`, `items`, `button` |
| `build` | Make your own sentence with the tool, from chips and optional typing. | `prompt`, `template` (with `{key}` slots), `parts` (`key`, `label`, `chips` and/or `input`, `placeholder`, `allowCustom`), `reply`, `keep`, `optional` |
| `scene` | A small relatable moment, then what was underneath. | `scene`, `reveal`, optional `prompt` + `options` + `reply`, or `button` |
| `understand` | Two or three short lines on what the pattern does. | `lines`, `button` |
| `rewrite` | A sentence in context and a few ways to say it, each with a gentle note on what it tends to do. No right answer. | `context`, `original`, `prompt`, `options` (`text`, `note`), optional `footer` |
| `write` | Optional free writing, with chips as starters. | `prompt`, `chips`, `input` (`label`, `placeholder`), `keep`, `skip` |
| `pocket` | Phrases to save for later. | `prompt`, `phrases`, `keep` |
| `try` | One optional small thing for real life today. | `prompt`, `options`, `skip` |
| `close` | A short ending. | `text`, `button` |

`keep` names where the answer is saved in me, collected (`my-words`, `what-i-like`, `what-i-think`).

## Writing rules

Follow the core stance, voice, and feature tests in the root `CLAUDE.md`: exploring, not correcting; lowercase; show don't tell; no grades; every option makes sense; always a way to skip. `start/welcome.json` is the reference for tone.
