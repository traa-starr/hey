# your lines (`lines`)

A workshop where people make their own affirmations from a value and one small, real moment, in their own words. Never handed down. Today's line waits on home, hidden until tapped.

## The flow (`#/grow/lines/new`)

1. **Feel check** (first session of the day only; skippable). `saveShift("lines", before, after, recordId)` only when both halves happened.
2. **Value**: one of 19 in content, or "my own word" (with tappable ideas).
3. **Moment**: one small, recent, everyday moment, with tappable ideas per value. "no moment today" is always there.
4. **Shape**: sol offers three lines from content templates. With a name: "sam shows up, like yesterday with mia." Without: "i show up, like…". No second-person self-talk.
5. **Tune**: edit freely. Chips insert at the caret or replace the selection: lead words ("sometimes"), tail words ("in small ways"), words from the person's own book and past lines, and content suggestions.
6. **Try it on**: read aloud on request (on-device), then "how true does this feel?" (0 to 100, unset until moved). Low answers are met warmly and pointed at a smaller line; any line can still be kept.
7. **Keep**: `store.grow("lines", "line", { text, value, moment, truth, own? })`. Tuning later uses `store.regrow`.

Other screens: `#/grow/lines` (gallery, make, why), `#/grow/lines/tune/<id>` ("still true?": starts at try it on, can tune, then `regrow`), `#/grow/lines/why` (three ideas with sources).

## Home and book

- `today.tsx`: one line a day (`dailyIndex`), preferring lines that felt true (truth ≥ 40). Hidden until "show me"; then "still true?" leads to tuning. Priority 30 before noon, 10 after. With no lines: a quiet invitation, no guilt.
- `book.tsx`: the latest four lines as a small gallery. No counts.
- Tile: `plum`, order 2.

## Content (`content/growth/lines/`)

- `tile.json`: practice tile text.
- `lines.json`: `copy` (all screen text), `templates` (`moment`, `plain`, `ownMoment`, `ownPlain`; slots `{who} {verb} {word} {moment} {whoObj}`), `lead`, `tail`, `suggest`, `ownIdeas`, `ownMoments`, `stopwords`, `values` (`id, word, third, first, moments[]`), `why` (text, source label, evidence label).

Adding a value or a template needs no code change. Unit tests check that every value builds clean lines with and without a name, and that bubbles stay short.

## Sources

- Values affirmation: Steele, 1988; Cohen & Sherman, 2014. Solid for short-term effects; varies by person and setting.
- Using one's own name: Kross et al., 2014. Good lab evidence; real-life effects smaller.
- Generic affirmations can backfire: Wood, Perunovic & Lee, 2009. One well-known set of studies, which is why every line is checked against how true it feels.

## For other practices

`lines`/`line` data: `{ text, value, moment: string | null, truth: number, own?: boolean }`. Home never shows a line before a tap. The word bank ignores entries that hold an inner voice's words.

## Requests

See `docs/growth/requests/lines.md`.
