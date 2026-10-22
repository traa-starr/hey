# requests from proof

Proof works without these, except the first.

0. **Required, one line:** `e2e/book.spec.ts:26` expects `"0 of 30 lessons read"`. The science path adds six lessons, so it now reads `"0 of 36 lessons read"`. That file is shared, so it isn't changed here, and that one existing test fails until the integrator updates the number. Everything else in `npm run e2e` passes (23 of 24).

1. **`content/README.md` and `docs/SPEC.md`:** mention the `how-your-mind-works` path, and that a practice's `plugin.ts` can't hold JSX (so proof builds its tile icon with `createElement`).
2. **Tile strings:** proof's tile text lives in `plugin.ts` because that file loads with the app. If the foundation wants tile copy in JSON, `plugin.ts` could read it.
3. **Claim privacy (optional):** proof stores the inner voice's predicted sentence, because the experiment record needs `claim`. It is hidden behind a tap everywhere and never on home. If the person should opt in first, a shared "keep the words" control in `src/ui/` (like answer it's) could be reused; proof would then store only the plan when it's off.
4. **Shared `h2` labels:** a `<label className="h2">` renders lighter than `h1.h2`. Proof styles `.screen label.h2` itself; the feel check's `legend.h2` has the same look and could get the same rule in `app.css`.
5. **Home card and the clock:** the card reads the phone's local hour once per render. If home should re-check at 17:00 without a re-render, that needs a shared timer.
