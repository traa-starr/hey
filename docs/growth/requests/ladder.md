# requests from `ladder`

Nothing is needed to ship. Optional, for the integrator:

1. **Dark project for growth e2e.** `playwright.config.ts` runs the `dark` project only for specs matching `/a11y/`. `e2e/growth-ladder.spec.ts` runs its own axe pass in light, dark (`emulateMedia`) and reduced motion, so nothing is lost, but the dark project could match `/a11y|growth-/` if wanted.
2. **Proof reading the top rung.** Proof can read the latest `ladder`/`climb` record's `top`; `carry: true` marks one the person chose to take into today.
