// Read aloud with the device's own voices. Nothing leaves the phone.
import { useEffect, useState } from "react";
import { store } from "../store/store";

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text: string) {
  if (!canSpeak() || !text.trim()) return;
  try {
    const { voice, rate } = store.get().settings;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/_{2,}/g, "blank"));
    u.rate = rate;
    const v = voice ? speechSynthesis.getVoices().find((x) => x.voiceURI === voice) : undefined;
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch {
    // reading aloud is a bonus
  }
}

export function stopSpeaking() {
  try {
    if (canSpeak()) speechSynthesis.cancel();
  } catch {
    // nothing to stop
  }
}

// the main words on screen: everything marked data-say, in order
export function screenText(root: ParentNode = document) {
  return [...root.querySelectorAll("[data-say]")].map((n) => (n.textContent ?? "").trim()).filter(Boolean).join(". ");
}

export const readScreen = () => speak(screenText());

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => (canSpeak() ? speechSynthesis.getVoices() : []));
  useEffect(() => {
    if (!canSpeak()) return;
    const update = () => setVoices(speechSynthesis.getVoices());
    speechSynthesis.addEventListener("voiceschanged", update);
    return () => speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);
  return voices;
}
