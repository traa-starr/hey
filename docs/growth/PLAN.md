# Growth practices: the shared plan

Four practices built by four agents at the same time. Read `MANIFESTO.md` first, and the voice rules in `CLAUDE.md`, especially "go easy on 'you'": these practices exist to help people feel what it's like to be kind to themselves, so lead with warmth and gratitude, never with what's hard. They teach people to relate to themselves in their own words, one believable step at a time, and to feel the difference. Read this whole file before writing code, along with `CLAUDE.md`, which still rules over everything here.

## Why these four, and the line we hold

hey you does not hand people generic affirmations. Positive self-statements that sit far from what someone believes can make people with low self-esteem feel worse (Wood, Perunovic & Lee, 2009, *Psychological Science*). What holds up:

- **believable steps:** cognitive reappraisal (Gross, 1998; 2015)
- **affirming your own values:** self-affirmation (Steele, 1988; Cohen & Sherman, 2014)
- **self-compassion:** Neff & Germer, 2013; Gilbert's compassion-focused therapy
- **testing beliefs in real life:** behavioural experiments (Bennett-Levy et al., 2004)
- **naming feelings:** affect labeling (Lieberman et al., 2007)

Every practice opens and closes with the shared **feel check**, so people *see* the difference a practice made. Nothing is ever scored: no shift is a fine result too.

The popular "emotional ladder" is not research-based. Don't cite it. We use the step-by-step idea and ground it in reappraisal.

## Who owns what

| agent | practice | id | branch |
| --- | --- | --- | --- |
| 1 | **one rung up**: think your way up, one believable rung at a time | `ladder` | `growth/ladder` |
| 2 | **your lines**: personal affirmations built from your values and real moments, plus today's line on home | `lines` | `growth/lines` |
| 3 | **the warm room**: a self-compassion practice with a compassionate voice you build | `warm` | `growth/warm` |
| 4 | **proof**: real-life experiments and evidence, plus the science path "how your mind works" | `proof` | `growth/proof` |

Each agent changes **only** these paths (enforced by `npm run scope <id>`):

- `src/growth/<id>/`: all code, tests and styles
- `content/growth/<id>/`: all content and copy, as JSON
- `e2e/growth-<id>.spec.ts`: end-to-end tests
- `docs/growth/<id>.md`: what you built, how it works, its sources
- `docs/growth/requests/<id>.md`: anything you need changed outside your paths (see below)
- agent 4 only, also: `content/how-your-mind-works/` and one new entry appended to `paths` in `content/index.json`

Everything else is shared and owned by the foundation: the store, router, app shell, home, practice, book, `content/copy.json`, `src/styles/app.css`, `src/ui/`, and the existing e2e specs. If you need a change there, **don't make it**. Write the smallest version of the change you need in `docs/growth/requests/<id>.md`, mention it in your PR, and build around it with a fallback. The integrator applies requests after the four PRs land.

## The foundation (already on main)

### Plugging in

A practice is a folder. The app finds these files on its own, so you never edit shared files to add them.

| file | export | what it does |
| --- | --- | --- |
| `src/growth/<id>/plugin.ts` | `plugin: GrowthPlugin` | id (equals the folder), `order`, `enabled`, and an optional practice `tile` `{ title, sub, color, icon }`. Keep this file tiny: it loads with the app. |
| `src/growth/<id>/Screen.tsx` | `default` component, gets `{ sub?: string }` | your screens, at `#/grow/<id>` and `#/grow/<id>/<sub>`. Loads on first use. |
| `src/growth/<id>/today.tsx` | `useToday(): TodayCard \| null` | an optional card on home. Home shows only the one card with the highest `priority` right now. Keep it light: it loads with home. |
| `src/growth/<id>/book.tsx` | `BookSection` component | an optional section at the end of your book. Render nothing when there's nothing to show. |

Types live in `src/growth/types.ts`. While `enabled` is `false`, nothing of yours shows in a production build (`npm run dev` shows everything). The e2e tests run on a production build, so set `enabled: true` in your first commit: your branch only reaches `main` once it's finished. Set it back to `false` only if something unfinished ever has to merge.

Tile colors and order, so tiles never clash: ladder `orange`, order 1 · lines `plum`, order 2 · warm `mint`, order 3 · proof `blue`, order 4.

Home card priorities, so cards never fight:

| card | priority |
| --- | --- |
| proof, evening (after 17:00, with an open experiment) | 40 |
| lines, morning (before 12:00) | 30 |
| lines, the rest of the day | 10 |
| warm and ladder | no home card |

### Navigating

Use `go({ name: "grow", feature: "<id>", sub: "..." })` and `href(...)` from `src/router.ts`. Going deeper slides in and closing slides back automatically. Use `FlowTop` (close goes to `{ name: "practice" }`), `Screen`, `SolSays`, `Chips`, `Ideas` and the other pieces in `src/ui/kit.tsx`, and match the look of existing screens.

### Saving

All four practices save through one table, so nobody touches the database:

```ts
import { store } from "../../store/store";        // from src/growth/<id>/
store.grow("<id>", "<type>", { ...data });           // returns the record { id, feature, type, at, data }
store.regrow(recordId, { ...changes });              // merges into data
store.ungrow(recordId);
const { grown } = useData();                         // all records, oldest first; filter by feature and type
```

Parse your own records with a `zod/mini` schema and skip anything that doesn't parse. Records can be old, partial, or from a future version. Clearing everything and saving a copy already include growth records.

### The feel check

```ts
import { FeelCheck } from "../feel/FeelCheck";      // <FeelCheck id="before" phase="before" value={f} onChange={setF} />
import { Shift } from "../feel/Shift";              // <Shift before={a} after={b} />
import { middle, saveShift, type Feel } from "../feel/feel";
saveShift("<id>", before, after, yourRecordId);     // shows up in the book under "how it shifted"
```

Open each practice with the feel check, before anything else, and close with it. Always offer **skip** for both checks, and save a shift only when both happened. A preview lives at `#/grow/feel` in development.

### Content and copy

Everything people read lives in `content/growth/<id>/*.json`, never in code. Import it in your module and validate it with your own `zod/mini` schema (see `src/growth/feel/feel.ts`). Adding a rung idea, a value, a quality or a lesson must never need a code change. The avoided-words test already scans your JSON and your `.tsx` strings.

### Styles

Put them in `src/growth/<id>/<id>.css`, imported from your components. Prefix every class with your id (`.ladder-rung`, not `.rung`). Use the tokens in `src/styles/app.css` (`--primary`, `--surface`, `--<color>`, `--<color>-soft`, `--ease`) so light and dark both work. Turn off any animation under `prefers-reduced-motion`.

## Shared data: who may read what

Practices are independent. They don't import each other (lint enforces it), but they may **read** each other's records through `useData().grown`, defensively, because the other practice might not exist yet. The owners promise to write at least these fields:

| feature, type | data (at least) | written when |
| --- | --- | --- |
| `ladder`, `climb` | `{ start: string, rungs: { text: string, believe: number }[], top: string \| null }` | a climb ends; `top` is the last rung, in the person's words |
| `lines`, `line` | `{ text: string, value: string, moment: string \| null, truth: number }` | a line is kept; `regrow` when tuned |
| `warm`, `voice` | `{ name: string \| null, qualities: string[] }` | the compassionate voice is made or changed |
| `proof`, `experiment` | `{ claim: string, prediction: string, result: string \| null, closedAt: string \| null }` | opened in the morning; `regrow` when closed |
| `proof`, `proof` | `{ text: string, from: string \| null }` | evidence is kept |
| `feel`, `shift` | `{ practice, before: Feel, after: Feel, ref? }` | through `saveShift` only |

Expected reads: the warm room speaks the person's own `lines`; proof turns a ladder `top` or a `line` into today's experiment; your lines can borrow `proof` moments. Each read has a graceful fallback when there's nothing to read.

**Privacy:** the inner voice's sentence is never stored unless the person opts in, same as answer it. If a ladder starts from the loud sentence, store the feeling word instead, unless they tick "keep it". Nothing revealing shows on home: a home card shows a line only after a tap, like "you told yourself" does today.

## How each practice works

### 1. one rung up (`ladder`)
For when it's heavy.
1. Feel check.
2. "where are you starting?": a feeling word, or the loud sentence (the sentence is not stored unless they opt in).
3. sol offers 3 to 4 candidate next thoughts, each only slightly more hopeful, from `content/growth/ladder/` and keyed to the starting point.
4. The person picks one or writes their own, then rewrites it in their own words, with ideas offered.
5. "how true does this feel?" (0 to 100).
   - At 60 or more: it becomes a rung, and they go one up.
   - Below 60: sol offers a smaller step, and stays curious, never correcting.
6. Stop any time, or after 3 to 5 rungs.
7. The ladder, drawn bottom to top in their own sentences, beside the feel check after.
8. Keep the climb. Optionally take the top rung into real life, which proof can pick up.

Teach, briefly and in bubbles, why believable beats big (the Wood 2009 finding) and what reappraisal is. Book section: past ladders.

### 2. your lines (`lines`)
1. Pick a value: a list in content (honesty, humor, showing up, curiosity, care, courage…), plus "my own word".
2. Recall one small, recent moment you lived it. No painful memories; prompts stay small and everyday.
3. sol shapes it into a line that uses the person's name, *"sam shows up, like yesterday with mia."*, from templates in content. With no name, use first person (*"i show up, like yesterday with mia."*). Second-person "you" self-talk belongs only to the "you" trick lesson; see Voice in `CLAUDE.md`.
4. Tune it: swap words using a word bank drawn from the person's own words (their book entries and past lines) plus content suggestions.
5. Try it on, read aloud if they like. "how true does this feel?"
6. Keep it.

Feel check before and after the first session of the day. **Today's line** on home shows one of their lines, rotating daily (`dailyIndex` in `src/lib/time.ts`), hidden until tapped, with "still true?", which opens tuning. Book section: your lines as a small gallery. Teach values affirmation (Steele; Cohen & Sherman), and the distance that using your own name gives (Kross 2014, already in the app).

### 3. the warm room (`warm`)
1. Feel check.
2. A short settling: breath (reuse `src/ui/Breath.tsx`, read only) and an optional hand on your chest, always skippable. Soothing touch lowered cortisol in one study (Dreisoerner et al., 2021); label it honestly.
3. First visit: build a **compassionate voice**. Pick 2 to 3 qualities (steady, warm, funny, fierce, gentle, wise…) and an optional name.
4. Bring today's small hard thing, in a few words or by tapping an idea. Never ask for painful memories, and offer skip.
5. The voice answers in the chosen tone, using templates from content, and, when they exist, the person's own lines.
6. Feel check after.

Teach the three parts of self-compassion (kindness, common humanity, mindfulness; Neff), and why self-compassion isn't self-indulgence. Book section: your voice, and visits (counts only if they help).

### 4. proof (`proof`), plus the science path
- **Morning:** pick today's experiment. Sources: a ladder top, a line, or "something your inner voice predicts". Write the claim and a prediction ("if i speak up, they'll think i'm annoying").
- **Evening** (home card after 17:00): what actually happened? Keep any evidence as proof. Experiments can stay open or be let go, never "failed".
- When an old claim comes back (same words), show the proof gathered against it.
- Book section: the proof collection.

Teach behavioural experiments (Bennett-Levy 2004) and the negativity bias, briefly.

**The science path, "how your mind works":** 5 or 6 lessons in `content/how-your-mind-works/`, as one path appended to `content/index.json` (id `how-your-mind-works`, color `blue`). Use only the existing lesson step types (`content/README.md`), each lesson with a takeaway with sources and an honest evidence label, plus an experiment. Topics:
- why you talk to yourself, and why "you" helps
- the negativity bias
- self-esteem vs self-compassion
- how self-talk shapes relationships (Neff & Beretvas, 2013)
- naming feelings (Lieberman 2007)
- what changing a habit of thought really takes: practice, not insight, and it's slow

No overclaiming. "Neuroplasticity" only with care, never "rewire your brain in 7 days".

## Rules every agent follows

1. Read `CLAUDE.md` and this file first. The stance, the voice, the never-words and the six questions apply to every screen.
2. Stay in your paths. Run `npm run scope <id>` before every push; it must say "scope ok".
3. Don't import other practices; lint enforces it. Read their records only through `useData().grown`.
4. No new dependencies: four agents editing `package.json` would collide. Use what's installed (React, motion, zod/mini, Dexie), or ask in your request file.
5. No streaks, points, badges, levels or guilt. Counts appear only where they help someone see their own pattern.
6. Every claim has a source and an honest evidence label in content. If you can't source it, don't say it.
7. Every text field offers tappable ideas. sol's bubbles stay about 30 words or fewer. One idea per screen.
8. Accessibility: real buttons and labels, visible focus, `aria-valuetext` on sliders, text alternatives for anything drawn, and full use without motion.
9. Before your PR, all of these pass:
   - `npm run check` (typecheck, lint, unit tests) and `npm run e2e`, including your `e2e/growth-<id>.spec.ts`. That spec covers the main flow at 390px and runs axe on your screens, as `e2e/a11y.spec.ts` does.
   - Screenshots of every screen at 390px in light, dark and reduced motion, looked at, attached to the PR.
   - `npm run scope <id>`.
10. Branch `growth/<id>` from the latest `main`. If `main` moves, merge it into your branch and re-run the checks. Never edit another agent's branch, and don't merge PRs; the person merges.
11. `docs/growth/<id>.md` explains what you built, your content format, your sources, and any requests.

## After the four land (integrator, not the agents)

Apply the requests, fold the four docs into `docs/SPEC.md` and `docs/DESIGN.md`, update `content/README.md`, and give every lesson something that stays in your hands (a rung, a line, a voice, an experiment).
