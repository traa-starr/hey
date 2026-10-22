/* hey you — app engine. Content lives in content/; this file only knows how to show it. */
(function () {
  "use strict";

  // ---------- storage (never trusted to work) ----------
  const KEY = "heyyou.v1";
  const KINDS = ["my-words", "what-i-like", "what-i-think"];
  const KIND_NAMES = { "my-words": "my words", "what-i-like": "what i like", "what-i-think": "what i think" };
  const WEIGHTS = [
    { n: 1, name: "feather", size: 12 },
    { n: 2, name: "pebble", size: 18 },
    { n: 3, name: "stone", size: 25 },
    { n: 4, name: "rock", size: 33 },
    { n: 5, name: "boulder", size: 42 }
  ];
  const weightName = (n) => (WEIGHTS.find((w) => w.n === n) || {}).name || "";

  function freshData() {
    return { welcomed: false, name: "", tried: {}, collected: { "my-words": [], "what-i-like": [], "what-i-think": [] } };
  }
  function loadData() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return freshData();
      const d = JSON.parse(raw);
      const base = freshData();
      d.collected = Object.assign(base.collected, d.collected || {});
      d.tried = d.tried || {};
      d.name = d.name || "";
      return d;
    } catch (e) {
      return freshData();
    }
  }
  let data = loadData();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* keeps working in memory */ }
  }
  function addEntry(kind, text, from, meta) {
    const t = String(text || "").trim();
    if (!t || !data.collected[kind]) return;
    data.collected[kind].unshift(Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: t, from: from || "", at: new Date().toISOString() }, meta || {}));
    save();
  }

  // ---------- helpers ----------
  const main = document.getElementById("main");
  const appEl = document.getElementById("app");
  const tabs = document.getElementById("tabs");
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toLowerCase(); } catch (e) { return ""; }
  }
  async function getJSON(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(path);
    return res.json();
  }
  const trimEnd = (s) => String(s || "").trim().replace(/[.!?]+$/, "");
  function finish(s) {
    const t = String(s || "").trim();
    return /[.!?"”]$/.test(t) ? t : t + ".";
  }

  // ---------- content ----------
  let index = null;
  let formulas = [];
  let formulaIntro = "";
  const lessons = {};
  async function loadContent() {
    index = await getJSON("content/index.json");
    const f = await getJSON("content/" + index.formulas);
    formulas = f.formulas;
    formulaIntro = f.intro || "";
    const paths = [index.start].concat(...index.practices.map((p) => p.lessons));
    await Promise.all(paths.map(async (p) => { try { lessons[p] = await getJSON("content/" + p); } catch (e) { /* skip missing */ } }));
  }
  const formulaById = (id) => formulas.find((f) => f.id === id);

  // ---------- view state ----------
  const state = { view: "home", tab: "home", lessonPath: null, i: 0, local: {}, editing: null, confirm: null, formulaId: null, w: null };

  function go(view) {
    state.view = view;
    if (["home", "me", "more"].includes(view)) state.tab = view;
    state.editing = null;
    state.confirm = null;
    render();
    window.scrollTo(0, 0);
  }
  function startLesson(path) {
    if (!lessons[path]) return;
    state.lessonPath = path;
    state.i = 0;
    state.local = {};
    go("lesson");
  }
  function startWeigh(formulaId) {
    state.w = { step: "catch", original: "", before: null, body: [], doing: null, whose: null, formula: formulaId || null, preset: !!formulaId, vals: {}, after: null, kept: false, keepOriginal: false, nudge: false };
    go("weigh");
  }

  // ---------- render ----------
  function render() {
    const full = ["lesson", "weigh", "formula"].includes(state.view);
    appEl.classList.toggle("in-lesson", full);
    tabs.hidden = full;
    tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-current", b.dataset.tab === state.tab ? "page" : "false"));
    const views = { home: renderHome, me: renderMe, more: renderMore, lesson: renderLesson, weigh: renderWeigh, formula: renderFormula };
    main.innerHTML = (views[state.view] || renderHome)();
  }

  function greeting() {
    const h = new Date().getHours();
    const who = data.name ? data.name.toLowerCase() : "you";
    if (h < 5) return `up late, ${who}.`;
    if (h < 12) return `good morning, ${who}.`;
    if (h < 17) return `good afternoon, ${who}.`;
    return `good evening, ${who}.`;
  }

  function weightDots(n, label, scale) {
    const w = WEIGHTS.find((x) => x.n === n);
    if (!w) return "";
    const px = Math.round(w.size * (scale || 1));
    return `<span class="wt" title="${esc(w.name)}"><span class="wt-dot" style="width:${px}px;height:${px}px"></span>${label ? `<span>${esc(w.name)}</span>` : ""}</span>`;
  }

  function renderHome() {
    let html = `<header class="home-top"><h1>hey <span>you</span>.</h1><p class="soft">${esc(greeting())} nothing to do here unless you want to.</p></header>`;
    html += `<button class="next-card" data-action="weigh">
      <span class="label">weigh it</span>
      <span class="title">heard something heavy in there?</span>
      <span>catch what your inner voice said, feel its weight, and reshape it in your own words.</span></button>`;
    html += `<section class="practice"><header><h2>formulas</h2><p class="soft small">${esc(formulaIntro)}</p></header><div class="lessons">`;
    formulas.forEach((f) => {
      html += `<button class="lesson-card" data-action="formula" data-id="${esc(f.id)}">
        <span class="meta"><span class="t">${esc(f.name)}</span><span class="s">${esc(f.frame)}</span></span>
        <span class="tried" aria-hidden="true">›</span></button>`;
    });
    html += `</div></section>`;
    html += `<section class="practice"><header><h2>wants and thoughts</h2><p class="soft small">find out what you actually like and think, outside of everyone else.</p></header><div class="lessons">`;
    index.practices.forEach((p) => {
      p.lessons.forEach((path) => {
        const l = lessons[path];
        if (!l) return;
        html += `<button class="lesson-card" data-action="open" data-path="${esc(path)}">
          <span class="meta"><span class="t">${esc(l.title)}</span><span class="s">${esc(p.name)} · ${esc(l.subtitle)}</span></span>
          <span class="tried">${data.tried[l.id] ? "tried" : esc(l.minutes) + " min"}</span></button>`;
      });
    });
    html += `</div></section>`;
    return html;
  }

  function renderFormula() {
    const f = formulaById(state.formulaId);
    if (!f) return renderHome();
    return `<div class="lesson-bar"><button class="icon-btn" data-action="home" aria-label="back">${backIcon()}</button></div>
      <section class="step">
        <p class="eyebrow">formula</p>
        <h1>${esc(f.name)}</h1>
        <p class="preview">${esc(f.frame)}</p>
        <p>${esc(f.why)}</p>
        <div class="stack-sm">
          <div class="choice line"><span class="note">before</span>${esc(f.example.before)}</div>
          <div class="choice line"><span class="note">after</span>${esc(f.example.after)}</div>
        </div>
        <p class="soft small">how strong the evidence is: ${esc(f.evidence)}${f.source && f.source.url ? ` · <a href="${esc(f.source.url)}" target="_blank" rel="noopener">${esc(f.source.label)}</a>` : f.source ? ` · ${esc(f.source.label)}` : ""}</p>
        <div class="actions"><button class="btn primary" data-action="weigh" data-id="${esc(f.id)}">try it on one of yours</button></div>
      </section>`;
  }

  function renderMe() {
    let html = `<header class="page-top"><h1>me, collected</h1><p class="soft">a picture of you, in your own words. it stays on this phone.</p></header>`;
    KINDS.forEach((k) => {
      const list = data.collected[k];
      html += `<section class="section"><h2>${KIND_NAMES[k]}</h2>`;
      if (!list.length) html += `<p class="empty">nothing here yet. it fills up as you practice.</p>`;
      list.forEach((e) => {
        if (state.editing === e.id) {
          html += `<div class="entry"><label class="soft small" for="edit-${esc(e.id)}">edit</label>
            <input class="input" id="edit-${esc(e.id)}" value="${esc(e.text)}">
            <div class="entry-actions"><button class="btn primary" data-action="save-edit" data-kind="${k}" data-id="${esc(e.id)}">save</button>
            <button class="btn quiet" data-action="cancel-edit">cancel</button></div></div>`;
        } else if (state.confirm === e.id) {
          html += `<div class="entry"><p>${esc(e.text)}</p><p class="soft small">remove this?</p>
            <div class="entry-actions"><button class="btn primary" data-action="remove" data-kind="${k}" data-id="${esc(e.id)}">remove</button>
            <button class="btn quiet" data-action="cancel-edit">keep it</button></div></div>`;
        } else {
          const moved = e.before && e.after ? `<span class="wt-move">${weightDots(e.before, false, 0.45)}<span aria-hidden="true">→</span>${weightDots(e.after, false, 0.45)}<span class="sr">${esc(weightName(e.before))} to ${esc(weightName(e.after))}</span></span>` : "";
          html += `<div class="entry"><p>${esc(e.text)}</p>
            <span class="when">${moved}${esc(fmtDate(e.at))}${e.from ? " · " + esc(e.from) : ""}</span>
            <div class="entry-actions"><button class="link-btn" data-action="edit" data-id="${esc(e.id)}">edit</button>
            <button class="link-btn" data-action="ask-remove" data-id="${esc(e.id)}">remove</button></div></div>`;
        }
      });
      html += `</section>`;
    });
    return html;
  }

  function renderMore() {
    const clearing = state.confirm === "clear-all";
    return `<header class="page-top"><h1>more</h1></header>
      <section class="section"><h2>what should we call you?</h2>
        <div class="field"><label for="name-in">your name, or anything you like</label><input class="input" id="name-in" value="${esc(data.name)}" placeholder="your name" autocomplete="off"></div>
        <div class="actions"><button class="btn quiet" data-action="save-name">save</button></div>
        ${state.local.nameSaved ? `<p class="soft small">saved.</p>` : ""}
      </section>
      <section class="section"><h2>about hey you</h2>
        <p>a place to notice how your inner voice talks, feel the weight of its words, and find new ones that sound like you. every formula comes from published research or a recognized therapy approach, and each one shows its source.</p>
        <div class="stack-sm">
          <p class="promise">there are no right answers.</p>
          <p class="promise">you can skip anything.</p>
          <p class="promise">no streaks, ever. come back whenever you want.</p>
          <p class="promise">this isn't therapy, and you never have to share anything you don't want to.</p>
        </div>
        <div class="actions"><button class="btn quiet" data-action="open" data-path="${esc(index.start)}">replay the welcome</button></div>
      </section>
      <section class="section"><h2>real help, if you ever want it</h2>
        <p class="soft small">hey you isn't crisis support. these are free and confidential. in the us:</p>
        <div class="help-item"><span>988 suicide &amp; crisis lifeline</span><span class="num">call or text 988</span></div>
        <div class="help-item"><span>crisis text line</span><span class="num">text HOME to 741741</span></div>
        <div class="help-item"><span>national domestic violence hotline</span><span class="num">1-800-799-7233</span><span class="soft small">or text START to 88788</span></div>
        <div class="help-item"><span>outside the us</span><a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a></div>
      </section>
      <section class="section"><h2>add to your home screen</h2>
        <p class="soft">on iphone, open this in safari, tap the share button, then "add to home screen." on android, use the browser menu.</p>
      </section>
      <section class="section"><h2>your data</h2>
        <p class="soft">everything stays on this phone. nothing is sent anywhere, and there's no account. sentences you weigh aren't saved unless you choose to keep them.</p>
        ${clearing
          ? `<div class="confirm"><p>clear everything you've collected and start fresh?</p><div class="actions"><button class="btn primary" data-action="clear-all">clear it all</button><button class="btn quiet" data-action="cancel-edit">keep it</button></div></div>`
          : `<div class="actions"><button class="btn quiet" data-action="ask-clear">clear everything</button></div>`}
      </section>`;
  }

  function backIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`;
  }
  function closeIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
  }
  function progressBar(pct) {
    return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="progress"><span style="width:${pct}%"></span></div>`;
  }

  // ---------- weigh it ----------
  const BODY = ["chest", "stomach", "throat", "shoulders", "head", "nowhere specific"];
  const DOING = ["grading me", "warning me", "replaying something", "pushing me", "not sure"];
  const NUDGES = ["always / never", "i'm such a ___", "i should have...", "they probably think...", "why did i..."];

  function weighSteps() {
    return ["catch", "weight", "look"].concat(state.w.preset ? [] : ["formula"]).concat(["make", "reweight", "done"]);
  }

  function scale(selected, action, mark) {
    return `<div class="scale" role="group" aria-label="weight">${WEIGHTS.map((w) => `<button class="scale-btn" data-action="${action}" data-n="${w.n}" aria-pressed="${selected === w.n}">
      <span class="wt-dot" style="width:${w.size}px;height:${w.size}px"></span><span>${w.name}</span>${mark === w.n ? `<span class="was">before</span>` : ""}</button>`).join("")}</div>`;
  }

  // turn second-person self-talk ("you always...") into how a person says it about themselves ("i always...")
  function toFirstPerson(text) {
    let t = " " + String(text || "").trim().toLowerCase() + " ";
    const pairs = [
      [/\bare you\b/g, "am i"], [/\bwere you\b/g, "was i"], [/\byou are\b/g, "i am"], [/\byou were\b/g, "i was"], [/\byou're\b/g, "i'm"], [/\byou've\b/g, "i've"],
      [/\byou'll\b/g, "i'll"], [/\byou'd\b/g, "i'd"], [/\byourself\b/g, "myself"], [/\byours\b/g, "mine"], [/\byour\b/g, "my"]
    ];
    pairs.forEach(([re, to]) => { t = t.replace(re, to); });
    t = t.replace(/(^|[.!?,]\s+|\b(?:and|but|so|because|that|if|when|then|do|does|did|can|could|would|should|will|won't|can't|don't|didn't|have|had)\s+|^\s+)you\b/g, (m) => m.replace(/you$/, "i"));
    t = t.replace(/\byou\b/g, "me");
    return t.trim();
  }

  function makeVals(f) {
    const w = state.w;
    const vals = {};
    f.slots.forEach((s) => {
      if (s.fill === "original") vals[s.key] = trimEnd(w.original);
      else if (s.fill === "original-i") vals[s.key] = trimEnd(toFirstPerson(w.original));
      else if (s.fill === "name") vals[s.key] = data.name || "";
      else vals[s.key] = "";
    });
    return vals;
  }
  function weighResult() {
    const f = formulaById(state.w.formula);
    return f ? finish(fillTemplate(f.template, state.w.vals)) : "";
  }

  function renderWeigh() {
    const w = state.w;
    const steps = weighSteps();
    const pos = steps.indexOf(w.step);
    const pct = Math.round(((pos + 1) / steps.length) * 100);
    let body = "";
    const f = formulaById(w.formula);
    switch (w.step) {
      case "catch":
        body = `<p class="eyebrow">weigh it${f ? " · " + esc(f.name) : ""}</p>
          <p class="big">what did your inner voice say?</p>
          <p class="soft">type it the way it sounded. it isn't saved unless you choose to keep it.</p>
          <textarea class="input area" id="w-orig" data-input="orig" rows="3" placeholder="e.g. you always mess things up." autocomplete="off">${esc(w.original)}</textarea>
          <button class="link-btn" data-action="nudge">${w.nudge ? "hide examples" : "need a nudge?"}</button>
          ${w.nudge ? `<div class="stack-sm"><p class="soft small">heavy self-talk often sounds like:</p><div class="chips">${NUDGES.map((n) => `<span class="chip quiet-chip">${esc(n)}</span>`).join("")}</div></div>` : ""}
          <div class="actions"><button class="btn primary" data-action="w-next" ${w.original.trim() ? "" : "disabled"}>next</button></div>`;
        break;
      case "weight":
        body = `<p class="scene small-scene">${esc(w.original)}</p>
          <p class="big">how heavy does it land?</p>
          ${scale(w.before, "w-before")}
          <div class="part"><span class="part-label">where do you feel it? (optional)</span>
          <div class="chips">${BODY.map((b) => `<button class="chip" data-action="w-body" data-val="${esc(b)}" aria-pressed="${w.body.includes(b)}">${esc(b)}</button>`).join("")}</div></div>
          <div class="actions"><button class="btn primary" data-action="w-next" ${w.before ? "" : "disabled"}>next</button><button class="btn quiet" data-action="w-skip-weight">hard to say</button></div>`;
        break;
      case "look":
        body = `<p class="big">a little curiosity, if you want.</p>
          <div class="part"><span class="part-label">what's this voice doing?</span>
          <div class="chips">${DOING.map((d) => `<button class="chip" data-action="w-doing" data-val="${esc(d)}" aria-pressed="${w.doing === d}">${esc(d)}</button>`).join("")}</div></div>
          <div class="part"><span class="part-label">does it sound like anyone you know?</span>
          <div class="chips">${["yes", "no", "not sure"].map((d) => `<button class="chip" data-action="w-whose" data-val="${d}" aria-pressed="${w.whose === d}">${d}</button>`).join("")}</div></div>
          ${w.whose === "yes" ? `<p class="reply">that's worth noticing. sometimes our inner voice carries someone else's opinion of us, not our own.</p>` : ""}
          ${w.doing && w.doing !== "not sure" ? `<p class="reply">${esc(lookReply(w.doing))}</p>` : ""}
          <div class="actions"><button class="btn primary" data-action="w-next">next</button><button class="btn quiet" data-action="w-next">skip</button></div>`;
        break;
      case "formula":
        body = `<p class="big">pick a formula. you bring the words.</p>
          <div class="stack-sm">${formulas.map((x) => `<button class="choice" data-action="w-formula" data-id="${esc(x.id)}"><b>${esc(x.name)}</b><span class="note">${esc(x.frame)}</span></button>`).join("")}</div>`;
        break;
      case "make": {
        const filled = f.slots.every((s) => (w.vals[s.key] || "").trim());
        body = `<p class="eyebrow">${esc(f.name)}</p>
          <p class="soft small">your inner voice said: "${esc(w.original)}"</p>
          <p class="preview" aria-live="polite">${fillTemplateHTML(f.template, w.vals)}</p>`;
        f.slots.forEach((s) => {
          body += `<div class="part"><span class="part-label">${esc(s.label)}</span>`;
          if (s.chips) body += `<div class="chips">${s.chips.map((c) => `<button class="chip" data-action="w-slot-chip" data-key="${esc(s.key)}" data-val="${esc(c)}" aria-pressed="${w.vals[s.key] === c}">${esc(c)}</button>`).join("")}</div>`;
          else body += `<input class="input" data-input="w-slot" data-key="${esc(s.key)}" value="${esc(w.vals[s.key] || "")}" placeholder="${esc(s.placeholder || "")}" aria-label="${esc(s.label)}" autocomplete="off">`;
          body += `</div>`;
        });
        body += `<p class="soft small">for example: "${esc(f.example.after)}"</p>
          <div class="actions"><button class="btn primary" data-action="w-next" ${filled ? "" : "disabled"}>this is mine</button>
          ${w.preset ? "" : `<button class="btn quiet" data-action="w-change">different formula</button>`}</div>`;
        break;
      }
      case "reweight":
        body = `<p class="scene small-scene">${esc(weighResult())}</p>
          <p class="big">how heavy does this one land?</p>
          ${scale(w.after, "w-after", w.before)}
          <div class="actions"><button class="btn primary" data-action="w-next" ${w.after ? "" : "disabled"}>next</button><button class="btn quiet" data-action="w-skip-after">hard to say</button></div>`;
        break;
      case "done": {
        let msg = "you made your own version. that's the practice.";
        if (w.before && w.after) {
          if (w.after < w.before) msg = "a little lighter. you did that with your own words.";
          else if (w.after === w.before) msg = "still about the same weight, and that's okay. a truer sentence counts, even when it's heavy.";
          else msg = "that one landed harder. that happens. want to try a different formula?";
        }
        body = `<p class="eyebrow">your version</p>
          <p class="huge-ish">${esc(weighResult())}</p>
          ${w.before && w.after ? `<div class="wt-move big-move">${weightDots(w.before, true)}<span aria-hidden="true">→</span>${weightDots(w.after, true)}</div>` : ""}
          <p class="reply">${esc(msg)}</p>
          ${w.kept ? `<p class="soft">kept in my words.</p>` : `<label class="check"><input type="checkbox" data-input="keep-orig" ${w.keepOriginal ? "checked" : ""}> also keep what my inner voice said</label>`}
          <div class="actions">
            ${w.kept ? "" : `<button class="btn primary" data-action="w-keep">keep it</button>`}
            <button class="btn quiet" data-action="w-again">try another formula</button>
            <button class="btn quiet" data-action="home">done</button>
          </div>`;
        break;
      }
    }
    return `<div class="lesson-bar"><button class="icon-btn" data-action="home" aria-label="leave">${closeIcon()}</button>${progressBar(pct)}</div>
      <section class="step" data-step="${esc(w.step)}">${body}</section>`;
  }

  function lookReply(doing) {
    return {
      "grading me": "grading voices often hold a standard you picked up somewhere. you get to decide if it's still yours.",
      "warning me": "warning voices are usually trying to keep you safe. it makes sense that it's loud.",
      "replaying something": "replaying is your mind trying to make sense of something. \"why to what\" can help it land.",
      "pushing me": "pushing voices want something for you. they don't always know a kind way to say it."
    }[doing] || "";
  }

  function weighNext() {
    const steps = weighSteps();
    const i = steps.indexOf(state.w.step);
    if (i < steps.length - 1) state.w.step = steps[i + 1];
    if (state.w.step === "make") state.w.vals = Object.assign(makeVals(formulaById(state.w.formula)), state.w.vals);
    render();
    window.scrollTo(0, 0);
  }

  // ---------- lesson player ----------
  function lesson() { return lessons[state.lessonPath]; }
  function step() { return lesson().steps[state.i]; }

  function renderLesson() {
    const l = lesson();
    const pct = Math.round(((state.i + 1) / l.steps.length) * 100);
    return `<div class="lesson-bar"><button class="icon-btn" data-action="home" aria-label="leave this lesson">${closeIcon()}</button>${progressBar(pct)}</div>
      <section class="step" data-step="${state.i}">${renderStep(step())}</section>`;
  }

  function nextBtn(label) {
    return `<div class="actions"><button class="btn primary" data-action="next">${esc(label || "next")}</button></div>`;
  }

  function renderStep(s) {
    const L = state.local;
    switch (s.type) {
      case "welcome":
        return `<p class="huge">${esc(s.text)}</p>${nextBtn(s.button)}`;
      case "show":
        return `<p class="big">${esc(s.text)}</p>${nextBtn(s.button)}`;
      case "close":
        return `<p class="big">${esc(s.text)}</p>${nextBtn(s.button || "done")}`;
      case "understand":
        return `<div class="stack">${s.lines.map((x) => `<p class="big">${esc(x)}</p>`).join("")}</div>${nextBtn(s.button)}`;
      case "scene": {
        let h = `<p class="scene">${esc(s.scene)}</p><p class="reveal">${esc(s.reveal)}</p>`;
        if (s.prompt && s.options) {
          h += `<p>${esc(s.prompt)}</p><div class="chips">${s.options.map((o, n) => `<button class="chip" data-action="pick" data-n="${n}" aria-pressed="${L.pick === n}">${esc(o)}</button>`).join("")}</div>`;
          if (L.pick !== undefined) h += `<p class="reply">${esc(s.reply)}</p>${nextBtn()}`;
        } else h += nextBtn(s.button);
        return h;
      }
      case "try-on": {
        let h = `<p class="big">${esc(s.prompt)}</p>`;
        if (s.answers) {
          h += `<div class="stack-sm">${s.options.map((o) => `<div class="choice line">${esc(o)}</div>`).join("")}</div>`;
          h += `<p>${esc(s.question)}</p><div class="chips">${s.answers.map((a, n) => `<button class="chip" data-action="pick" data-n="${n}" aria-pressed="${L.pick === n}">${esc(a)}</button>`).join("")}</div>`;
        } else {
          h += `<p class="soft">${esc(s.question)}</p><div class="stack-sm">${s.options.map((o, n) => `<button class="choice" data-action="pick" data-n="${n}" aria-pressed="${L.pick === n}">${esc(o)}</button>`).join("")}</div>`;
        }
        if (L.pick !== undefined) h += `<p class="reply">${esc(s.reply)}</p>${nextBtn()}`;
        return h;
      }
      case "map":
        return `<p class="big">${esc(s.prompt)}</p><div class="stack-sm">${s.items.map((it) => `<div class="map-item"><b>${esc(it.name)}</b><span class="soft">${esc(it.text)}</span></div>`).join("")}</div>${nextBtn(s.button)}`;
      case "promises":
        return `<p class="big">${esc(s.prompt)}</p><div class="stack-sm">${s.items.map((it) => `<p class="promise">${esc(it)}</p>`).join("")}</div>${nextBtn(s.button)}`;
      case "write": {
        const chips = L.chips || [];
        if (L.kept) return `<p class="reply">${s.keep === "name" ? `nice to meet you, ${esc((L.text || "").trim().toLowerCase())}.` : "kept. it's in me, collected."}</p>${nextBtn()}`;
        const text = L.text || "";
        return `<p class="big">${esc(s.prompt)}</p>
          ${s.chips ? `<div class="chips">${s.chips.map((c, n) => `<button class="chip" data-action="chip" data-n="${n}" aria-pressed="${chips.includes(n)}">${esc(c)}</button>`).join("")}</div>` : ""}
          ${s.input ? `<div class="field"><label for="w-in">${esc(s.input.label)}</label><input class="input" id="w-in" data-input="text" value="${esc(text)}" placeholder="${esc(s.input.placeholder || "")}" autocomplete="off"></div>` : ""}
          <div class="actions"><button class="btn primary" data-action="keep-write" ${chips.length || text.trim() ? "" : "disabled"}>${s.keep === "name" ? "that's me" : "keep it"}</button>
          <button class="btn quiet" data-action="next">${esc(s.skip || "skip")}</button></div>`;
      }
      case "build": {
        const vals = L.vals || {};
        const filled = s.parts.every((p) => (vals[p.key] || "").trim());
        if (L.kept) return `<p class="preview">${esc(fillTemplate(s.template, vals))}</p><p class="reply">${esc(s.reply || "kept.")}</p>${nextBtn()}`;
        let h = `<p class="big">${esc(s.prompt)}</p><p class="preview" aria-live="polite">${fillTemplateHTML(s.template, vals)}</p>`;
        s.parts.forEach((p) => {
          h += `<div class="part"><span class="part-label">${esc(p.label)}</span>`;
          if (p.chips) h += `<div class="chips">${p.chips.map((c) => `<button class="chip" data-action="part-chip" data-key="${esc(p.key)}" data-val="${esc(c)}" aria-pressed="${vals[p.key] === c && !(L.custom || {})[p.key]}">${esc(c)}</button>`).join("")}</div>`;
          if (p.input || p.allowCustom) {
            const v = p.input ? vals[p.key] || "" : (L.custom || {})[p.key] ? vals[p.key] : "";
            h += `<input class="input" data-input="part" data-key="${esc(p.key)}" data-custom="${p.allowCustom ? "1" : ""}" value="${esc(v)}" placeholder="${esc(p.placeholder || "or your own")}" aria-label="${esc(p.label)}" autocomplete="off">`;
          }
          h += `</div>`;
        });
        h += `<div class="actions"><button class="btn primary" data-action="keep-build" ${filled ? "" : "disabled"}>keep it</button>
          <button class="btn quiet" data-action="next">skip</button></div>`;
        return h;
      }
      case "pocket": {
        const picked = L.chips || [];
        return `<p class="big">${esc(s.prompt)}</p><div class="chips">${s.phrases.map((c, n) => `<button class="chip" data-action="chip" data-n="${n}" aria-pressed="${picked.includes(n)}">${esc(c)}</button>`).join("")}</div>
          <div class="actions"><button class="btn primary" data-action="keep-pocket">${picked.length ? "keep these" : "next"}</button></div>`;
      }
      case "try": {
        let h = `<p class="big">${esc(s.prompt)}</p><div class="stack-sm">${s.options.map((o, n) => `<button class="choice" data-action="pick" data-n="${n}" aria-pressed="${L.pick === n}">${esc(o)}</button>`).join("")}</div>`;
        if (L.pick !== undefined) h += `<p class="reply">nice. no pressure either way.</p>${nextBtn()}`;
        else h += `<div class="actions"><button class="btn quiet" data-action="next">${esc(s.skip || "not today")}</button></div>`;
        return h;
      }
      case "this-or-that": {
        const at = L.at || 0;
        const picks = L.picks || [];
        if (at >= s.pairs.length) {
          const kept = picks.filter((p) => p);
          return `<p class="big">your picks</p><div class="chips">${kept.map((p) => `<span class="chip">${esc(p)}</span>`).join("") || `<span class="soft">no picks this time, and that's okay.</span>`}</div>${nextBtn()}`;
        }
        const [a, b] = s.pairs[at];
        return `<p class="soft">${esc(s.prompt)}</p><div class="tot"><span class="tot-count">${at + 1} of ${s.pairs.length}</span>
          <div class="tot-pair"><button class="choice" data-action="tot" data-val="a">${esc(a)}</button><button class="choice" data-action="tot" data-val="b">${esc(b)}</button></div>
          <div class="chips">${(s.extras || []).map((x) => `<button class="chip" data-action="tot" data-val="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`;
      }
      default:
        return nextBtn();
    }
  }

  function fillTemplate(t, vals) {
    return t.replace(/\{(\w+)\}/g, (_, k) => (vals[k] || "").trim());
  }
  function fillTemplateHTML(t, vals) {
    return esc(t).replace(/\{(\w+)\}/g, (_, k) => (vals[k] || "").trim() ? esc(vals[k].trim()) : `<span class="slot">___</span>`);
  }

  function nextStep() {
    const l = lesson();
    if (state.i < l.steps.length - 1) {
      state.i += 1;
      state.local = {};
      render();
      window.scrollTo(0, 0);
    } else {
      data.tried[l.id] = new Date().toISOString();
      if (state.lessonPath === index.start) data.welcomed = true;
      save();
      go("home");
    }
  }

  // ---------- events ----------
  main.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-action]");
    if (!t || t.disabled) return;
    const a = t.dataset.action;
    const L = state.local;
    const w = state.w;
    switch (a) {
      case "home": go(state.tab || "home"); break;
      case "open": startLesson(t.dataset.path); break;
      case "formula": state.formulaId = t.dataset.id; go("formula"); break;
      case "weigh": startWeigh(t.dataset.id); break;
      case "next": nextStep(); break;
      case "pick": L.pick = Number(t.dataset.n); render(); break;
      case "chip": {
        const n = Number(t.dataset.n);
        L.chips = L.chips || [];
        L.chips = L.chips.includes(n) ? L.chips.filter((x) => x !== n) : L.chips.concat(n);
        render();
        break;
      }
      case "keep-write": {
        const s = step();
        if (s.keep === "name") { data.name = (L.text || "").trim(); save(); }
        else {
          (L.chips || []).forEach((n) => { if (s.chips[n] !== "not sure yet") addEntry(s.keep, s.chips[n], lesson().title); });
          if ((L.text || "").trim()) addEntry(s.keep, L.text, lesson().title);
        }
        L.kept = true;
        render();
        break;
      }
      case "part-chip": {
        L.vals = L.vals || {};
        L.custom = L.custom || {};
        L.vals[t.dataset.key] = t.dataset.val;
        L.custom[t.dataset.key] = false;
        render();
        break;
      }
      case "keep-build": {
        const s = step();
        addEntry(s.keep, fillTemplate(s.template, L.vals || {}), lesson().title);
        L.kept = true;
        render();
        break;
      }
      case "keep-pocket": {
        const s = step();
        (L.chips || []).forEach((n) => addEntry(s.keep, s.phrases[n], lesson().title));
        nextStep();
        break;
      }
      case "tot": {
        const s = step();
        const at = L.at || 0;
        const [x, y] = s.pairs[at];
        const v = t.dataset.val;
        let pick = "";
        if (v === "a") pick = x;
        else if (v === "b") pick = y;
        else if (v === "both") pick = `${x} and ${y}`;
        L.picks = (L.picks || []).concat(pick);
        if (pick) addEntry(s.keep, pick, lesson().title);
        L.at = at + 1;
        render();
        break;
      }
      // weigh it
      case "nudge": w.nudge = !w.nudge; render(); break;
      case "w-next": weighNext(); break;
      case "w-before": w.before = Number(t.dataset.n); render(); break;
      case "w-after": w.after = Number(t.dataset.n); render(); break;
      case "w-skip-weight": w.before = null; weighNext(); break;
      case "w-skip-after": w.after = null; weighNext(); break;
      case "w-body": w.body = w.body.includes(t.dataset.val) ? w.body.filter((x) => x !== t.dataset.val) : w.body.concat(t.dataset.val); render(); break;
      case "w-doing": w.doing = w.doing === t.dataset.val ? null : t.dataset.val; render(); break;
      case "w-whose": w.whose = w.whose === t.dataset.val ? null : t.dataset.val; render(); break;
      case "w-formula": w.formula = t.dataset.id; w.vals = {}; weighNext(); break;
      case "w-change": w.formula = null; w.vals = {}; w.step = "formula"; render(); break;
      case "w-slot-chip": w.vals[t.dataset.key] = t.dataset.val; render(); break;
      case "w-keep": {
        const f = formulaById(w.formula);
        addEntry("my-words", weighResult(), f ? f.name : "", { before: w.before, after: w.after });
        if (w.keepOriginal && w.original.trim()) addEntry("my-words", `my inner voice said: "${w.original.trim()}"`, "weigh it");
        w.kept = true;
        render();
        break;
      }
      case "w-again":
        Object.assign(w, { step: "formula", preset: false, formula: null, vals: {}, after: null, kept: false });
        render();
        window.scrollTo(0, 0);
        break;
      // me, collected
      case "edit": state.editing = t.dataset.id; state.confirm = null; render(); break;
      case "ask-remove": state.confirm = t.dataset.id; state.editing = null; render(); break;
      case "cancel-edit": state.editing = null; state.confirm = null; render(); break;
      case "save-edit": {
        const input = document.getElementById("edit-" + t.dataset.id);
        const entry = data.collected[t.dataset.kind].find((e) => e.id === t.dataset.id);
        if (entry && input && input.value.trim()) { entry.text = input.value.trim(); save(); }
        state.editing = null;
        render();
        break;
      }
      case "remove": {
        data.collected[t.dataset.kind] = data.collected[t.dataset.kind].filter((e) => e.id !== t.dataset.id);
        save();
        state.confirm = null;
        render();
        break;
      }
      // more
      case "save-name": {
        const input = document.getElementById("name-in");
        data.name = input ? input.value.trim() : data.name;
        save();
        state.local = { nameSaved: true };
        render();
        break;
      }
      case "ask-clear": state.confirm = "clear-all"; render(); break;
      case "clear-all": data = freshData(); data.welcomed = true; save(); state.confirm = null; render(); break;
    }
  });

  // typing updates state without re-rendering (keeps the keyboard open), except live previews
  main.addEventListener("input", (ev) => {
    const el = ev.target;
    const L = state.local;
    const w = state.w;
    const kind = el.dataset.input;
    if (kind === "text") {
      L.text = el.value;
      const btn = main.querySelector('[data-action="keep-write"]');
      if (btn) btn.disabled = !((L.chips || []).length || el.value.trim());
    } else if (kind === "part") {
      L.vals = L.vals || {};
      L.custom = L.custom || {};
      L.vals[el.dataset.key] = el.value;
      if (el.dataset.custom) {
        L.custom[el.dataset.key] = !!el.value;
        main.querySelectorAll(`[data-action="part-chip"][data-key="${el.dataset.key}"]`).forEach((c) => c.setAttribute("aria-pressed", "false"));
      }
      const s = step();
      const prev = main.querySelector(".preview");
      if (prev) prev.innerHTML = fillTemplateHTML(s.template, L.vals);
      const btn = main.querySelector('[data-action="keep-build"]');
      if (btn) btn.disabled = !s.parts.every((p) => (L.vals[p.key] || "").trim());
    } else if (kind === "orig") {
      w.original = el.value;
      const btn = main.querySelector('[data-action="w-next"]');
      if (btn) btn.disabled = !el.value.trim();
    } else if (kind === "w-slot") {
      w.vals[el.dataset.key] = el.value;
      const f = formulaById(w.formula);
      const prev = main.querySelector(".preview");
      if (prev) prev.innerHTML = fillTemplateHTML(f.template, w.vals);
      const btn = main.querySelector('[data-action="w-next"]');
      if (btn) btn.disabled = !f.slots.every((s) => (w.vals[s.key] || "").trim());
    } else if (kind === "keep-orig") {
      w.keepOriginal = el.checked;
    }
  });

  tabs.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-tab]");
    if (b) { state.local = {}; go(b.dataset.tab); }
  });

  // ---------- start ----------
  async function boot() {
    try {
      await loadContent();
    } catch (e) {
      main.innerHTML = `<p class="loading">couldn't load right now. try again in a moment.</p>`;
      return;
    }
    if (!data.welcomed && lessons[index.start]) startLesson(index.start);
    else go("home");
  }
  boot();

  if ("serviceWorker" in navigator) {
    try { navigator.serviceWorker.register("sw.js").catch(() => {}); } catch (e) { /* not available here */ }
  }
})();
