# hey you — design

## Idea

Two voices. The inner voice is set in a plain grey sans that can fade; the person's own voice is set in a warm serif that stays. Typography is the illustration: there are no characters and no mascots. The page color follows the hour, so the app always feels like the time you're in.

## Tokens

All color comes from CSS custom properties in `src/styles/tokens.css`, computed in OKLCH from one hue `--h` set by the time of day:

| time | hours | hue |
| --- | --- | --- |
| dawn | 5–11 | 50 (peach) |
| day | 11–17 | 215 (clear sky) |
| dusk | 17–21 | 345 (rose) |
| night | 21–5 | 275 (ink blue) |

| token | light | dark |
| --- | --- | --- |
| `--sky` (top of page) | L 93% C .045 | L 27% C .05 |
| `--ground` (page) | L 97.5% C .012 | L 17% C .02 |
| `--paper` (cards) | L 99.2% C .006 | L 22% C .025 |
| `--ink` (text, primary) | L 24% C .03 | L 94% C .015 |
| `--soft` (secondary text) | L 45% C .025 | L 76% C .02 |
| `--faint` (the inner voice at rest) | L 52% C .02 | L 66% C .02 |
| `--hair` (lines) | ink at 13% | ink at 14% |
| `--accent` (italic notes, focus) | L 48% C .13 | L 78% C .11 |

`--soft` and `--accent` meet 4.5:1 on `--ground` and `--paper` at every hue. `--faint` meets 4.5:1 on `--ground` (it carries readable text). Appearance can be pinned to light or dark in settings.

Spacing: 4px base (`--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16, `--s5` 20, `--s6` 24, `--s8` 32, `--s10` 40). Gutter 20px. Content max width 30rem.

Radius: `--r-sm` 12px (chips), `--r-md` 16px (fields), `--r-lg` 22px (cards), pill 999px (buttons, tabs).

## Type

| role | face | use |
| --- | --- | --- |
| your voice | Newsreader (variable, self-hosted, OFL) | answers, greeting, headings, book entries |
| ui and the inner voice | Instrument Sans (self-hosted, OFL) | controls, labels, body, the inner voice |

Scale (rem): 0.8 label (uppercase, +0.06em) · 0.9 small · 1.0625 body · 1.3 · 1.6 · 2.1 ask · 3.0 greeting. Headings `text-wrap: balance`. Body line-height 1.5; serif display 1.1–1.25.

The inner voice on the loudness screen scales from 1.5rem/400 (a whisper) to 3.15rem/650 (all i can hear), and its color moves from `--faint` to `--ink`.

## Motion

- One easing: `cubic-bezier(.2,.7,.2,1)`. Durations: 150ms taps, 350–500ms screen changes, 800ms a page settling into the book.
- No bounce, wobble, or overshoot. Things settle.
- Screens enter with a 6px rise and fade. Pages kept in the book rise and settle from a slight tilt.
- The loudness change is the signature moment: size, weight, and color move together as you drag.
- The calm moment: a circle that expands for 4s and releases for 6s, three times.
- Under `prefers-reduced-motion`: no movement at all; state changes are instant; the breathing circle is replaced by a counted text guide.

## Sound and haptics

- Off by default. Sound is a soft sine-and-triangle chime (pentatonic), quiet, under 1.2s. One note per loudness step, a rising three-note phrase when something is kept. Never on arrival, never on errors.
- Haptics (`navigator.vibrate`, Android) are on by default where supported: 6ms on loudness steps, 20ms when something is kept. iPhone web has none; a Capacitor build adds it later.

## Read aloud

Off by default. When on, a speaker button appears in the top bar; tapping it reads the screen's main text (elements marked `data-say`). "Read each screen automatically" reads on every screen change. Voice is chosen from the device's own voices; speed 0.7–1.3. Uses `speechSynthesis` only (on device, no network).

## Layout rules

- One idea and one main action per screen. Body text 20 words or fewer; longer text sits behind "tell me more".
- Primary action is a full-width ink pill at the bottom of the content; quiet actions are outlined pills beneath it.
- Every text field shows idea chips (dashed) beneath it.
- No icons as decoration. Icons only for close, speaker, and tabs (text labels always present).
- Nothing on screen by default reveals what the app is about beyond "hey you"; the book never opens by itself.

## Accessibility

- Visible focus: 2px `--accent` outline, 3px offset.
- Touch targets 44px minimum.
- Every interactive element is a real button, link, or input.
- Live regions announce kept items and noted answers.
- Color is never the only signal (loudness has words; selected chips change fill and `aria-pressed`).

## Icon

A lowercase serif "y" in ink on a dawn background. Neutral, safe on a shared phone.
