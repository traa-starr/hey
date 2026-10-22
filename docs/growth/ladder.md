# one rung up (`ladder`)

For heavy moments. It helps someone think their way up, one believable rung at a time, then see how it felt. Opens and closes with the shared feel check (both skippable).

## The flow

1. **Feel check** (before), with sol's welcome. Skippable.
2. **Where are we starting?** A feeling word, or the loud sentence. The sentence lives in the tab only; it is saved only if the person ticks "keep the sentence too" on the last screen. Otherwise the feeling word is stored as `start`. A typed sentence that isn't one of the offered ones asks "which feeling is closest?".
3. **Why one rung at a time** (first climb only; always one tap away as "why small steps?"): big self-statements can backfire for some people (Wood, Perunovic & Lee, 2009), and looking at a moment from a slightly different angle is reappraisal (Gross, 1998; 2015). Sources and evidence labels are shown and live in content.
4. **A rung:** 3 candidate thoughts, each a little lighter than the last, keyed to the starting point. Tap one to fill the box, then make it their own. Ways to begin are offered too.
5. **How true does this feel?** 0 to 100, unset until the person moves it, so a number is always an answer.
   - 60 or more: it becomes a rung. One more rung, or enough for now (up to five rungs).
   - Below 60: sol thanks them for the honesty and offers a smaller step (curious, never correcting). Stopping is always fine.
6. **Feel check** (after). Skippable.
7. **The climb:** the ladder drawn bottom to top in their own sentences, next to before and after (only if both checks were answered).
8. **Keep the climb** (or let it go), then optionally **take the top rung into today**.

Nothing is scored, graded or counted. No home card. A tile in practice (orange, order 1) and a book section, "past ladders" (latest five, each removable).

## Saved data

`ladder`/`climb`, written when the climb is kept:

```ts
{ start: string,                              // the feeling word, or the sentence if they chose to keep it
  rungs: { text: string, believe: number }[], // bottom to top
  top: string | null,                         // the last rung
  from?: "word" | "sentence",
  carry?: boolean }                           // "take the top rung into today"; proof may read this
```

The feel shift is saved with `saveShift("ladder", before, after, climb.id)` only when both checks happened.

## Content (`content/growth/ladder/`)

- `points.json`: `points[]`, each `{ id, word, says[], tiers[] }`. `says` are sentences that sound like the starting point (tappable ideas). Each of the 5 `tiers` is `{ pick: [3 thoughts], softer: [smaller steps] }`; tier *n* is used for rung *n+1*, and the last tier repeats if a climb runs longer. 12 starting points: heavy, overwhelmed, worried, drained, sad, lonely, stuck, behind, not enough, embarrassed, irritated, numb. Adding a starting point, a thought or a tier needs no code change.
- `copy.json`: every string, `begins` (ways to begin), and `sources` (label, link, honest evidence label).

Validated at load with `zod/mini` in `src/growth/ladder/ladder.ts`; unit tests check coverage (12+ points, 4+ tiers, first person, short bubbles, sources present).

## Sources

- Wood, Perunovic & Lee (2009), *Psychological Science*: a few lab experiments; interesting, not settled.
- Gross (1998; 2015): reappraisal, many studies; helps many people, varies by person.
- Lieberman et al. (2007): naming feelings; small lab studies, a gentle effect.

The popular "emotional ladder" is not cited anywhere.

## Notes

- A climb in progress is not persisted; leaving drops it. That keeps the loud sentence off the device by default.
- `src/growth/ladder/screenshots/` holds the 390px screens (light, dark, reduced motion) referenced in the pull request.

## Requests

See `docs/growth/requests/ladder.md`.
