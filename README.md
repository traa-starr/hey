# hey you

a relationship-with-yourself app.

most of us carry one loud inner voice. hey you helps you grow a second one: yours, in your own words.

- **answer it:** catch what your inner voice said, notice how loud it is, and answer it with a way that comes from research, in your own words.
- **about you:** small questions that help you find out what you actually like and think.
- **your book:** everything you keep, written by you, kept privately on your phone.

hey you is a practice space, not therapy. It never asks you to revisit painful memories. There are no accounts, no tracking, and nothing leaves your phone.

## Develop

```sh
npm install
npm run dev        # local app at http://localhost:5173/hey/
npm run check      # typecheck, lint, unit tests
npm run e2e        # end-to-end tests (Playwright)
npm run build      # production build in dist/
```

Content lives in [`content/`](content/README.md). The spec is [`docs/SPEC.md`](docs/SPEC.md) and the design system is [`docs/DESIGN.md`](docs/DESIGN.md).

Pushing to `main` builds and deploys to GitHub Pages through `.github/workflows/deploy.yml` (repository settings → Pages → source: GitHub Actions).
