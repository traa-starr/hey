// you: your voice map, where your habits show up, how loud it's been, and your book.
import * as m from "motion/react-m";
import { content } from "../content/load";
import { format } from "../lib/template";
import { loudness, places, weights } from "../lib/voice";
import { href } from "../router";
import { useData } from "../store/useStore";
import { Icon } from "../ui/icons";
import { HabitGlyph, PageTitle, Screen, Tabs, colorVar } from "../ui/kit";

// bubbles sized by how often each habit shows up; positions are fixed so the map is calm and readable
const SPOTS: [number, number, number][] = [[50, 42, 9.5], [21, 74, 7], [79, 74, 7], [19, 22, 5.6], [81, 22, 5.6], [50, 86, 4.6]];

export function VoiceMap() {
  const c = content();
  const t = c.copy.check;
  const { logs } = useData();
  const ranked = weights(c.habits, logs).slice(0, SPOTS.length);
  if (!ranked.length) {
    return (
      <div className="empty" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <p>{t.mapEmpty}</p>
        <a className="btn" href={href({ name: "check" })}>{t.start}</a>
      </div>
    );
  }
  const top = ranked[0]!.weight || 1;
  return (
    <>
      <div className="map" role="img" aria-label={`${t.mapTitle}: ${ranked.map((r) => r.habit.name).join(", ")}`}>
        {ranked.map(({ habit, weight }, i) => {
          const [x, y, base] = SPOTS[i]!;
          const s = Math.max(5.4, base * (0.75 + 0.25 * (weight / top)));
          return (
            <m.a
              key={habit.id}
              href={href({ name: "habit", id: habit.id })}
              className="blob"
              aria-hidden="true"
              tabIndex={-1}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 260, damping: 16 }}
              style={{ left: `calc(${x}% - ${s / 2}rem)`, top: `calc(${y}% - ${s / 2}rem)`, width: `${s}rem`, height: `${s}rem`, background: colorVar(habit.color), fontSize: `${Math.min(1.05, 0.5 + s / 20)}rem`, textDecoration: "none" }}
            >
              <span>{habit.short}</span>
            </m.a>
          );
        })}
      </div>
      <p className="label">{t.top}</p>
      {ranked.slice(0, 3).map(({ habit, caught }) => (
        <a key={habit.id} className="habit-row" href={href({ name: "habit", id: habit.id })}>
          <HabitGlyph habit={habit} />
          <span style={{ minWidth: 0 }}>
            <b>{habit.name}</b>
            <small>{habit.job}{caught ? ` · ${caught === 1 ? c.copy.you.caughtOnce : format(c.copy.you.caught, { n: caught })}` : ""}</small>
          </span>
        </a>
      ))}
      <a className="btn quiet" href={href({ name: "check" })}>{t.again}</a>
    </>
  );
}

function Places() {
  const c = content();
  const { logs } = useData();
  const rows = places(logs).slice(0, 5);
  if (!rows.length) return <p className="empty">{c.copy.you.whenEmpty}</p>;
  const most = rows[0]!.n;
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar-row" key={r.place}>
          <span>{r.place}</span>
          <span className="track"><span style={{ width: `${(r.n / most) * 100}%` }} /></span>
          <span className="n">{r.n}</span>
        </div>
      ))}
    </div>
  );
}

// a small line chart: loudness 1 to 5, one point per day
function Trend() {
  const c = content();
  const { logs } = useData();
  const pts = loudness(logs);
  if (pts.length < 2) return <p className="empty">{c.copy.you.trendEmpty}</p>;
  const W = 320, H = 130, L = 26, B = 22, T = 8;
  const x = (i: number) => L + (i / (pts.length - 1)) * (W - L - 8);
  const y = (v: number) => T + (1 - (v - 1) / 4) * (H - T - B);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.loud).toFixed(1)}`).join("");
  const names = c.copy.loudness.names;
  const day = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }).toLowerCase();
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${c.copy.you.trend}: ${pts.map((p) => `${day(p.day)} ${names[Math.round(p.loud) - 1]}`).join(", ")}`}>
        {[1, 3, 5].map((v) => (
          <g key={v}>
            <line className="grid" x1={L} x2={W - 4} y1={y(v)} y2={y(v)} />
            <text className="axis" x={0} y={y(v) + 3}>{v}</text>
          </g>
        ))}
        <path className="area" d={`${line}L${x(pts.length - 1)},${y(1)}L${x(0)},${y(1)}Z`} />
        <path className="line" d={line} />
        {pts.map((p, i) => <circle key={p.day} className="pt" cx={x(i)} cy={y(p.loud)} r={i === pts.length - 1 ? 5 : 3.5} />)}
        <text className="axis" x={L} y={H - 4}>{day(pts[0]!.day)}</text>
        <text className="axis" x={W - 4} y={H - 4} textAnchor="end">{day(pts.at(-1)!.day)}</text>
      </svg>
    </div>
  );
}

export function You() {
  const c = content();
  const t = c.copy.you;
  return (
    <>
      <Screen id="you">
        <PageTitle>{t.title}</PageTitle>
        <section className="section" aria-labelledby="map-h">
          <div className="section-head"><h2 id="map-h">{t.map}</h2></div>
          <VoiceMap />
        </section>
        <section className="section" aria-labelledby="when-h">
          <div className="section-head"><h2 id="when-h">{t.when}</h2></div>
          <Places />
        </section>
        <section className="section" aria-labelledby="trend-h">
          <div className="section-head"><h2 id="trend-h">{t.trend}</h2></div>
          <Trend />
        </section>
        <a className="habit-row" href={href({ name: "book" })}>
          <span className="glyph" style={{ background: "var(--primary)" }}>{Icon.book}</span>
          <span><b>{t.book}</b><small>{t.bookSub}</small></span>
        </a>
        <a className="habit-row" href={href({ name: "settings" })}>
          <span className="glyph" style={{ background: "var(--raise)", color: "var(--ink)" }}>{Icon.gear}</span>
          <span><b>{t.settings}</b></span>
        </a>
      </Screen>
      <Tabs current="you" />
    </>
  );
}
