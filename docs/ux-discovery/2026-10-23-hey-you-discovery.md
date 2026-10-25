# hey you: UX discovery

> **No user research yet. Everything in this document is an assumption, not evidence.** Treat it as a working hypothesis to be replaced once real people have used the app.

Draft from the repo docs (MANIFESTO, SPEC, CLAUDE.md, study plan) plus one answer from Mojo. No real user data yet, so everything marked *assumption* needs the first study round (`docs/research/study-plan.md`) to confirm it.

## 1. Problem brief

- **Problem:** Adults with a harsh inner voice already know they're hard on themselves. Being told so doesn't help. They need to feel what being on their own side is like, in their own words.
- **Affected users:** Adults 18+ who sometimes talk to themselves harshly, not in clinical care, often sceptical of wellbeing apps.
- **Current alternatives:** Coping alone, meditation apps, therapy or professional care (confirmed by Mojo).
- **Why they fail (assumption):** Fix-it framing, generic affirmations that can backfire (Wood et al., 2009), streaks and nudges, weak privacy, and nothing for the moment the voice is loud.
- **Scope:** New product (v1), with growth practices layered on.

## 2. Personas

| persona | priority | evidence |
| --- | --- | --- |
| **Quiet Self-Critic**: competent outside, harsh inside; copes alone, has tried a meditation app, wants a line they can believe in a loud moment | **Primary** | assumption, validated by Mojo |
| **Blamed-All-My-Life Newcomer**: sceptical, reads tone before content; one hint of judgment ends the session | Secondary (the safety test) | assumption, needs validation |
| **Therapy-Adjacent Practitioner**: knows CBT, wants a between-sessions tool with sources | Tertiary | assumption, needs validation |

Quote (primary): "I already know I'm hard on myself. Telling me that doesn't help."

## 3. Jobs to be done

For the primary persona.

- **Functional:** When my inner voice is loud, help me say something back that I can actually believe, in a minute or two.
- **Functional:** Help me notice which way my voice is talking, so it stops feeling like one big blur.
- **Emotional:** Leave me lighter than I arrived, and on my own side without being told I wasn't.
- **Emotional:** Let me be unsure or sceptical and still feel welcome.
- **Social:** Let me use this in public or around others without anyone learning anything about me.
- **Social (tertiary):** Let me bring my book to a therapist if I choose to.

## 4. User journey (primary persona)

**Current state (without hey you):**
1. The voice gets loud (after a meeting, late at night).
2. Tries to push it down, distract, or vent.
3. Maybe opens a meditation app: calming, but the voice is still there afterwards.
4. Carries on, a little heavier. Nothing is learned for next time.

**Desired state:**
1. Opens hey you (home, not a form). Gets a welcome and a thank-you first, not a mood question.
2. Catches the sentence or picks "it's loud right now". Sets the loudness.
3. Optional breath. Picks a way to answer. Writes it using tappable ideas, never a blank box.
4. Sets the loudness again and sees it moved. Keeps a kind line, or lets it go.
5. Later, the book shows a star, a shift and a range. No score, no streak.
6. Weeks on, uses a way to answer without the app, in real life.

**Risk points:** the first open (does it feel judging?), the first write (blank box fear), the loud moment itself (too many taps), and the shared-phone glance.

## 5. Success metrics and telemetry plan

The app has no server and no analytics by design, so measurement can't be telemetry. Two layers:

**On-device, shown to the person (their own patterns, never sent):**
- Loudness before and after answering.
- Range: ways to answer tried, habits met.
- Kept lines.

**Outside the app, through the study:**
| question | signal | how |
| --- | --- | --- |
| Clarity | finishes voice check, lesson and answer without help | observed sessions |
| Comfort | any moment of feeling judged or exposed | think-aloud, reactions |
| Value | uses a way or habit name in real life after a week | one-week follow-up |
| Pull | names a reason to return that isn't a reminder | interview |

Do not add engagement metrics (streaks, DAU, session counts). They conflict with "peace over pressure".

## 6. Key insights and design principles

*All assumption until the study runs.*
1. **Show the feeling, don't explain the fault.** The primary persona already knows. The experience of kindness has to land, not the lecture.
2. **Believable beats big.** Lines far from what someone believes backfire, so the "one rung up" and ways-to-answer approach is core, not extra.
3. **A loud moment is a low-attention moment.** Few taps, ideas offered, no blank boxes.
4. **Safe to be seen.** Neutral look, nothing revealing on screen by default.
5. **Sceptics are welcome.** "I don't believe it" gets the same warmth as "it feels lovely".
6. **Return because it feels good,** not because of a nudge.

## 7. Assumptions and risks

| assumption or risk | consequence if wrong | how to test |
| --- | --- | --- |
| The primary persona exists as described and wants this | wrong people, wrong tone | study screener and sessions |
| People will open the app in a loud moment, not only when calm | most features (answer it) go unused | follow-up: where was I when I used it? |
| Scripted dawn feels warm, not childish | adult audience bounces | session reactions |
| No-nudge design gives enough pull | low return | one-week follow-up; if it fails, find a gentle way to invite, not a streak |
| Some lessons may be too long or heavy | drop-off mid-lesson | task 2 in the study |
| Persona 2 and 3 may be one audience with persona 1 | wasted scope | merge if sessions show the same needs |
| Content claims and evidence labels are accurate | trust loss | source check before launch |

## 8. Recommended next steps

1. Run the five-person study from `docs/research/study-plan.md` and capture notes in `docs/research/synthesis-kit.md`.
2. After the study, revisit this doc: replace assumptions with evidence, and decide whether to merge or drop personas 2 and 3.
3. Prioritise the loud-moment path (home → it's loud right now → answer it) for tap count and clarity, since it is the primary persona's core job.
4. Decide, before building anything new, how pull will be tested without nudges.
5. Next skill to try: `ux-superpowers:ux-validate` once there are sessions to review.
