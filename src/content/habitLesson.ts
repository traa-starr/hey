// Every voice habit becomes a lesson, built from habits.json, so adding a habit adds its lesson.
import { format } from "../lib/template";
import type { Copy, Habit, Lesson, Step } from "./schema";

export function habitLesson(h: Habit, all: Habit[], source: { label: string; url: string }, copy: Copy): Lesson {
  const t = copy.lesson;
  // two other habits as alternatives for "spot it", always the same ones for this habit
  const at = all.findIndex((x) => x.id === h.id);
  const others = [all[(at + 3) % all.length], all[(at + 6) % all.length]].filter((x): x is Habit => !!x && x.id !== h.id);
  const options = [h, ...others];
  const order = [(at % 3), ((at + 1) % 3), ((at + 2) % 3)].slice(0, options.length).map((i) => options[i % options.length]!);
  const steps: Step[] = [
    { type: "say", text: format(t.habitIntro, { name: h.name }), mood: "curious" },
    { type: "say", text: t.habitSounds },
    ...h.says.map((q): Step => ({ type: "scene", quote: q })),
    {
      type: "ask", text: t.habitFamiliar, options: [
        { label: t.habitOften, reply: t.habitOftenReply },
        { label: t.habitSometimes, reply: t.habitSometimesReply },
        { label: t.habitRarely, reply: t.habitRarelyReply }
      ]
    },
    { type: "say", text: format(t.habitJob, { job: h.job }), mood: "happy" },
    { type: "say", text: format(t.habitMisses, { misses: h.misses }) },
    { type: "say", text: t.habitSpot, mood: "curious" },
    {
      type: "spot", scene: h.spot.scene, quote: h.spot.quote, options: order.map((x) => x.name),
      answer: order.findIndex((x) => x.id === h.id), explain: `${h.name}: ${h.job}`
    },
    { type: "tryon", prompt: t.habitAnswers, lines: h.answers.map((a) => a.line), reply: t.habitAnswersReply },
    { type: "write", prompt: t.habitWrite, template: "{x}", ideas: h.answers.map((a) => a.line), keep: "my-words" },
    { type: "takeaway", text: h.keep, source },
    { type: "experiment", text: h.try }
  ];
  return { id: `habit-${h.id}`, title: format(t.habitTitle, { name: h.name }), subtitle: h.job, minutes: 4, steps };
}
