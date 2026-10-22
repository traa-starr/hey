# hey you — design (v3)

## Idea

A warm, confident app for adults, with a companion. sol, a small dawn-light character, makes the app feel alive and carries lessons as conversation. Color does a lot of the work: every voice habit has its own color and glyph, so people recognize their habits at a glance. Text is short and arrives one bubble at a time.

## Color

Tokens live in `src/styles/app.css`. Light and dark follow the phone unless pinned in settings.

| token | light | dark | use |
| --- | --- | --- | --- |
| `--bg` | #f4f1fb | #100c24 | page |
| `--surface` | #ffffff | #1b1636 | cards, bubbles |
| `--raise` | #ece7fa | #262049 | quiet buttons, tracks |
| `--ink` | #1d1736 | #f2eeff | text |
| `--soft` | #574f72 | #b9b1d8 | secondary text |
| `--primary` | #5b3fd9 | #a08cff | main actions, progress |

Habit colors (light / dark): violet #5b3fd9 / #a08cff, pink #c2306f / #ff86bd, coral #c9382a / #ff8a78, gold #946200 / #ffc764, teal #0b7a70 / #4fd6c6, plum #8e3fa8 / #d79bf0, blue #2a62c4 / #8db6ff, orange #b35009 / #ffa766, lime #4d730e / #b6e06a, mint #0e7459 / #6be0bd. Each has a `-soft` tint for backgrounds. In light mode they meet 4.5:1 with white; in dark mode text on them is `--on-primary` (dark).

Skies (home only): dawn peach to lavender, day sky blue, dusk violet to pink to apricot, night navy with stars.

## Your book

The cover is always a night sky (deep violet to plum, a darker spine on the left), in light and dark alike, so its stars use the bright habit colors: gold #ffc764 for words, teal #4fd6c6 for about you, pink #ff86bd for keepers, each with a soft radial glow. Pages, entries and tabs carry the same three colors as a left edge or dot. The shelf uses path and habit colors; unread books are the same color at 22%. Under reduced motion the stars don't twinkle, the newest doesn't burst, and the books don't rise.

## Type

| role | face | use |
| --- | --- | --- |
| display | Bricolage Grotesque (variable, self-hosted, OFL) | titles, card heads, buttons in tiles |
| text | Instrument Sans (self-hosted, OFL) | body, bubbles, controls |
| voice | Newsreader italic (self-hosted, OFL) | quotes: what the inner voice says, and your own words |

Scale (rem): .78 label (uppercase, +.08em) · .9 small · 1.0625 body · 1.1–1.35 card heads · 1.6 screen questions · 2.3–2.55 page titles and greeting.

## sol

- A soft rounded body with a sunrise gradient (#ffd978 → #ffa45e → #ff6f5b), a white highlight, faint cheeks, a glow.
- Moods change only the face: calm, happy, curious, sleepy (at night).
- Idle: breathes (4.5s) and floats (6s); blinks every few seconds. All of it stops under reduced motion.
- Appears on home, beside its chat bubbles (once per run of bubbles), on check-in and breathe. Never on settings or data screens.
- Its name is editable; it can be hidden entirely, and then bubbles stand alone.
- sol is scripted. It never claims feelings or knowledge it doesn't have, and never pretends to be a therapist.

## Shape and space

Radius: 18–20px controls, 22–26px cards, 30px large panels, pill chips. Gutter 18px. Content max width 30rem. Cards sit on soft shadows, never borders, except chips and fields.

## Motion

- One easing, `cubic-bezier(.2,.8,.2,1)`; small springs only for the voice map bubbles.
- Moving between screens uses the View Transitions API. Going deeper (a path, a lesson, your book's pages) slides in from the right, coming back slides away to the right, and tabs cross-fade. The tab bar stays put. Your book opens out of its icon on "you", and a habit's glyph grows into its page. Browsers without view transitions just swap screens; the first screen after opening still rises 10px and fades in. Taps press to 97%.
- The top bar is clear at the top of a screen and gathers a soft blurred shade as the screen scrolls under it (a scroll-driven animation; solid under reduced motion).
- The voice check card flies off in the direction of the answer (right: that's me, left: not really, up: sometimes). Swiping right or left answers too; "sometimes" is its button.
- Breathing: 4s in, 6s out.
- Under reduced motion: no movement anywhere, including screen transitions; the breathing circle becomes a counted text guide.

## Sound and haptics

Off by default; soft sine/triangle chimes on loudness steps and when something is kept. Haptics (Android) on taps, answers and keeps. Never on arrival or errors.

## Read aloud

A speaker button in the top bar when turned on; reads the screen's main text (`data-say`). Optional automatic reading, device voice and speed.

## Layout rules

- One idea and one main action per screen. sol's bubbles about 30 words at most.
- Home has a sky, one next step, two shortcuts, and a hidden line. Nothing else.
- Every text field has idea chips.
- Icons always come with a text label.
- Nothing revealing shows by default: lines from your book stay hidden until tapped.

## Accessibility

Visible focus (2px primary outline). Touch targets at least 44px. Every control is a real button, link or input. Focus moves to each new step's heading. Charts have text alternatives. Swipes always have buttons.

## Art

Each learning path has its own illustrated mark (`src/ui/art.tsx`): 64×64, 3px round strokes in currentColor on the path's color, at three opacities. A path without art falls back to a plain mark. Brief: `docs/art/path-marks.brief.md`.

## Icon

A white Newsreader italic "y" (as an outline) on a dusk sky, with the sun rising at the bottom edge. Neutral on a shared phone.
