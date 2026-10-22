# the warm room (`warm`)

A self-compassion practice people do, not a definition they read. Tile: `mint`, order 3, in practice. No home card. Plan: `PLAN.md` section 3.

## The flow (`#/grow/warm/visit`)

1. **Feel check** (`FeelCheck`, skippable). 2. **Settling:** the shared breath (two rounds, a text version under reduced motion) and an optional hand on the chest, labelled as one small study (Dreisoerner et al., 2021). 3. **First visit only: build the voice,** 2 to 3 qualities plus an optional name; saved as `warm`/`voice` `{ name, qualities }` and changeable at `#/grow/warm/voice`. 4. **Today's small hard thing,** a few words or a tap, always skippable; held in memory only. 5. **The voice answers,** one bubble per part of self-compassion (kindness, common humanity, mindfulness) in the chosen qualities' tone, then one of the person's own `lines` (read defensively; only lines with `truth` of 60 or more, since far-off lines can backfire, Wood et al., 2009). "another way to say it" re-rolls. 6. **Feel check after** and `Shift`; `saveShift("warm", …)` runs only if both checks happened. 7. **Keep** what the voice said (`warm`/`visit` `{ lines, thing }`), or let it go. What was brought is stored only when "keep what i brought, too" is ticked (off by default).

Other screens: hub (`#/grow/warm`), why this works (`#/grow/warm/why`, eight short bubbles with sources and evidence labels). Book section: the voice and kept visits, each closed until tapped, with a "let go" button.

## Content (`content/growth/warm/`)

- `tile.json`: the tile's title and sub (small, loads with the app).
- `warm.json`: `copy` (all strings), `thingIdeas`, `nameIdeas`, `sources` (id → label and evidence), `why` (pages of `say` plus optional `know { text, source }`), `qualities`.
- A quality is `{ id, label, blurb, kindness[], humanity[], mindfulness[] }`, at least two lines per part (the test requires 3 per quality overall; there are 6). In lines, `{n}` becomes "sam, " when there is a name and nothing when there isn't. Lines stay at 30 words or fewer. To add a quality, add an object; no code change.

## Data

`warm`/`voice`: `{ name: string | null, qualities: string[] }` (the contract). `warm`/`visit`: `{ lines: string[], thing: string | null }`. Both parse with `zod/mini` and bad records are skipped.

## Sources and honest labels

Neff 2003 (the three parts, an established framework); Neff & Germer 2013 (one small randomized trial); Gilbert 2009 (compassion-focused therapy, developing); Breines & Chen 2012 (four lab experiments: self-compassion and motivation to improve); Dreisoerner et al. 2021 (one randomized study, small effect). Please double-check the citations' details before release.

## Checks

`npm run check`, `npm run e2e` (including `e2e/growth-warm.spec.ts` with axe), `npm run scope warm`. Screenshots at 390px: `src/growth/warm/screenshots/`.
