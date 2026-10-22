# Accessibility audit (October 2026)

**Standard:** WCAG 2.2 AA · **Scope:** every screen and flow, including the new screen transitions and sticky top bar.

## How it was checked

- axe (WCAG 2.0 to 2.2 A and AA tags) on every screen in light and dark, in the e2e suite (`e2e/a11y.spec.ts`)
- reflow at 320px wide on 16 routes: horizontal overflow measured, not eyeballed
- text at 200% on 9 key screens
- a keyboard walk through 7 screens, 40 tabs each: is focus visible, and is the focused item ever hidden under the sticky top bar or the floating tabs?
- reduced motion: screenshots of every screen, plus the transition code path, which is skipped entirely
- copy review for names, labels and announcements

## Summary

**Issues found:** 3 · **Critical:** 0 · **Major:** 1 · **Minor:** 2. All fixed in this change.

## Findings

| # | Issue | WCAG | Severity | Fix |
| --- | --- | --- | --- | --- |
| 1 | At 200% text, catch it's habit grid kept two columns, so the names ran off screen and the page scrolled sideways | 1.4.4 Resize text, 1.4.10 Reflow | 🟡 Major | The grid falls back to one column when two don't fit (`auto-fit` with a rem-based minimum) |
| 2 | The new sticky top bar and the floating tabs could partly cover a focused control while tabbing (never fully, so 2.4.11 passed) | 2.4.11 Focus not obscured | 🟢 Minor | `scroll-padding` on the page keeps focused items clear of both bars |
| 3 | The close button's name, "close, nothing is lost", wasn't true everywhere (a voice check in progress is lost) | 2.4.6 Headings and labels, honesty | 🟢 Minor | Renamed to "close" |

## Checked and fine

- **Contrast:** text passes AA in both themes (axe). The new evidence tags are --soft on --raise, about 6.4:1 light and 7:1 dark. The new dark tints sit behind text that keeps 4.5:1 or better.
- **Focus visible:** every focusable item shows the 2px violet ring; text fields show a 2px violet border instead.
- **Keyboard:** all features work with the keyboard. The voice check swipe has buttons, the book tabs use arrow keys, and edit and remove return focus to the entry.
- **Screen changes:** focus moves to each new screen's heading after a transition. New screens skip their own entrance animation while sliding in, so nothing moves twice.
- **Reduced motion:** no slides, no morphs, no twinkle, no burst. The sticky bar becomes solid instead of shading with scroll.
- **Images:** the path art, welcome sky, book stars and shelf are decorative or have text alternatives (the sky, the before-and-after chart and each shelf set are labeled).
- **Touch targets:** 44px or more, except the edit and remove links (36px), which still meet 2.5.8's 24px minimum.
- **Language:** `lang="en"` is set.

## Not covered here

Real screen reader sessions on VoiceOver (iOS) and TalkBack (Android) need a person with a phone. Add them to the next round of user research (see `docs/research/`).
