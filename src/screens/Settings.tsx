// settings, real help, and your data, quietly at the bottom of your book.
import { useState, useSyncExternalStore } from "react";
import { content } from "../content/load";
import { canInstall, install, isIos, onInstallChange } from "../lib/install";
import { canSpeak, speak, useVoices } from "../lib/speech";
import { go } from "../router";
import { store } from "../store/store";
import type { Appearance } from "../store/types";
import { useData } from "../store/useStore";
import { format } from "../lib/template";
import { FlowTop, Screen } from "../ui/kit";

export function Settings() {
  const c = content();
  const s = c.copy.settings;
  const data = useData();
  const set = data.settings;
  const voices = useVoices();
  const [clearing, setClearing] = useState(false);
  const [savedName, setSavedName] = useState<string | null>(null);
  const installable = useSyncExternalStore(onInstallChange, canInstall, () => false);

  const exportBook = () => {
    try {
      const blob = new Blob([store.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `hey-you-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      // nothing to do; the book is still here
    }
  };

  return (
    <>
    <FlowTop onClose={() => go({ name: "you" })} title={s.title} />
    <Screen id="settings">
    <section className="settings" aria-label={s.title}>
      {!data.persistent && data.ready ? <p className="note" role="status">{s.storageNote}</p> : null}

      <NameForm key={data.name} initial={data.name} saved={savedName === data.name} onSaved={setSavedName} />

      <div className="set">
        <h3>{s.companionTitle}</h3>
        <label className="small" htmlFor="companion-name">{s.companionName}</label>
        <input id="companion-name" className="field" value={data.companion.name} placeholder={c.copy.app.companionDefault} autoComplete="off"
          onChange={(e) => store.setCompanion({ name: e.target.value })} />
        <Toggle id="companion" label={format(s.companionOn, { companion: data.companion.name || c.copy.app.companionDefault })} checked={data.companion.on} onChange={(v) => store.setCompanion({ on: v })} />
      </div>

      <div className="set">
        <h3>{s.voiceTitle}</h3>
        {canSpeak() ? (
          <>
            <Toggle id="read" label={s.voiceOn} checked={set.readAloud} onChange={(v) => store.setSettings({ readAloud: v })} />
            {set.readAloud ? (
              <>
                <Toggle id="auto" label={s.voiceAuto} checked={set.autoRead} onChange={(v) => store.setSettings({ autoRead: v })} />
                <label className="small" htmlFor="voice">{s.voicePick}</label>
                <select id="voice" className="select" value={set.voice ?? ""} onChange={(e) => store.setSettings({ voice: e.target.value || null })}>
                  <option value="">{s.voiceDefault}</option>
                  {voices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                </select>
                <label className="small" htmlFor="rate">{s.voiceRate}: {set.rate.toFixed(1)}×</label>
                <input id="rate" type="range" min={0.7} max={1.3} step={0.1} value={set.rate} style={{ accentColor: "var(--ink)" }}
                  onChange={(e) => store.setSettings({ rate: Number(e.target.value) })} />
                <button className="btn quiet" type="button" onClick={() => speak(s.voiceSample)}>{s.voiceTest}</button>
              </>
            ) : null}
          </>
        ) : <p className="small">{s.voiceNone}</p>}
      </div>

      <div className="set">
        <h3>{s.soundTitle}</h3>
        <Toggle id="sound" label={s.soundOn} checked={set.sound} onChange={(v) => store.setSettings({ sound: v })} />
        <Toggle id="resurface" label={s.resurface} checked={set.resurface} onChange={(v) => store.setSettings({ resurface: v })} />
      </div>

      <fieldset className="set" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="sr">{s.lookTitle}</legend>
        <h3 aria-hidden="true">{s.lookTitle}</h3>
        <div className="radios">
          {([["time", s.lookTime], ["light", s.lookLight], ["dark", s.lookDark]] as [Appearance, string][]).map(([v, label]) => (
            <label key={v}>
              <input type="radio" name="appearance" value={v} checked={set.appearance === v} onChange={() => store.setSettings({ appearance: v })} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {c.help ? (
        <div className="set">
          <h3>{c.help.title}</h3>
          <p className="small">{c.help.note}</p>
          <div>
            {c.help.lines.map((l) => (
              <div className="help-line" key={l.name}>
                <b>{l.name}</b>
                {l.url ? <a href={l.url} target="_blank" rel="noopener noreferrer"><span>{l.detail}</span></a> : l.href ? <a href={l.href}><span>{l.detail}</span></a> : <span>{l.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="set">
        <h3>{s.aboutTitle}</h3>
        <p className="small">{s.about}</p>
        {c.credits ? (
          <p className="small">
            {s.credits}: {c.credits.items.map((i, n) => (
              <span key={i.name}>{n ? ", " : ""}<a href={i.url} target="_blank" rel="noopener noreferrer">{i.name}</a> ({i.license})</span>
            ))}. {c.credits.note}
          </p>
        ) : null}
        <button className="btn quiet" type="button" onClick={() => { store.setProgress("start/welcome", null); go({ name: "welcome" }); }}>{s.replay}</button>
      </div>

      <div className="set">
        <h3>{s.installTitle}</h3>
        {installable ? <button className="btn quiet" type="button" onClick={install}>{s.installButton}</button> : (
          <p className="small">{isIos() ? s.installIos : `${s.installIos} ${s.installOther}`}</p>
        )}
      </div>

      <div className="set">
        <h3>{s.dataTitle}</h3>
        <p className="small">{s.data}</p>
        <button className="btn quiet" type="button" onClick={exportBook}>{s.export}</button>
        {clearing ? (
          <div className="confirm" role="alertdialog" aria-label={s.clearAsk}>
            <p>{s.clearAsk}</p>
            <div className="row-btns">
              <button className="btn" type="button" autoFocus onClick={() => { store.clearAll(); setClearing(false); }}>{s.clearYes}</button>
              <button className="btn quiet" type="button" onClick={() => setClearing(false)}>{s.clearNo}</button>
            </div>
          </div>
        ) : <button className="btn quiet" type="button" onClick={() => setClearing(true)}>{s.clear}</button>}
      </div>
    </section>
    </Screen>
    </>
  );
}

function NameForm({ initial, saved, onSaved }: { initial: string; saved: boolean; onSaved: (n: string | null) => void }) {
  const s = content().copy.settings;
  const [name, setName] = useState(initial);
  return (
    <div className="set">
      <h3>{s.nameTitle}</h3>
      <form className="inline-row" onSubmit={(e) => { e.preventDefault(); store.setName(name); onSaved(name.trim()); }}>
        <div className="fieldset" style={{ flex: 1 }}>
          <label className="small" htmlFor="name">{s.nameLabel}</label>
          <input id="name" className="field" value={name} autoComplete="off" onChange={(e) => { setName(e.target.value); onSaved(null); }} />
        </div>
        <button className="btn quiet" type="submit">{s.save}</button>
      </form>
      {saved ? <p className="small" role="status">{s.nameSaved}</p> : null}
    </div>
  );
}

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle" htmlFor={`t-${id}`}>
      <span>{label}</span>
      <input id={`t-${id}`} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
