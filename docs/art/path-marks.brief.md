# Art brief: path marks, welcome sky, app icon

**Provenance:** hand-authored SVG. Recraft (the default generator) was unreachable from the build session, so these were drawn by hand to the same brief. If they're regenerated in Recraft later, use this brief and keep the result vector.

## Path marks (`src/ui/art.tsx`)

- **Grid:** 64×64 viewBox, 3px round strokes, round joins, drawn in `currentColor` on the path's color. Cut-outs use `var(--art-bg)`, which is set to the same path color.
- **Language:** the same rounded line-plus-fill language as the habit glyphs, at three opacities (about .3, .55 and 1) for depth. No faces, no characters (sol is the only character), nothing cute.
- **Concepts, one per path:**
  - meet your inner voice: two speech bubbles. The large familiar one sits behind; a smaller, solid one of your own sits in front, with a calm wave inside.
  - your voice habits: overlapping rounds of different sizes, echoing the voice map.
  - talk to you: a hand mirror with a heart inside it.
  - what you like: a sunrise with rays and one small sparkle.
  - what you think: a sprout with two leaves and a small thought above it.
- **Fallback:** a path without art (a new one added in `content/`) shows the plain path mark, so content still needs no code.

## Welcome sky (`WelcomeSky` in `src/screens/Chat.tsx`)

The home sky for the current hour, with sol large and happy (sleepy at night) and the name "hey you" in Bricolage Grotesque. It's decorative (`aria-hidden`), since the chat carries the words.

## App icon (`public/icons/`)

- A dusk sky (#1c1450 → #4a33c4 → #c93f86 → #ff9f7a) with a sun rising at the bottom edge (#ffe9a8 → #ff7a5c) and four faint stars.
- A white lowercase italic "y", its outline taken from Newsreader italic (optical size 72, weight 520) and converted to a path, so it never depends on fonts on the device.
- Everything important sits inside the maskable safe zone (the central 80%).
- PNGs at 512, 192 and 180 are rendered from `icon.svg`.
- Neutral on a shared phone: just a "y" and a sky.
