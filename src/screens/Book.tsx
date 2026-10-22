// your book: a cover that grows a star for everything you keep, a shelf of what you've read,
// how answering moved the loudness, and your range. the pages themselves are one tap away.
import * as m from "motion/react-m";
import { useMemo, useState } from "react";
import { content } from "../content/load";
import { byMonth, constellation, hash, metHabits, monthName, shifts, wayUse } from "../lib/book";
import { toSecondPerson } from "../lib/person";
import { format } from "../lib/template";
import { shortDate } from "../lib/time";
import { go, href } from "../router";
import { store } from "../store/store";
import type { Entry, Kind } from "../store/types";
import { useData } from "../store/useStore";
import { Icon } from "../ui/icons";
import { FlowTop, HabitGlyph, Screen, colorVar } from "../ui/kit";

const KINDS: Kind[] = ["voice", "about", "keeper"];
// the cover is always a night sky, so its stars use the bright colors in light mode too
const STAR: Record<Kind, string> = { voice: "#ffc764", about: "#4fd6c6", keeper: "#ff86bd" };
const TINT: Record<Kind, string> = { voice: "var(--gold)", about: "var(--teal)", keeper: "var(--pink)" };
// a star kept this recently lands with a small burst when the book opens
const FRESH_MS = 20000;

const W = 320, H = 210;
// faint dust, so even a new book looks like a night sky
const DUST = Array.from({ length: 34 }, (_, i) => {
  const h = hash(`dust${i}`);
  return { x: h % W, y: (h >>> 9) % H, r: 0.5 + ((h >>> 18) % 3) * 0.3 };
});

const tabName = (k: Kind) => {
  const t = content().copy.book;
  return k === "voice" ? t.voiceTab : k === "about" ? t.aboutTab : t.keepTab;
};

export function Book({ tab }: { tab?: Kind }) {
  return tab ? <Pages tab={tab} /> : <Cover />;
}

function Cover() {
  const c = content();
  const t = c.copy.book;
  const { entries } = useData();
  const [openedAt] = useState(() => Date.now());
  const count = (k: Kind) => entries.filter((e) => e.kind === k).length;
  return (
    <>
      <FlowTop onClose={() => go({ name: "you" })} />
      <Screen id="book">
        <Sky entries={entries} openedAt={openedAt} />
        <section className="section" aria-labelledby="pages-h">
          <div className="section-head"><h2 id="pages-h">{t.pages}</h2></div>
          <div className="grid3">
            {KINDS.map((k) => (
              <a key={k} className="page-tile" href={href({ name: "book", tab: k })} style={{ ["--k" as string]: TINT[k] }} aria-label={`${tabName(k)}: ${count(k)}`}>
                <i aria-hidden="true" />
                <b>{count(k)}</b>
                <span>{tabName(k)}</span>
              </a>
            ))}
          </div>
        </section>
        <Shelf />
        <Moved entries={entries} />
        <Range entries={entries} />
        <p className="small">{t.privacy}</p>
      </Screen>
    </>
  );
}

function Sky({ entries, openedAt }: { entries: Entry[]; openedAt: number }) {
  const t = content().copy.book;
  const { name } = useData();
  const stars = useMemo(() => constellation(entries, W, H), [entries]);
  const newest = stars.at(-1);
  const fresh = newest && openedAt - Date.parse(newest.at) < FRESH_MS ? newest.id : null;
  const first = entries.reduce<string | null>((a, e) => (!a || e.at < a ? e.at : a), null);
  const label = !entries.length ? t.skyEmpty : entries.length === 1 ? t.skyOne : format(t.sky, { n: entries.length });
  return (
    <section className="cover" aria-labelledby="cover-h">
      <div>
        <h1 id="cover-h">{t.title}</h1>
        {name ? <p className="by">{format(t.by, { name: name.toLowerCase() })}</p> : null}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <defs>
          {KINDS.map((k) => (
            <radialGradient key={k} id={`glow-${k}`}>
              <stop offset="0" stopColor={STAR[k]} stopOpacity=".5" />
              <stop offset="1" stopColor={STAR[k]} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        {DUST.map((d, i) => <circle key={i} className="dust" cx={d.x} cy={d.y} r={d.r} />)}
        {stars.map((s) => {
          const to = s.link === null ? null : stars[s.link]!;
          return to ? <line key={`l${s.id}`} className="link" x1={to.x} y1={to.y} x2={s.x} y2={s.y} /> : null;
        })}
        {stars.map((s, i) => (
          <g key={s.id} transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`} className={s.id === fresh ? "star fresh" : "star"}>
            <circle r={s.r * 4} fill={`url(#glow-${s.kind})`} />
            <circle className={i % 4 === 1 ? "core tw" : "core"} r={s.r} fill={STAR[s.kind]} style={{ animationDelay: `${(hash(s.id) % 40) / 10}s` }} />
            {s.id === fresh ? <circle className="burst" r={s.r * 4} stroke={STAR[s.kind]} /> : null}
          </g>
        ))}
        {!stars.length ? <circle className="seed" cx={W / 2} cy={H / 2} r={2.6} /> : null}
      </svg>
      <p className="cover-foot">{first ? format(t.since, { date: monthName(first.slice(0, 7)) }) : t.coverEmpty}</p>
    </section>
  );
}

// every lesson is a book on the shelf; read ones stand in their color, the rest leave room
function Shelf() {
  const c = content();
  const t = c.copy.book;
  const { done } = useData();
  const total = c.paths.reduce((n, p) => n + p.items.length, 0);
  const read = c.paths.reduce((n, p) => n + p.items.filter((it) => done[it.key]).length, 0);
  let order = 0;
  return (
    <section className="section" aria-labelledby="shelf-h">
      <div className="section-head"><h2 id="shelf-h">{t.shelf}</h2><span className="small">{format(t.shelfNote, { n: read, total })}</span></div>
      <div className="shelf">
        <div className="shelf-rows">
          {c.paths.map((p) => (
            <a
              key={p.id} className="shelf-set" href={href({ name: "path", id: p.id })}
              aria-label={format(t.shelfSet, { name: p.name, n: p.items.filter((it) => done[it.key]).length, total: p.items.length })}
            >
              {p.items.map((it) => {
                const h = hash(it.key);
                const isRead = !!done[it.key];
                return (
                  <span
                    key={it.key} className={isRead ? "spine read" : "spine"}
                    style={{
                      height: `${2.7 + (h % 7) * 0.2}rem`, width: `${0.8 + ((h >>> 4) % 3) * 0.12}rem`,
                      ["--c" as string]: colorVar(it.habit?.color ?? p.color),
                      ["--d" as string]: `${isRead ? order++ * 60 : 0}ms`
                    }}
                  />
                );
              })}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// how loud it was before and after each answer: a line from one to the other
function Moved({ entries }: { entries: Entry[] }) {
  const t = content().copy.book;
  const names = content().copy.loudness.names;
  const list = shifts(entries);
  if (!list.length) return null;
  const MW = 320, MH = 156, T = 30, B = 22;
  const gap = Math.min(34, (MW - 40) / Math.max(list.length - 1, 1));
  const x = (i: number) => MW / 2 + (i - (list.length - 1) / 2) * gap;
  const y = (v: number) => T + (1 - (v - 1) / 4) * (MH - T - B);
  return (
    <section className="section" aria-labelledby="moved-h">
      <div className="section-head"><h2 id="moved-h">{t.moved}</h2></div>
      <div className="chart moved">
        <svg
          viewBox={`0 0 ${MW} ${MH}`} role="img"
          aria-label={`${t.moved}: ${list.map((s) => format(t.movedItem, { date: shortDate(s.at), before: names[s.before - 1]!, after: names[s.after - 1]! })).join("; ")}`}
        >
          {[1, 2, 3, 4, 5].map((v) => <line key={v} className="grid" x1={4} x2={MW - 4} y1={y(v)} y2={y(v)} />)}
          <text className="axis" x={4} y={y(5) - 14}>{names[4]}</text>
          <text className="axis" x={4} y={y(1) + 16}>{names[0]}</text>
          {list.map((s, i) => (
            <g key={s.id}>
              {s.before !== s.after ? <line className="stem" x1={x(i)} x2={x(i)} y1={y(s.before)} y2={y(s.after)} /> : null}
              <circle className="was" cx={x(i)} cy={y(s.before)} r={5} />
              <circle className="now" cx={x(i)} cy={y(s.after)} r={5.5} />
            </g>
          ))}
        </svg>
      </div>
      <p className="small">{t.movedNote}</p>
    </section>
  );
}

// more ways to answer, more habits met: range, never a score
function Range({ entries }: { entries: Entry[] }) {
  const c = content();
  const t = c.copy.book;
  const { done, logs } = useData();
  const use = wayUse(c.formulas, entries);
  const met = metHabits(c.habits, done, logs);
  return (
    <section className="section" aria-labelledby="range-h">
      <div className="section-head"><h2 id="range-h">{t.range}</h2></div>
      <div className="card">
        <h3 className="label">{t.ways}</h3>
        <div className="chips">
          {c.formulas.map((f) => {
            const n = use[f.id] ?? 0;
            return (
              <a
                key={f.id} className={n ? "way-chip used" : "way-chip"} href={href({ name: "way", id: f.id })}
                aria-label={format(n > 1 ? t.wayTimes : n ? t.wayOnce : t.wayNew, { name: f.name, n })}
              >
                {f.name}{n ? <span aria-hidden="true">{n}</span> : null}
              </a>
            );
          })}
        </div>
        <h3 className="label">{t.habits}</h3>
        <div className="met">
          {c.habits.map((h) => (
            <a key={h.id} className={met.has(h.id) ? "on" : undefined} href={href({ name: "habit", id: h.id })} aria-label={format(met.has(h.id) ? t.habitMet : t.habitNew, { name: h.name })}>
              <HabitGlyph habit={h} size="sm" />
            </a>
          ))}
        </div>
        <p className="small">{t.rangeNote}</p>
      </div>
    </section>
  );
}

function Pages({ tab }: { tab: Kind }) {
  const copy = content().copy;
  const { entries } = useData();
  const [openedAt] = useState(() => Date.now());
  const groups = byMonth(entries.filter((e) => e.kind === tab));
  const newest = groups[0]?.items[0];
  return (
    <>
      <FlowTop onClose={() => go({ name: "book" })} title={copy.book.title} />
      <Screen id="book-pages">
        <h2 className="sr">{copy.book.pages}</h2>
        <div className="tabs-row" role="tablist" aria-label={copy.book.pages}>
          {KINDS.map((k) => (
            <button
              key={k} type="button" role="tab" id={`tab-${k}`} aria-controls="book-panel" aria-selected={tab === k}
              tabIndex={tab === k ? 0 : -1} onClick={() => go({ name: "book", tab: k }, true)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const o = KINDS[(KINDS.indexOf(k) + (e.key === "ArrowRight" ? 1 : KINDS.length - 1)) % KINDS.length]!;
                go({ name: "book", tab: o }, true);
                document.getElementById(`tab-${o}`)?.focus();
              }}
            >
              <i aria-hidden="true" style={{ background: TINT[k] }} />{tabName(k)}
            </button>
          ))}
        </div>
        <div className="entries" role="tabpanel" id="book-panel" tabIndex={-1} aria-labelledby={`tab-${tab}`}>
          {groups.length ? groups.map((g) => (
            <div key={g.month} className="month">
              <h3 className="label">{monthName(g.month)}</h3>
              {g.items.map((e) => <Item key={e.id} e={e} fresh={e === newest && openedAt - Date.parse(e.at) < FRESH_MS} />)}
            </div>
          )) : (
            <p className="empty">{tab === "voice" ? copy.book.voiceEmpty : tab === "about" ? copy.book.aboutEmpty : copy.book.keepEmpty}</p>
          )}
        </div>
        <p className="small">{copy.book.privacy}</p>
      </Screen>
    </>
  );
}

function Item({ e, fresh }: { e: Entry; fresh: boolean }) {
  const copy = content().copy;
  const names = copy.loudness.names;
  const [mode, setMode] = useState<"view" | "open" | "edit" | "remove">("view");
  const [text, setText] = useState(e.text);
  const shown = e.kind === "about" ? toSecondPerson(e.text) : e.text;
  const meta = [shortDate(e.at), e.from, e.before && e.after ? `${names[e.before - 1]} → ${names[e.after - 1]}` : ""].filter(Boolean).join(" · ");
  return (
    <m.div
      className="entry"
      style={{ ["--k" as string]: TINT[e.kind] }}
      initial={fresh ? { opacity: 0, y: 14, rotate: -0.8 } : false}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {mode === "edit" ? (
        <div className="fieldset">
          <label className="sr" htmlFor={`edit-${e.id}`}>{copy.book.editLabel}</label>
          <textarea id={`edit-${e.id}`} className="field voice" rows={2} value={text} autoFocus onChange={(x) => setText(x.target.value)} />
          <div className="entry-actions">
            <button className="link" type="button" disabled={!text.trim()} onClick={() => { store.edit(e.id, text); setMode("view"); }}>{copy.book.save}</button>
            <button className="link" type="button" onClick={() => { setText(e.text); setMode("view"); }}>{copy.book.cancel}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="entry-head">
            <p className={e.said ? "inner-said" : "mine"}>{shown}</p>
            <button
              className="ibtn" type="button" aria-expanded={mode !== "view"} aria-label={`${copy.book.options}: ${shown}`}
              onClick={() => setMode(mode === "view" ? "open" : "view")}
            >{Icon.more}</button>
          </div>
          <span className="meta">{meta}</span>
          {mode === "remove" ? (
            <div className="confirm" role="alertdialog" aria-label={copy.book.removeAsk}>
              <p>{copy.book.removeAsk}</p>
              <div className="row-btns">
                <button className="btn" type="button" autoFocus onClick={() => { store.remove(e.id); document.getElementById("book-panel")?.focus(); }}>{copy.book.remove}</button>
                <button className="btn quiet" type="button" onClick={() => setMode("view")}>{copy.book.keepIt}</button>
              </div>
            </div>
          ) : mode === "open" ? (
            <div className="entry-actions">
              <button className="link" type="button" onClick={() => setMode("edit")} aria-label={`${copy.book.edit}: ${shown}`}>{copy.book.edit}</button>
              <button className="link" type="button" onClick={() => setMode("remove")} aria-label={`${copy.book.remove}: ${shown}`}>{copy.book.remove}</button>
            </div>
          ) : null}
        </>
      )}
    </m.div>
  );
}
