// Turning sentences between "you" and "i" without changing what the person meant.

const APOS = "['’]";
const w = (s: string) => new RegExp(`\\b${s.replace(/'/g, APOS)}\\b`, "gi");

// second person self-talk ("you always...") as a person says it about themselves ("i always...")
export function toFirstPerson(text: string): string {
  let t = ` ${text.trim().toLowerCase()} `;
  const pairs: [RegExp, string][] = [
    [w("are you"), "am i"], [w("were you"), "was i"], [w("you are"), "i am"], [w("you were"), "i was"],
    [w("you're"), "i'm"], [w("you've"), "i've"], [w("you'll"), "i'll"], [w("you'd"), "i'd"],
    [w("yourself"), "myself"], [w("yours"), "mine"], [w("your"), "my"]
  ];
  for (const [re, to] of pairs) t = t.replace(re, to);
  // "you" as the subject becomes "i"; anywhere else it becomes "me"
  t = t.replace(
    /(^\s+|[.!?,;]\s+|\b(?:and|but|so|because|that|if|when|then|do|does|did|can|could|would|should|will|won't|can't|don't|didn't|have|had)\s+)you\b/g,
    (m) => m.replace(/you$/, "i")
  );
  t = t.replace(/\byou\b/g, "me");
  return t.trim();
}

// a first-person sentence read back to the person ("i'd pick sunrise" → "you'd pick sunrise")
export function toSecondPerson(text: string): string {
  let t = ` ${text} `;
  const pairs: [RegExp, string][] = [
    [w("am i"), "are you"], [w("was i"), "were you"], [w("i am"), "you are"], [w("i was"), "you were"],
    [w("i'm"), "you're"], [w("i've"), "you've"], [w("i'll"), "you'll"], [w("i'd"), "you'd"],
    [w("myself"), "yourself"], [w("mine"), "yours"], [w("my"), "your"], [w("me"), "you"], [w("i"), "you"]
  ];
  for (const [re, to] of pairs) t = t.replace(re, to);
  return t.trim();
}
