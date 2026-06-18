import React, { useEffect, useMemo, useRef, useState } from "react";
import { Shield, Save } from "lucide-react";
import { natFlagUrl, teamName } from "./fantamondialeLogic.js";
import { SLOT_POSITIONS, slotRoleLetter, slotRosaRuolo, rosaRoleLetter } from "./formationPositions.js";
import { TEAMS, pitchLinesFor } from "./squadreAnalisiData.js";
import { getProbabileModulo } from "./squadreProbabili.js";
import { loadSquadraFromFile, resetToProbabili, saveSquadraToFile } from "./squadreAnalisiLogic.js";
import { FIXTURES } from "./tournamentData.js";
import {
  getTeamGroupMatches,
  formatOdd,
  diffColor,
  ODDS_META,
  WIN_ODD_GREEN_MAX,
  WIN_ODD_YELLOW_MAX,
} from "./matchOddsLogic.js";

function NatFlag({ nazione }) {
  const src = natFlagUrl(nazione);
  if (!src) return <span className="wm-flag-fallback">{nazione}</span>;
  return <img className="wm-flag" src={src} alt="" loading="lazy" decoding="async" />;
}

export default function SquadreTab({ listonePlayers, playerByKey }) {
  const [selNat, setSelNat] = useState(TEAMS[0]?.nat || "MAR");
  const [store, setStore] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [pickerOpen, setPickerOpen] = useState(null);
  const pitchRef = useRef(null);

  const teamInfo = useMemo(() => TEAMS.find((t) => t.nat === selNat), [selNat]);
  const fixedModulo = getProbabileModulo(selNat);
  const slots = SLOT_POSITIONS[fixedModulo] || SLOT_POSITIONS["4-3-3"];
  const lines = pitchLinesFor(fixedModulo);

  const natPool = useMemo(
    () => listonePlayers.filter((p) => p.nazione === selNat),
    [listonePlayers, selNat]
  );

  const gironeMatches = useMemo(() => {
    if (!teamInfo) return [];
    return getTeamGroupMatches(teamInfo.name, teamInfo.girone, FIXTURES);
  }, [teamInfo]);

  useEffect(() => {
    if (!listonePlayers.length) return;
    let cancelled = false;
    loadSquadraFromFile(selNat, playerByKey, listonePlayers).then((data) => {
      if (!cancelled) {
        setStore(data);
        setPickerOpen(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selNat, listonePlayers, playerByKey]);

  useEffect(() => {
    if (pickerOpen == null) return;
    const close = (e) => {
      if (!pitchRef.current?.contains(e.target)) setPickerOpen(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [pickerOpen]);

  const pkey = (p) => `${p.ruolo}|${p.nome}|${p.nazione}`;

  const setTitolare = (slot, key) => {
    const player = key ? natPool.find((p) => pkey(p) === key) : null;
    setStore((prev) => {
      if (!prev) return prev;
      const titolari = [...prev.titolari];
      titolari[slot] = player;
      return { ...prev, titolari };
    });
    setPickerOpen(null);
  };

  const save = () => {
    if (!store) return;
    saveSquadraToFile(store)
      .then(() => {
        setSavedMsg(`Analisi ${teamName(store.nat)} salvata in squadre_analisi/${store.nat}.json`);
        setTimeout(() => setSavedMsg(""), 3000);
      })
      .catch(() => {
        setSavedMsg("Errore salvataggio. Avvia con npm run dev.");
        setTimeout(() => setSavedMsg(""), 4000);
      });
  };

  if (!store || !teamInfo) {
    return <div className="wm-panel"><div className="wm-sp-empty">Caricamento squadre…</div></div>;
  }

  return (
    <div>
      <div className="wm-panel">
        <div className="wm-ph"><Shield size={15} color="var(--turf)" /> Studio squadre</div>
        <p className="wm-proj-intro">
          Analisi per nazionale: girone, modulo fisso, formazione tipo con nomi dal listone, quote 1X2 Sofascore per ogni partita di girone, note personali. Salvataggio in <code>squadre_analisi/</code>.
        </p>
        <div className="wm-squad-controls">
          <div className="wm-form-ctrl">
            <label>Squadra</label>
            <select value={selNat} onChange={(e) => setSelNat(e.target.value)}>
              {TEAMS.map((t) => (
                <option key={t.nat} value={t.nat}>{t.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="wm-btn"
            onClick={() => {
              setStore((prev) => ({
                ...resetToProbabili(selNat, listonePlayers),
                note: prev?.note || "",
                noteAmichevoli: prev?.noteAmichevoli || "",
              }));
              setPickerOpen(null);
            }}
          >
            Ripristina probabili
          </button>
          <button className="wm-btn turf" onClick={save}><Save size={14} /> Salva analisi</button>
        </div>
        {savedMsg && <div className="wm-note" style={{ color: "var(--turf)", marginBottom: 10 }}>{savedMsg}</div>}

        <div className="wm-squad-head">
          <NatFlag nazione={selNat} />
          <div>
            <div className="wm-squad-title">{teamInfo.name}</div>
            <div className="wm-squad-meta">Girone <b>{teamInfo.girone}</b> · Modulo <b>{fixedModulo}</b></div>
          </div>
        </div>

        <div className="wm-squad-odds-wrap">
          <div className="wm-squad-odds-head">
            <span>Quote 1X2 girone</span>
            <span className="wm-squad-odds-src">
              {ODDS_META.source} · agg. {new Date(ODDS_META.fetchedAt).toLocaleDateString("it-IT")}
            </span>
          </div>
          <div className="wm-squad-odds-grid">
            {gironeMatches.map((m) => (
              <div className="wm-squad-odds-card" key={m.md}>
                <div className="wm-squad-odds-md">
                  <span className="wm-dot" style={{ background: diffColor(m.str), width: 10, height: 10 }} />
                  G{m.md} vs <b>{m.opp}</b>
                  {m.estimated && <span className="wm-squad-odds-est"> stim.</span>}
                </div>
                <div className="wm-squad-odds-row">
                  <span className="lbl">1</span>
                  <span className={m.isHome ? "on" : ""}>{formatOdd(m.isHome ? m.win : m.lose)}</span>
                  <span className="lbl">X</span>
                  <span>{formatOdd(m.draw)}</span>
                  <span className="lbl">2</span>
                  <span className={!m.isHome ? "on" : ""}>{formatOdd(!m.isHome ? m.win : m.lose)}</span>
                </div>
                <div className="wm-squad-odds-fix">
                  {m.isHome ? teamInfo.name : m.opp} – {m.isHome ? m.opp : teamInfo.name}
                </div>
              </div>
            ))}
          </div>
          <div className="wm-note" style={{ marginTop: 8 }}>
            Verde se vinci ≤ {WIN_ODD_GREEN_MAX.toFixed(2)} · giallo fino a {WIN_ODD_YELLOW_MAX.toFixed(2)} · rosso se sfavorita oltre. La quota evidenziata è quella della nazionale selezionata.
          </div>
        </div>

        <div className="wm-pitch-wrap" ref={pitchRef}>
          <div className="wm-pitch">
            {lines.map((rowSlots, ri) => (
              <div className="wm-pitch-row" key={ri}>
                {rowSlots.map((slot) => {
                  const pos = slots[slot];
                  const roleRuolo = slotRosaRuolo(pos);
                  const slotLetter = slotRoleLetter(pos);
                  const current = store.titolari[slot];
                  const letter = current ? rosaRoleLetter(current.ruolo) : slotLetter;
                  const usedElsewhere = new Set(
                    store.titolari.filter(Boolean).filter((_, j) => j !== slot).map(pkey)
                  );
                  const options = natPool
                    .filter((p) => !usedElsewhere.has(pkey(p)))
                    .sort((a, b) => {
                      const am = a.ruolo === roleRuolo ? 0 : 1;
                      const bm = b.ruolo === roleRuolo ? 0 : 1;
                      if (am !== bm) return am - bm;
                      return b.valore - a.valore;
                    });
                  const open = pickerOpen === slot;
                  return (
                    <div
                      key={slot}
                      className={"wm-pitch-slot role-" + letter.toLowerCase() + (open ? " open" : "")}
                    >
                      <span className={"wm-pitch-pos " + letter.toLowerCase()}>{letter}</span>
                      <button
                        type="button"
                        className="wm-pitch-pick"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPickerOpen(open ? null : slot);
                        }}
                      >
                        {current ? (
                          <>
                            <span className="wm-pitch-nm">{current.nome}</span>
                            <span className="wm-pitch-cr">{current.valore} cr</span>
                          </>
                        ) : (
                          <span className="wm-pitch-ph">+ giocatore</span>
                        )}
                      </button>
                      {open && (
                        <div className="wm-pitch-menu" onMouseDown={(e) => e.stopPropagation()}>
                          <button type="button" className="wm-pitch-opt empty" onClick={() => setTitolare(slot, null)}>
                            — svuota —
                          </button>
                          {options.map((p) => (
                            <button
                              key={pkey(p)}
                              type="button"
                              className={"wm-pitch-opt" + (current && pkey(current) === pkey(p) ? " on" : "")}
                              onClick={() => setTitolare(slot, pkey(p))}
                            >
                              <span className="nm">{p.nome}</span>
                              <span className="cr">{p.valore} cr</span>
                            </button>
                          ))}
                          {!options.length && (
                            <div className="wm-pitch-opt empty">Nessun {slotLetter} in listone</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="wm-squad-note-wrap">
          <label className="wm-squad-note-lbl">Note / analisi</label>
          <textarea
            className="wm-squad-note"
            rows={6}
            placeholder="Scrivi qui la tua analisi sulla squadra, il girone, le chance al torneo, i punti di forza…"
            value={store.note}
            onChange={(e) => setStore((prev) => ({ ...prev, note: e.target.value }))}
          />
        </div>
        <div className="wm-squad-note-wrap">
          <label className="wm-squad-note-lbl">Analisi amichevoli</label>
          <textarea
            className="wm-squad-note"
            rows={6}
            placeholder="Osservazioni dalle amichevoli pre-Mondiale: forma, titolari, dubbi, infortuni…"
            value={store.noteAmichevoli || ""}
            onChange={(e) => setStore((prev) => ({ ...prev, noteAmichevoli: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
