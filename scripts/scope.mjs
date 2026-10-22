// Checks that a growth agent only changed the files it owns (docs/growth/PLAN.md → "who owns what").
// usage: node scripts/scope.mjs <feature>      (compares your branch, plus uncommitted work, to origin/main)
import { execSync } from "node:child_process";

const OWN = {
  ladder: [],
  lines: [],
  warm: [],
  // the proof agent also writes the "how your mind works" path: lesson files plus one entry in index.json
  proof: ["content/index.json", "content/how-your-mind-works/"]
};
const feature = process.argv[2];
if (!feature || !(feature in OWN)) {
  console.error(`usage: node scripts/scope.mjs <${Object.keys(OWN).join("|")}>`);
  process.exit(2);
}
const allowed = [
  `src/growth/${feature}/`,
  `content/growth/${feature}/`,
  `e2e/growth-${feature}.spec.ts`,
  `docs/growth/${feature}.md`,
  `docs/growth/requests/${feature}.md`,
  ...OWN[feature]
];
const sh = (cmd) => execSync(cmd, { encoding: "utf8" }).split("\n").filter(Boolean);
let base = "origin/main";
try {
  base = sh("git merge-base HEAD origin/main")[0] ?? base;
} catch {
  // no origin/main fetched yet: compare with it directly
}
const changed = new Set([
  ...sh(`git diff --name-only ${base}`),
  ...sh("git ls-files --others --exclude-standard")
]);
const outside = [...changed].filter((f) => !allowed.some((a) => (a.endsWith("/") ? f.startsWith(a) : f === a)));
if (outside.length) {
  console.error(`these files are outside what "${feature}" owns:\n  ${outside.join("\n  ")}`);
  console.error(`\nmove the change into your own folder, or describe what you need in docs/growth/requests/${feature}.md`);
  process.exit(1);
}
console.log(`scope ok: ${changed.size} file(s), all owned by "${feature}"`);
