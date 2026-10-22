/* hey you — app engine. Content lives in content/; this file only knows how to show it. */
(function () {
  "use strict";

  // ---------- storage (never trusted to work) ----------
  const KEY = "heyyou.v1";
  const KINDS = ["my-words", "what-i-like", "what-i-think"];
  const KIND_NAMES = { "my-words": "my words", "what-i-like": "what i like", "what-i-think": "what i think" };

  function freshData() {
    return { welcomed: false, tried: {}, collected: { "my-words": [], "what-i-like": [], "what-i-think": [] } };
  }
  function loadData() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return freshData();
      const d = JSON.parse(raw);
      const base = freshData();
      d.collected = Object.assign(base.collected, d.collected || {});
      d.tried = d.tried || {};
      return d;
    } catch (e) {
      return freshData();
    }
  }
  let data = loadData();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* keeps working in memory */ }
  }
  function addEntry(kind, text, from) {
    const t = String(text || "").trim();
    if (!t || !data.collected[kind]) return;
    data.collected[kind].unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: t, from: from || "", at: new Date().toISOString() });
    save();
  }

  // ---------- helpers ----------
  const main = document.getElementById("main");
  const appEl = document.getElementById("app");
  const tabs = document.getElementById("tabs");
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toLowerCase(); } catch (e) { return ""; }
  }
  async function getJSON(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(path);
    return res.json();
  }

  // ---------- content ----------
  let index = null;
  const lessons = {}; // path -> lesson
  async function loadContent() {
    index = await getJSON("content/index.json");
    const paths = [index.start].concat(...index.practices.map((p) => p.lessons));
    await Promise.all(paths.map(async (p) => { try { lessons[p] = await getJSON("content/" + p); } catch (e) { /* skip missing */ } }));
  }

  // ---------- view state ----------
  const state = { view: "home", lessonPath: null, i: 0, local: {}, editing: null, confirm: null };

  function go(view) {
    state.view = view;
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

  // ---------- render ----------
  function render() {
    const inLesson = state.view === "lesson";
    appEl.classList.toggle("in-lesson", inLesson);
    tabs.hidden = inLesson;
    tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-current", b.dataset.tab === state.view ? "page" : "false"));
    if (state.view === "home") main.innerHTML = renderHome();
    else if (state.view === "me") main.innerHTML = renderMe();
    else if (state.view === "more") main.innerHTML = renderMore();
    else if (inLesson) main.innerHTML = renderLesson();
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return "up late with you.";
    if (h < 12) return "good morning, you.";
    if (h < 17) return "good afternoon, you.";
    return "good evening, you.";
  }

  function nextUp() {
    const order = [];
    const max = Math.max(...index.practices.map((p) => p.lessons.length));
    for (let n = 0; n < max; n++) index.practices.forEach((p) => { if (p.lessons[n]) order.push(p.lessons[n]); });
    return order.find((p) => lessons[p] && !data.tried[lessons[p].id]);
  }

  function renderHome() {
    const next = nextUp();
    const nextL = next && lessons[next];
    let html = `<header class="home-top"><h1>hey <span>you</span>.</h1><p class="soft">${esc(greeting())} nothing to do here unless you want to.</p></header>`;
    if (nextL) {
      html += `<button class="next-card" data-action="open" data-path="${esc(next)}">
        <span class="label">something small, if you'd like · about ${esc(nextL.minutes)} min</span>
        <span class="title">${esc(nextL.title)}</span>
        <span>${esc(nextL.subtitle)}</span></button>`;
    } else {
      html += `<p class="empty">you've tried everything here so far. revisit any tool below, anytime.</p>`;
    }
    index.practices.forEach((p) => {
      html += `<section class="practice"><header><h2>${esc(p.name)}</h2><p class="soft small">${esc(p.blurb)}</p></header><div class="lessons">`;
      p.lessons.forEach((path) => {
        const l = lessons[path];
        if (!l) return;
        html += `<button class="lesson-card" data-action="open" data-path="${esc(path)}">
          <span class="meta"><span class="t">${esc(l.title)}</span><span class="s">${esc(l.subtitle)}</span></span>
          <span class="tried">${data.tried[l.id] ? "tried" : esc(l.minutes) + " min"}</span></button>`;
      });
      html += `</div></section>`;
    });
    return html;
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
          html += `<div class="entry"><p>${esc(e.text)}</p>
            <span class="when">${esc(fmtDate(e.at))}${e.from ? " · " + esc(e.from) : ""}</span>
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
      <section class="section"><h2>about hey you</h2>
        <p>a place to see how your words work, find out what you want and think, and collect more of you along the way.</p>
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
        <p class="soft">everything stays on this phone. nothing is sent anywhere, and there's no account.</p>
        ${clearing
          ? `<div class="confirm"><p>clear everything you've collected and start fresh?</p><div class="actions"><button class="btn primary" data-action="clear-all">clear it all</button><button class="btn quiet" data-action="cancel-edit">keep it</button></div></div>`
          : `<div class="actions"><button class="btn quiet" data-action="ask-clear">clear everything</button></div>`}
      </section>`;
  }

  // ---------- lesson player ----------
  function lesson() { return lessons[state.lessonPath]; }
  function step() { return lesson().steps[state.i]; }

  function renderLesson() {
    const l = lesson();
    const pct = Math.round(((state.i + 1) / l.steps.length) * 100);
    return `<div class="lesson-bar">
        <button class="icon-btn" data-action="exit" aria-label="leave this lesson">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="progress"><span style="width:${pct}%"></span></div>
      </div>
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
      case "rewrite": {
        let h = `<p class="eyebrow">${esc(s.context)}</p><p class="scene">${esc(s.original)}</p><p>${esc(s.prompt)}</p>`;
        h += `<div class="stack-sm">${s.options.map((o, n) => `<button class="choice" data-action="pick" data-n="${n}" aria-pressed="${L.pick === n}">${esc(o.text)}${L.pick === n ? `<span class="note">${esc(o.note)}</span>` : ""}</button>`).join("")}</div>`;
        if (L.pick !== undefined) h += `${s.footer ? `<p class="soft">${esc(s.footer)}</p>` : ""}${nextBtn()}`;
        return h;
      }
      case "map":
        return `<p class="big">${esc(s.prompt)}</p><div class="stack-sm">${s.items.map((it) => `<div class="map-item"><b>${esc(it.name)}</b><span class="soft">${esc(it.text)}</span></div>`).join("")}</div>${nextBtn(s.button)}`;
      case "promises":
        return `<p class="big">${esc(s.prompt)}</p><div class="stack-sm">${s.items.map((it) => `<p class="promise">${esc(it)}</p>`).join("")}</div>${nextBtn(s.button)}`;
      case "write": {
        const chips = L.chips || [];
        if (L.kept) return `<p class="reply">kept. it's in me, collected.</p>${nextBtn()}`;
        const text = L.text || "";
        return `<p class="big">${esc(s.prompt)}</p>
          ${s.chips ? `<div class="chips">${s.chips.map((c, n) => `<button class="chip" data-action="chip" data-n="${n}" aria-pressed="${chips.includes(n)}">${esc(c)}</button>`).join("")}</div>` : ""}
          ${s.input ? `<div class="field"><label for="w-in">${esc(s.input.label)}</label><input class="input" id="w-in" data-input="text" value="${esc(text)}" placeholder="${esc(s.input.placeholder || "")}" autocomplete="off"></div>` : ""}
          <div class="actions"><button class="btn primary" data-action="keep-write" ${chips.length || text.trim() ? "" : "disabled"}>keep it</button>
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
    switch (a) {
      case "open": startLesson(t.dataset.path); break;
      case "exit": go("home"); break;
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
        (L.chips || []).forEach((n) => { if (s.chips[n] !== "not sure yet") addEntry(s.keep, s.chips[n], lesson().title); });
        if ((L.text || "").trim()) addEntry(s.keep, L.text, lesson().title);
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
      case "ask-clear": state.confirm = "clear-all"; render(); break;
      case "clear-all": data = freshData(); data.welcomed = true; save(); state.confirm = null; render(); break;
    }
  });

  // typing updates state without re-rendering (keeps the keyboard open), except the live preview
  main.addEventListener("input", (ev) => {
    const el = ev.target;
    const L = state.local;
    if (el.dataset.input === "text") {
      L.text = el.value;
      const btn = main.querySelector('[data-action="keep-write"]');
      if (btn) btn.disabled = !((L.chips || []).length || el.value.trim());
    } else if (el.dataset.input === "part") {
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
    }
  });

  tabs.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-tab]");
    if (b) go(b.dataset.tab);
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
