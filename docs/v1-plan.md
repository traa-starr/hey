# hey you — v1 plan

hey you v1 is a relationship-with-yourself app: a home-screen web app with three short practices (language, desires, and opinions) that help people rebuild who they are by learning how their words shape their mind, what they actually want, and what they actually think. Everything someone discovers is kept privately in their **foundation**, and a small **resource shelf** offers free, trustworthy material to go deeper.

## Three practices, one engine

Every practice runs on the same card flow:

1. **Prompt:** a scene, question, or choice.
2. **Respond:** pick, rewrite, or type, with no right answers.
3. **Keep:** saved to your foundation.
4. **Try it (optional):** one tiny way to use it in real life today.

| Practice | What it builds | Example |
| --- | --- | --- |
| language | How you talk to yourself | A scene shows "I always ruin things," then you rewrite it one notch kinder |
| desires | What you like and want | "Rain or sun?" "What would feel nice in the next hour?" |
| opinions | What you think, and saying it | "Is breakfast for dinner better than breakfast?" Answer "I think… because…" |

First language patterns: "always" and "never" · "I should" · "I am [a label]" vs "I feel" · "I have to" vs "I choose to" · "but" · "they probably think…" · over-apologizing · "it's fine".

Language lessons draw on established, well-documented practice: thinking traps from cognitive behavioral therapy, noticing thoughts from acceptance and commitment therapy, self-compassion research, and studies on naming feelings.

## foundation (formerly me, collected)

A private, growing portrait built from your own answers: **my words**, **what I like**, **what I think** (dated, so you can see opinions change). Stored only on the device. Editable and deletable.

## Resource shelf

| Type | How we can use it |
| --- | --- |
| Public domain (e.g. many US government health materials, Project Gutenberg books) | Embed or adapt, with credit |
| Creative Commons | Usually embed with credit; check for NC (no commercial use) and ND (no edits) |
| Everything else | Describe in our own words and link out |

Each item records: title, source, license, how we can use it, related practice, one line on why it's worth your time.

## How it's built

- Static PWA on GitHub Pages; no server, no accounts, no AI in v1.
- Content in `content/` as data files, separate from code.
- Answers saved on the device only.
- Built with Claude Code, one piece per session, checked at phone size.

## Build steps

- [ ] Write one language lesson together, words only
- [ ] Pick the look from three home-screen directions
- [x] Set up GitHub and the project guide (CLAUDE.md)
- [ ] Build the engine with that one lesson, installable on a phone
- [ ] Try it for a week and adjust
- [ ] Add desires and opinions prompts
- [ ] Build the foundation
- [ ] Add the remaining language patterns
- [ ] Compile the first resource shelf with license tags
- [ ] Share with a few testers with different stories

## Not in v1

The full hub of rooms, customizable space, rehearsal room, help me say this, learning to choose as its own track, redefining love, out-there steps, garden, larger library, and any AI companion. These live in the long-term vision.
