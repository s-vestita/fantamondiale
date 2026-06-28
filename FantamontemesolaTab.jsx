import React, { useMemo, useState } from "react";
import { Trophy, LayoutList, Medal, Shuffle, XCircle, CheckCircle2 } from "lucide-react";
import { natFlagUrl } from "./fantamondialeLogic.js";
import FantamontemesolaBracket from "./FantamontemesolaBracket.jsx";
import {
  buildFantamontemesolaState,
  buildR32Matches,
  randomDrawThirdSlots,
  teamNatCode,
  teamStatus,
  ABBR,
  R32,
} from "./fantamontemesolaLogic.js";

function fmtFp(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",");
}

function TeamLine({ team, utente, dim }) {
  const nat = team ? teamNatCode(team) : null;
  const flagSrc = nat ? natFlagUrl(nat) : null;
  return (
    <span className={"wm-fmt-team" + (dim ? " dim" : "")}>
      {flagSrc ? (
        <img className="wm-flag" src={flagSrc} alt="" loading="lazy" decoding="async" />
      ) : team ? (
        <span className="wm-flag-fallback">?</span>
      ) : null}
      <span className="nm">{team || "—"}</span>
      {team && <span className="ab">{ABBR[team] || ""}</span>}
      {utente && <span className="wm-fmt-user">@{utente}</span>}
    </span>
  );
}

function StatusTag({ status }) {
  if (status === "qualified") {
    return <span className="wm-fmt-tag ok"><CheckCircle2 size={11} /> Qualificata</span>;
  }
  if (status === "third_wait") {
    return <span className="wm-fmt-tag wait">In attesa sorteggio</span>;
  }
  return <span className="wm-fmt-tag out"><XCircle size={11} /> Eliminata</span>;
}

export default function FantamontemesolaTab() {
  const base = useMemo(() => buildFantamontemesolaState(), []);
  const [thirdsMap, setThirdsMap] = useState({});
  const [drawError, setDrawError] = useState("");

  const r32Matches = useMemo(
    () => buildR32Matches(base.place, thirdsMap),
    [base.place, thirdsMap]
  );

  const matchById = useMemo(() => new Map(r32Matches.map((r) => [r.m, r])), [r32Matches]);
  const drawn = Object.keys(thirdsMap).length === 8;

  const handleSorteggia = () => {
    setDrawError("");
    const result = randomDrawThirdSlots(base.qualifiedThirdGroupList, R32);
    if (!result) {
      setDrawError("Sorteggio non riuscito — riprova.");
      return;
    }
    setThirdsMap(result);
  };

  return (
    <div className="wm-fmt">
      <div className="wm-note" style={{ marginBottom: 14 }}>
        48 squadre, ne passano 32: prime 2 per girone + 8 migliori terze
        (<b>punti girone</b> prima, fantapunti solo a parità).
        Le terze qualificate vanno sorteggiate negli slot del tabellone ufficiale FIFA.
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><LayoutList size={15} color="var(--turf)" /> Classifiche gironi</div>
        <div className="wm-fmt-gironi">
          {base.gironi.map((g) => (
            <div className="wm-fmt-gblock" key={g.girone}>
              <div className="wm-fmt-ghead">
                <span className="wm-gtag">GIRONE {g.girone}</span>
                <span className="wm-fmt-glet">({g.letter})</span>
              </div>
              <table className="wm-table wm-table-compact">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Squadra</th>
                    <th style={{ textAlign: "right" }}>PU</th>
                    <th style={{ textAlign: "right" }}>VI</th>
                    <th style={{ textAlign: "right" }}>PA</th>
                    <th style={{ textAlign: "right" }}>SC</th>
                    <th style={{ textAlign: "right" }}>GF</th>
                    <th style={{ textAlign: "right" }}>GS</th>
                    <th style={{ textAlign: "right" }}>FP</th>
                    <th>Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {g.sorted.map((s, i) => {
                    const pos = i + 1;
                    const status = teamStatus(pos, g.letter, base.qualifiedThirdGroups);
                    const rowCls =
                      status === "qualified" ? "wm-fmt-row-ok"
                      : status === "third_wait" ? "wm-fmt-row-wait"
                      : "wm-fmt-row-out";
                    return (
                      <tr key={s.nome} className={rowCls}>
                        <td><span className="wm-fmt-pos">{pos}º</span></td>
                        <td><TeamLine team={s.nomeCanon} utente={s.utente} dim={status === "eliminated"} /></td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700 }}>{s.PU}</td>
                        <td style={{ textAlign: "right" }}>{s.VI}</td>
                        <td style={{ textAlign: "right" }}>{s.PA}</td>
                        <td style={{ textAlign: "right" }}>{s.SC}</td>
                        <td style={{ textAlign: "right" }}>{s.GF}</td>
                        <td style={{ textAlign: "right" }}>{s.GS}</td>
                        <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, color: "var(--gold)" }}>
                          {fmtFp(s.fantapunti)}
                        </td>
                        <td><StatusTag status={status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><XCircle size={15} color="#ef4444" /> Eliminate — 16 su 48</div>
        <div className="wm-fmt-elim-grid">
          {base.eliminatedTeams.map((e) => (
            <div className="wm-fmt-elim-card" key={`${e.letter}-${e.team}`}>
              <span className="wm-fmt-gr">{e.pos}º {e.letter}</span>
              <TeamLine team={e.team} utente={e.utente} dim />
              <span className="wm-fmt-elim-reason">{e.reason}</span>
              <span className="wm-fmt-fp">{fmtFp(e.fantapunti)} FP</span>
            </div>
          ))}
        </div>
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><Medal size={15} color="var(--gold)" /> Migliori terze — classifica e sorteggio</div>
        <div className="wm-note" style={{ marginBottom: 10 }}>
          Ordine terze: <b>PU</b> → diff reti → GF → fantapunti.
        </div>
        <div className="wm-flex" style={{ marginBottom: 12 }}>
          <button type="button" className="wm-btn gold" onClick={handleSorteggia}>
            <Shuffle size={15} /> Sorteggia
          </button>
          {drawn && (
            <button type="button" className="wm-btn" onClick={() => { setThirdsMap({}); setDrawError(""); }}>
              Reset sorteggio
            </button>
          )}
          <span className="wm-note" style={{ margin: 0 }}>
            {drawn
              ? "Sorteggio completato — tabellone aggiornato."
              : "Premi Sorteggia per assegnare le 8 terze agli slot (senza incroci nello stesso girone)."}
          </span>
        </div>
        {drawError && <div className="wm-note" style={{ color: "#ef4444", marginBottom: 10 }}>{drawError}</div>}
        <div className="wm-fmt-thirds-grid">
          <div>
            <h4 className="wm-fmt-subtit ok">Qualificate al sorteggio (8)</h4>
            <ol className="wm-fmt-thirds-list">
              {base.qualifiedThirds.map((t) => (
                <li key={t.g}>
                  <span className="wm-fmt-gr">3º {t.g}</span>
                  <TeamLine team={t.team} />
                  <span className="wm-fmt-fp">{t.PU} pt · {fmtFp(t.fantapunti)} FP</span>
                  {drawn && thirdsMap && (
                    <span className="wm-fmt-slot-assigned">
                      → M{Object.entries(thirdsMap).find(([, g]) => g === t.g)?.[0] || "?"}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h4 className="wm-fmt-subtit out">Terze escluse (4)</h4>
            <ol className="wm-fmt-thirds-list out">
              {base.eliminatedThirds.map((t) => (
                <li key={t.g}>
                  <span className="wm-fmt-gr">3º {t.g}</span>
                  <TeamLine team={t.team} dim />
                  <span className="wm-fmt-fp">{t.PU} pt · {fmtFp(t.fantapunti)} FP</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="wm-panel wm-fmt-bk-panel">
        <div className="wm-ph"><Trophy size={15} color="var(--gold)" /> Tabellone eliminazione diretta</div>
        <FantamontemesolaBracket matchById={matchById} drawn={drawn} />
      </div>
    </div>
  );
}
