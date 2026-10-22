# Super-prompt: bring hey you up to modern standards

Paste everything below the line into a Claude Code session with this repo open. It's designed to run across several sessions; Claude will stop for your review after each phase.

---

You are the lead product engineer and product designer for **hey you**, a relationship-with-yourself app. The current version works and the content is strong, but it looks and feels like a prototype: almost everything is text, the visuals are minimal, and it's built as a single hand-written JavaScript file. Your job is to turn it into a polished, modern, visual, delightful app that feels like a flagship product, without losing what makes it special.

## 1. Read first (before proposing anything)

- `CLAUDE.md` — scope, core stance, voice, and the six tests every feature must pass. These are non-negotiable.
- `docs/v1-plan.md` and `content/README.md` — the plan and the content format.
- Everything in `content/` — the welcome, the nine formulas in `formulas.json` (each with research sources), and the wants and thoughts lessons.
- `app.js`, `styles.css`, `index.html`, `sw.js` — the current engine. Note every feature it has so nothing is lost.

Summarize back what the app does today, in under 15 bullets, before moving on.

## 2. What "modern" means here

**Quality bar:** apps like Headspace show the level of polish we want: warm illustration, soft rounded shapes, confident color, playful but calm motion, very little text per screen, and audio as a first-class way in. Use that as a bar for craft, not a template. Do not copy Headspace's characters, colors, layouts, or brand. hey you needs its own identity built from its own ideas: **stones, weight, a growing foundation, a voice that's yours, sunrise warmth.**

**Built for attention that wanders (ADHD-friendly by design):**
- One idea and one main action per screen. Aim for 20 words or fewer of body text on any screen; move anything longer behind a "tell me more."
- Show, don't tell: illustrations, icons, color, and motion carry meaning so reading isn't required to understand where you are.
- Instant, satisfying feedback on every tap (motion, and haptics where the platform allows).
- Visible progress inside every flow, and sessions that can finish in under two minutes.
- Pick up where you left off: an unfinished flow resumes, never restarts.
- Optional **read aloud** for every screen using the on-device Web Speech API (no network, no AI), plus an optional soft sound layer, both off by default and easy to toggle.

**Make the core ideas physical and visual:**
- **Weighing a sentence:** the weight scale becomes a tactile moment, for example a stone you press and hold or drag that grows heavier, with gentle physics and haptic ticks, instead of five buttons. Keep an accessible button fallback.
- **The foundation:** an illustrated, growing cairn or wall of stones that feels like a place, with each stone colored by kind (words, wants, thoughts). New stones settle in with a satisfying animation. Milestones get a small celebration. Never streaks, never guilt.
- **Formulas:** each formula gets its own illustration, color, and short animated before → after demo, so you understand it at a glance before reading a word.
- **Onboarding:** the welcome becomes a short animated story (no more than 8 screens, mostly visual) that ends with laying the first stone.
- **A calm moment:** a brief optional breathing or settling animation before weighing something heavy.
- **Home:** feels like arriving somewhere warm. Greeting, the foundation, one main action, one light suggestion. Nothing else competes.

## 3. Non-negotiables (from CLAUDE.md, restated so they survive)

- **Core stance:** exploring, not correcting. Never imply the person is doing something wrong. Never grade. Nothing is a "pattern to fix."
- **Voice:** lowercase app name (**hey you**), warm, short, plain. Avoided words: toxic, broken, fix, should (as an instruction), wrong, disorder, healing journey.
- **Never leave an empty box alone:** every text field offers tappable ideas.
- **Privacy:** no accounts, no analytics, no tracking, no server, no AI. All data stays on the device. The heavy sentence someone types is never stored unless they opt in.
- **Shared-phone safety:** neutral app name and icon, nothing revealing on screen by default, no notifications.
- **Real help** (crisis lines) stays quietly reachable from settings, never stamped on every screen.
- **Claims:** keep every formula's source and honest evidence label. Don't add claims the research doesn't support.
- **Content stays data:** lessons, formulas, ideas, and copy live in `content/` as data files. Adding a formula or lesson must never require code changes.
- **Existing users keep their data:** migrate everything stored under the `heyyou.v1` localStorage key (name, welcomed, tried, and all collected entries with their weights) into the new storage, with a test proving it.
- **Accessibility:** WCAG 2.2 AA contrast, full keyboard and screen-reader support, visible focus, and a complete reduced-motion experience (`prefers-reduced-motion`) where every animation has a calm static equivalent.

## 4. Technical direction

Propose the stack in your spec, but start from this direction and justify any change. **Before installing anything, check each library's official docs for its current stable version and current recommended setup; don't rely on memory.**

- React with TypeScript, built with Vite.
- A token-based design system (CSS variables for color, type, radius, spacing, motion), light and dark themes, with Tailwind CSS if it helps you move faster.
- Motion (the library formerly called Framer Motion) for transitions, gestures, and spring physics.
- Illustration as a custom SVG system you author in code (consistent shapes, stroke, and palette), animated with Motion. If you use any third-party illustration or animation files, record each one's license in `content/credits.json` and only use assets whose license allows it.
- PWA with offline support and an install prompt (for example `vite-plugin-pwa`); keep "add to home screen" working on iPhone.
- On-device storage in IndexedDB (for example via Dexie) with the localStorage migration above.
- Runtime validation of every content file against a schema (for example Zod), so a broken lesson fails loudly in development and gracefully in the app.
- Tests: unit tests (for example Vitest) for the engine, content validation, the first-person converter, and storage migration; end-to-end tests (for example Playwright) for onboarding, the full weigh flow, a lesson, the foundation, and settings.
- Deployment: a GitHub Actions workflow that builds and deploys to GitHub Pages under `/hey/`.
- Plan, but do not build, a later path to the App Store and Play Store (for example Capacitor) so we can add native haptics later.

## 5. How to work (follow this order)

**Phase 0 — interview and spec (no code).**
1. Interview me using the AskUserQuestion tool about taste and priorities: mood words, colors I love and hate, illustration style, how playful vs calm, sound and voice, what to cut. Don't ask anything already answered in `CLAUDE.md` or the content.
2. Build **three distinct visual directions** for the home screen and the weigh flow as static, clickable mockups I can open on my phone, each with its own palette, type, illustration style, and motion idea. Screenshot them at 390 px wide in light and dark and show me.
3. After I choose, write `docs/SPEC.md` (screens, flows, data model, content schema, migration, out of scope, and how we'll verify each part) and `docs/DESIGN.md` (tokens, type scale, motion principles, illustration rules, sound and haptics rules, accessibility rules). Stop and wait for my approval.

**Phases 1–5 — build in small, verifiable steps.** For each phase: enter plan mode, list the files you'll touch, implement, then verify before committing.
1. Foundation of the codebase: new stack, design tokens, content schemas and loading, storage with migration, routing, PWA, and CI deploy. The app should run with the current content and look roughly like today.
2. Design system and core screens: home, tools, foundation, settings, in the chosen direction.
3. The signature moments: the tactile weigh scale, formula illustrations and demos, the growing foundation and stone animations, the new onboarding story.
4. Read aloud, optional sound, haptics where supported, resume-where-you-left-off, and the calm moment.
5. Polish pass: micro-interactions, empty states, loading states, performance, and accessibility.

**Verification every phase:**
- Typecheck, lint, unit tests, and end-to-end tests all pass.
- Screenshots of every changed screen at 390 px wide in light and dark, plus reduced motion, checked against `docs/DESIGN.md`. Fix what's off before calling it done.
- Lighthouse on the built app: aim for 90+ in performance, accessibility, best practices, and PWA checks.
- A fresh-eyes review by a subagent that hasn't seen the work, checking the diff against `docs/SPEC.md`, the six tests in `CLAUDE.md`, and the avoided-words list. Fix real gaps; ignore style nitpicks.
- Work on a branch, commit in small steps with clear messages, and open a pull request per phase with before and after screenshots.

**Stop after each phase** and summarize in a few lines: what changed, screenshots, anything you're unsure about, and what the next phase will do.

## 6. Don't

- Don't add accounts, analytics, ads, AI, notifications, streaks, or anything that nudges through guilt.
- Don't build anything listed as out of scope in `CLAUDE.md` unless I ask.
- Don't rewrite the content's meaning or tone; you may shorten copy for the screen, keeping its voice.
- Don't let the app depend on network access after the first load.
- Don't ship any screen you haven't looked at in a screenshot.

Start with section 1, then Phase 0.
