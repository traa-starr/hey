# proof, and how the mind works

Agent 4 of the growth practices. Plan: `docs/growth/PLAN.md`, section 4.

## what it is

**proof** takes a thought into real life as a small experiment, and keeps what turns up.

- **morning** (`#/grow/proof/new`): pick where today's experiment comes from (a ladder `top`, one of the lines, or "something my inner voice predicts"), then write or pick the claim, a guess for the day, one small thing to do, and a 0 to 100 reading of how true it feels. Every text field offers tappable ideas.
- **evening** (`#/grow/proof/close/<id>`): feel check (skippable) → what actually happened (four warm options, never graded) → anything to keep as proof (skippable) → how true it feels now → close it, keep it open, or let it go → feel check after (skippable). A shift is saved only when both feel checks happened.
- **home card** (`today.tsx`, priority 40): only after 17:00, only for an open experiment started in the last two days. It never shows the thought, and "not tonight" puts it away for the day. An older open experiment never comes back as a card; it waits in proof, with no clock on it.
- **the same claim comes back:** while a claim is written, and again on the next step, proof shows what was already kept against it (matching ignores case and punctuation, and allows a close rewording).
- **proof home** (`#/grow/proof`): open experiments, everything kept (the thought behind each is hidden until tapped), and "why this works" with short bubbles and sources.
- **book** (`book.tsx`): the proof collection, hidden when empty.
- **tile:** `blue`, order 4.

Nothing is scored. No streaks, counts of days, or "failed": an experiment is open, closed, or let go.

## records

| feature, type | data |
| --- | --- |
| `proof`, `experiment` | `{ claim, prediction, result: string \| null, closedAt: string \| null, plan?, source?: "ladder" \| "line" \| "voice", believe?, believeAfter?, letGo? }`. Closing sets `result` and `closedAt` with `regrow`; letting go sets `closedAt`, `result: null`, `letGo: true`. |
| `proof`, `proof` | `{ text, from: "an experiment", experiment?, claim? }` |

Reads (defensively, with zod, skipping anything that doesn't parse): `ladder`/`climb` → `top`, `lines`/`line` → `text`. With neither practice present, only "something my inner voice predicts" is offered. `from` stays a neutral label so other practices can show it; the claim lives in `claim`.

**Privacy:** the experiment contract needs the claim, so for "something my inner voice predicts" the words are stored on the device. They are never shown on home, and in the book and in proof they stay behind a tap ("what it was testing"). The morning screen says so. See the request file for an optional change.

## content

- `content/growth/proof/proof.json`: all words (`copy`), and tappable `ideas` for the claim, the guess, the plan and what to keep. Adding an idea or a "what happened" option needs no code (the option `id`s `asVoice`, `different`, `between`, `notyet` are known to the code).
- `content/how-your-mind-works/*.json`: six lessons, one path appended to `content/index.json` (id `how-your-mind-works`, color `blue`). Each has a look back at the lesson before, background cards with sources and evidence labels, at least three interactive steps, a takeaway and an experiment. Topics: why the mind talks to itself · the negativity bias · self-esteem and self-compassion · self-talk and the people around us · naming feelings · what changing a habit of thought takes.

## sources

| idea | source | evidence label we show |
| --- | --- | --- |
| behavioural experiments | Bennett-Levy et al., 2004, *Oxford Guide to Behavioural Experiments in Cognitive Therapy* | well used in therapy, mostly with a therapist; less tested as a solo exercise |
| the negativity bias | Baumeister et al., 2001, *Review of General Psychology* | strong (a large review) |
| inner speech | Alderson-Day & Fernyhough, 2015, *Psychological Bulletin* | moderate (a review; inner speech is hard to measure) |
| "you" and names | Kross et al., 2014 (already in the app) | moderate (seven studies, one lab) |
| self-esteem vs self-compassion | Neff & Vonk, 2009, *Journal of Personality* | moderate (surveys show links, not cause) |
| self-compassion and motivation | Breines & Chen, 2012, *Personality and Social Psychology Bulletin* | moderate (four experiments) |
| self-compassion in relationships | Neff & Beretvas, 2013, *Self and Identity* | moderate (one study; a link, not a cause) |
| naming feelings | Lieberman et al., 2007, *Psychological Science* | moderate (small imaging study) |
| intentions and behaviour | Webb & Sheeran, 2006, *Psychological Bulletin* | strong (a review of experiments) |
| how long habits take | Lally et al., 2010, *European Journal of Social Psychology* | moderate (one study of simple habits) |

"neuroplasticity" is not used. The last lesson says plainly that nobody can promise rewiring a brain in a week.

## tests

- `src/growth/proof/proof.test.ts`: record parsing, claim matching, the evening rule, defensive reads, copy.
- `e2e/growth-proof.spec.ts`: the full morning and evening flow at 390px with axe on each screen, the same claim coming back, an experiment staying open or let go, the home card and "not tonight", the book section, and one full science lesson with axe.
- `src/growth/proof/screenshots/`: every screen at 390px in light, dark and reduced motion (nine contact sheets, three each).

## requests

See `docs/growth/requests/proof.md`.
