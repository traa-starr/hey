# content

All lessons, prompts, and shelf items live here as data files, separate from the app's code. Adding content should never require changing code.

- `language/` — one file per language pattern
- `desires/` — prompt sets for what you like and want
- `opinions/` — low-stakes questions to form and say a view
- `shelf/` — resource shelf items, each with source, license, and allowed use

## Language lesson format

Each lesson is one JSON file in `language/`. `language/its-fine.json` is the reference example.

Top-level fields: `id`, `practice`, `title`, `subtitle`, `minutes`, `steps` (in order), `grounding` (the research or practice the lesson draws on).

Each step has a `type`. Most also carry a `stage` (`notice`, `understand`, `rewrite`, `keep`, `try`) so the app can show progress.

| type | What it shows | Fields |
| --- | --- | --- |
| `welcome` | A short, warm opener. Never asks how you feel. | `text`, `button` |
| `scene` | A small relatable moment, then what was underneath. | `scene`, `reveal`, optional `prompt` + `options` + `reply`, or `button` |
| `understand` | Two or three short lines on what the pattern does. | `lines`, `button` |
| `rewrite` | A sentence in context and a few ways to say it, each with a gentle note on what it tends to do. No right answer. | `context`, `original`, `prompt`, `options` (`text`, `note`), optional `footer` |
| `write` | Optional free writing, with chips as starters. | `prompt`, `chips`, `input` (`label`, `placeholder`), `keep`, `skip` |
| `pocket` | Phrases to save for later. | `prompt`, `phrases`, `keep` |
| `try` | One optional small thing for real life today. | `prompt`, `options`, `skip` |
| `close` | A short ending. | `text`, `button` |

`keep` names where the answer is saved in me, collected (`my-words`, `what-i-like`, `what-i-think`).

## Writing rules

Follow the voice and feature tests in the root `CLAUDE.md`: lowercase, show don't tell, no grades, every option makes sense, always a way to skip.
