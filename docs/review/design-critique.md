# Design critique (October 2026)

Every screen at 390px, light and dark, against leading wellbeing apps (Finch, How We Feel, Headspace, Stoic). The bar: adult, calm, and clearly made with care.

## Overall impression

The color system, type pairing, and voice are already strong: it reads as adult and warm, not clinical, not cute. The biggest gap is **identity and craft**. Category leaders feel like an object you hold: rich illustration, screens that flow into each other, a companion with a real personality. hey you still feels like well-styled web pages.

## Usability

| Finding | Severity | Recommendation |
| --- | --- | --- |
| The first screen is one small bubble ("hey you.") and a huge button in a mostly empty page. The most important moment has the least design. | 🔴 Critical | Open on a full sky with dawn large, the name set big, then flow into the chat. |
| In lessons, dawn's face sits beside every bubble, because each step is wrapped in its own element and the "show once per run" rule only looks at direct siblings. Five faces in a column read as noise. | 🟡 Moderate | Show the face once per run of dawn's bubbles, across steps. |
| Every screen change is the same fade. Going deeper (path → lesson) and coming back feel identical, so there's no sense of place. | 🟡 Moderate | Directional transitions: forward slides in, close slides down; tabs crossfade. Same-element transitions for dawn and lesson art. |
| Voice map bubbles can spill past the card edge (the bottom one is cut). | 🟢 Minor | Keep the bubbles inside the card; scale the layout to the card. |
| Practice: the evidence label on each way to answer is squeezed into a right-hand column and wraps awkwardly. | 🟢 Minor | Put the label on its own line as a small tag. |

## Visual hierarchy

- **What draws the eye first**: on home, dawn and the greeting, which is correct. In lessons, it's the repeated faces, which isn't.
- **Reading flow**: clear top to bottom everywhere; one main action per screen holds.
- **Emphasis**: lesson rows and path cards rely on generic line icons (a speaker for "talk to you", a mortarboard for "what you think"). The art carries no meaning, so every path looks equally important and equally generic.

## Consistency

| Element | Issue | Recommendation |
| --- | --- | --- |
| Dark-mode soft tints | coral-soft (#45201f), gold-soft and orange-soft read as brown, the color this redesign set out to remove (home's voice check tile is the worst) | Shift dark tints toward the violet base so they read as dusk, not mud |
| dawn's calm face | the dot eyes with a small flat mouth read as worried or blank at avatar size | A soft resting smile for calm; keep curious and sleepy distinct |
| Path art | line icons in a colored square, while habits have their own glyphs | One illustrated mark per path in the same language as the habit glyphs |
| Next step card | uses dawn as the lesson's art | Use the lesson's path art; dawn stays the companion |

## Accessibility

- **Color contrast**: text passes AA in both themes (axe-checked). Dashed borders on idea chips are decorative; their text carries the meaning.
- **Touch targets**: 44px or more everywhere, entry links 36px (still passes WCAG 2.2 AA at 24px).
- **Text readability**: body 17px with 1.5 line height; quotes in Newsreader at 20px or more. Good.

## What works well

- A distinct, confident palette, with one color per habit carried everywhere: map, glyphs, lessons, catch it.
- The voice check: swipe or tap, no typing, a real answer to "show people patterns they can't see".
- Copy that sounds like a person: short, lowercase, never clinical.
- The new book: the night-sky cover is the most "object-like" screen in the app, and it shows the direction for the rest.

## Priority recommendations

1. **Make it flow**: directional screen transitions and a shared dawn between home and lessons (View Transitions API, reduced motion respected).
2. **Give it an identity**: illustrated path marks, a calmer resting face for dawn, a hero welcome.
3. **Clean up the noise**: one dawn face per run in lessons, dark tints that read as dusk, evidence tags that don't wrap.
