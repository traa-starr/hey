// your book: things you've told yourself, and about you. editable, removable, private.
import { motion } from "motion/react";
import { useState } from "react";
import { content } from "../content/load";
import { toSecondPerson } from "../lib/person";
import { shortDate } from "../lib/time";
import { store } from "../store/store";
import type { Entry } from "../store/types";
import { useData } from "../store/useStore";
import { Nav, Screen, TopBar } from "../ui/kit";
import { Settings } from "./Settings";

export function Book() {
  const copy = content().copy;
  const { entries } = useData();
  const [tab, setTab] = useState<"voice" | "about">("voice");
  const [openedAt] = useState(() => Date.now());
  const list = entries.filter((e) => e.kind === tab);
  return (
    <>
      <TopBar />
      <Screen id="book">
        <h1 className="title" data-say>{copy.book.title}</h1>
        <div className="tabs" role="tablist" aria-label={copy.book.title}>
          {(["voice", "about"] as const).map((t) => (
            <button
              key={t} type="button" role="tab" id={`tab-${t}`} aria-controls="book-panel" aria-selected={tab === t}
              tabIndex={tab === t ? 0 : -1} onClick={() => setTab(t)}
              onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const o = t === "voice" ? "about" : "voice"; setTab(o); document.getElementById(`tab-${o}`)?.focus(); } }}
            >
              {t === "voice" ? copy.book.voiceTab : copy.book.aboutTab}
            </button>
          ))}
        </div>
        <div className="entries" role="tabpanel" id="book-panel" aria-labelledby={`tab-${tab}`}>
          {list.length ? list.map((e, n) => <Item key={e.id} e={e} fresh={n === 0 && openedAt - Date.parse(e.at) < 15000} />) : (
            <p className="empty">{tab === "voice" ? copy.book.voiceEmpty : copy.book.aboutEmpty}</p>
          )}
        </div>
        <p className="small">{copy.book.privacy}</p>
        <Settings />
      </Screen>
      <Nav current="book" />
    </>
  );
}

function Item({ e, fresh }: { e: Entry; fresh: boolean }) {
  const copy = content().copy;
  const names = copy.loudness.names;
  const [mode, setMode] = useState<"view" | "edit" | "remove">("view");
  const [text, setText] = useState(e.text);
  const shown = e.kind === "about" ? toSecondPerson(e.text) : e.text;
  const meta = [shortDate(e.at), e.from, e.before && e.after ? `${names[e.before - 1]} → ${names[e.after - 1]}` : ""].filter(Boolean).join(" · ");
  return (
    <motion.div
      className="entry"
      initial={fresh ? { opacity: 0, y: 14, rotate: -0.8 } : false}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {mode === "edit" ? (
        <div className="fieldset">
          <label className="sr" htmlFor={`edit-${e.id}`}>{copy.book.editLabel}</label>
          <textarea id={`edit-${e.id}`} className="field voice" rows={2} value={text} onChange={(x) => setText(x.target.value)} />
          <div className="entry-actions">
            <button className="link" type="button" disabled={!text.trim()} onClick={() => { store.edit(e.id, text); setMode("view"); }}>{copy.book.save}</button>
            <button className="link" type="button" onClick={() => { setText(e.text); setMode("view"); }}>{copy.book.cancel}</button>
          </div>
        </div>
      ) : (
        <>
          <p className={e.said ? "inner-said" : "mine"}>{shown}</p>
          <span className="meta">{meta}</span>
          {mode === "remove" ? (
            <div className="confirm" role="alertdialog" aria-label={copy.book.removeAsk}>
              <p>{copy.book.removeAsk}</p>
              <div className="row-btns">
                <button className="btn" type="button" onClick={() => store.remove(e.id)}>{copy.book.remove}</button>
                <button className="btn quiet" type="button" onClick={() => setMode("view")}>{copy.book.keepIt}</button>
              </div>
            </div>
          ) : (
            <div className="entry-actions">
              <button className="link" type="button" onClick={() => setMode("edit")} aria-label={`${copy.book.edit}: ${shown}`}>{copy.book.edit}</button>
              <button className="link" type="button" onClick={() => setMode("remove")} aria-label={`${copy.book.remove}: ${shown}`}>{copy.book.remove}</button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
