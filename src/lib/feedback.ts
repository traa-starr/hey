// Feedback that never gets in the way: haptics where supported, soft chimes when turned on.
import { store } from "../store/store";

export function buzz(ms = 6) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // not supported here
  }
}

let ctx: AudioContext | null = null;
export const NOTES = [523.25, 587.33, 659.25, 783.99, 880];

export function chime(notes: number[], gap = 0.11) {
  if (!store.get().settings.sound) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    const c = ctx;
    notes.forEach((f, i) => {
      const t = c.currentTime + i * gap;
      [1, 2.01].forEach((m, j) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = j ? "sine" : "triangle";
        o.frequency.value = f * m;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(j ? 0.01 : 0.045, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        o.connect(g).connect(c.destination);
        o.start(t);
        o.stop(t + 1.2);
      });
    });
  } catch {
    // sound is a bonus
  }
}

export const keptChime = () => chime([NOTES[0]!, NOTES[2]!, NOTES[4]!], 0.12);
export const stepChime = (level: number) => chime([NOTES[level - 1] ?? NOTES[2]!]);
