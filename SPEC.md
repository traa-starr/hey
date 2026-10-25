# spec: a faster "it's loud right now" path

Status: draft for Sam's review. No code. Tap counts are estimates from `docs/SPEC.md` and must be counted on the real screens at 390px before building. All persona risks are assumptions (`docs/ux-discovery/2026-10-23-hey-you-discovery.md` says there is no user research yet).

## 1. Objective

When the inner voice is loud, get a believable line in front of the Quiet Self-Critic in under a minute, with as few taps as possible, and leave them a little lighter.

- Target user: the Quiet Self-Critic (primary): competent outside, harsh inside, wants a line they can believe in a loud moment, probably on a phone in a public or semi-public place.
- Safety test: the Blamed-All-My-Life Newcomer. Any hint of judgment ends the session.
- Today's path (home → "it's loud right now" → answer it): catch sentence, loudness, optional breath, way, write, loudness again, keep. Roughly **9 to 11 taps** with ideas offered.

Acceptance criteria (all options):
1. Skippable at every step, with no dead end and nothing marked failed.
2. The inner voice's sentence is not stored unless the person opts in (unchanged rule).
3. No streaks, points, reminders, nudges or "you haven't used this" copy.
4. Nothing revealing on screen by default (shared-phone safe).
5. Opens with a welcome or thanks, not "how do you feel?". Ends lighter.
6. Resumes only within the same session, 30 minutes (unchanged).
7. Reduced motion honoured; works offline; checked at 390px, light and dark.

## 2. Options

### Option A: "one line now" (shortest, ~4 taps)

Home shortcut → one screen with a short breath-length pause and **one believable line** picked from the person's own kept lines or, if none, from a "one rung up" starter line near where the voice probably is. Taps: shortcut (1), "that fits" or "another" (1 to 2), "keep it" or "let it go" (1). No loudness set, no writing.

- Pros: fastest; zero typing; nothing about the inner voice is entered, so nothing to store.
- Risk to Quiet Self-Critic:
  - **Believability (high).** A line chosen without hearing the sentence can be too far from what they believe, which can backfire (Wood et al., 2009). A skeptic reads it as a generic affirmation and leaves.
  - **No before/after loudness**, so the book can't show the shift, which is the evidence this persona trusts.
  - Weakest on "show, don't tell": it hands a line instead of letting them find one.
- Mitigation: lines only from their own kept book, or a starter line labelled with its honest evidence; "not for me" gets the same warmth.

### Option B: "loud, then pick" (balanced, ~6 to 7 taps), recommended

Home shortcut → **loudness first** (one tap, doubles as the entry point; the same set the later screens use) → **tappable chips for the kind of voice** ("not good enough", "should have", "what if", plus "not sure", all from `habits.json`, no typing) → **three ready ways to answer**, the first one prefilled from the habit's lines → pick a line (1) → loudness again (1, skippable) → keep or let go (1). Breath only offered when loud, as one skippable tap. Typing is never needed; writing stays optional.

- Pros: believability is much better because the habit shapes the line; the loudness pair gives the before/after the persona trusts; every step uses existing content; the inner sentence is never entered, so it isn't stored.
- Risk to Quiet Self-Critic:
  - **Naming the habit may feel like being diagnosed or caught** ("so it's catastrophizing"). Needs warm labels that describe what the voice is trying to do, plus "not sure".
  - **Skipping the written step** means less of their own words, so less ownership; a "put it in my words" tap must stay one tap away.
  - **Tap fatigue at the loudest moment** if the chips are many. Keep to at most four chips and a visible "skip".
  - Loudness-first can feel like "how do you feel?" on arrival. It must read as setting the dial, with a thank-you line above it, never a question.

### Option C: "start in the sentence" (most personal, ~7 to 8 taps)

Home shortcut → **tap-to-pick or short type of the actual sentence** with tappable ideas (never an empty box) → pick a way → write or pick an answer → loudness once at the end → keep. The sentence is used on screen and then dropped; stored only if the person opts in at the end.

- Pros: strongest ownership and believability; closest to today's flow and to Kross et al. (2014) self-distancing, since they talk to "you" about their own words.
- Risk to Quiet Self-Critic:
  - **Highest privacy and shared-phone exposure**: the harsh sentence is on screen. Needs a hide-on-lock or hide-on-blur, and a clear "this isn't kept" line.
  - **Re-reading the harsh sentence can amplify it.** Counter: show it briefly, in the person's own italic, and turn to the answer straight away.
  - **Typing under strain** is the highest friction and a dead-end risk if the ideas don't fit. Slower than today only by about one tap, so it barely improves on the current path.
  - Skipping the opening loudness loses the before/after shift.

## 3. Comparison

| | A: one line now | B: loud, then pick | C: start in the sentence |
| --- | --- | --- | --- |
| Taps (estimate) | ~4 | ~6 to 7 | ~7 to 8 |
| Typing needed | none | none (optional) | some or ideas |
| Sentence stored by default | no | no | no (shown, then dropped) |
| Believability | low to medium | medium to high | high |
| Before/after shift | no | yes | partly |
| Shared-phone exposure | lowest | low | highest |
| Main risk to persona | generic line backfires | feels diagnosed | harsh text re-read, typing strain |

Recommendation: **B**, with A's one-tap "just give me a line" as a quiet link on the first screen of B, so the very loudest moments still have a 3 to 4 tap exit. Revisit after the five-person study (`docs/research/study-plan.md`).

## 4. Commands

Unchanged. Per CLAUDE.md, GitHub runs the checks: `npm run check` (typecheck, lint, unit tests) and `npm run e2e` (Playwright) on the pull request. Do not run them locally to verify.

## 5. Project structure (where a build would touch)

- `content/habits.json`, `content/formulas.json`, `content/copy.json`: chips, labels, lines, copy. No code change to add content.
- `src/` answer-it flow and home shortcut: reuse existing steps; no new storage tables.
- `e2e/`: one new 390px spec for the chosen option, clock pinned.
- Shared files (store, router, home, `src/styles/app.css`) are off limits to growth agents; this is a core change owned by Sam.

## 6. Code style

Match the surrounding code. Copy follows CLAUDE.md voice: lowercase, warm, plain, "you" used sparingly; never "toxic, broken, fix, should, wrong, disorder, healing journey".

## 7. Testing strategy

- Unit: tap path produces the expected state; sentence is absent from storage unless opted in; loudness pair recorded only when both are set.
- e2e at 390px: shortcut to kept in the option's tap budget; every step skippable; resume within 30 minutes only; reduced motion.
- Manual by eye: light, dark, reduced motion; shared-phone glance (nothing revealing).
- Study: add the loud-moment task to the first study round and watch for any moment of feeling judged.

## 8. Boundaries

- **Always:** thank first; start with what's good; offer skip; every answer welcome; keep the tap budget visible in tests.
- **Ask first:** storing anything new on the device; changing the home shortcuts; adding or reordering habit labels; any new claim or evidence label.
- **Never:** streaks, points, reminders, notifications, "you haven't…" copy; storing the inner voice's sentence by default; offering a hard thought to keep; diagnosing; telling anyone to leave a relationship; AI-generated lines (dawn is scripted).

## 9. Open questions for Sam

1. Go with B plus the quiet "just give me a line" exit?
2. Should the shortcut label stay "it's loud right now"?
3. Is it okay for the root `SPEC.md` to sit beside `docs/SPEC.md` (the product spec), or should this move to `docs/specs/loud-path.md`?
