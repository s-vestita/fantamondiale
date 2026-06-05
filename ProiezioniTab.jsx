import React, { useMemo, useState } from "react";
import { BarChart3, Shield, Flame } from "lucide-react";
import { teamName, natFlagUrl } from "./fantamondialeLogic.js";
import { TORNEO_PROIEZIONI, GIRONE_PROIEZIONI, GOL_PREVISTI } from "./proiezioniData.js";
import { SQUADRA_SCHEDULE, GIRONI_LIST } from "./cleanSheetData.js";

function fmtPct(v) {
  if (v == null) return "—";
  if (v === 0) return "0,0%";
  return `${v.toFixed(1).replace(".", ",")}%`;
}

function fmtNum(v, dec = 1) {
  return v.toFixed(dec).replace(".", ",");
}

function csColor(v) {
  if (v >= 50) return "#22c55e";
  if (v >= 35) return "#f5a524";
  return "#ef4444";
}

function overColor(v) {
  if (v == null) return "var(--mut)";
  if (v >= 60) return "#ef4444";
  if (v >= 45) return "#f5a524";
  return "#22c55e";
}

function NatFlag({ nazione }) {
  const src = natFlagUrl(nazione);
  if (!src) return <span className="wm-flag-fallback">{nazione}</span>;
  return <img className="wm-flag" src={src} alt="" loading="lazy" decoding="async" />;
}

function SquadraCell({ nat }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <NatFlag nazione={nat} />
      <span style={{ fontWeight: 600 }}>{teamName(nat)}</span>
    </span>
  );
}

function giornataVal(row, md, field) {
  return row.giornate?.find((g) => g.md === md)?.[field] ?? null;
}

function getSortValue(row, key) {
  if (key === "squadra") return teamName(row.nat);
  if (key === "g1cs") return giornataVal(row, 1, "cs");
  if (key === "g2cs") return giornataVal(row, 2, "cs");
  if (key === "g3cs") return giornataVal(row, 3, "cs");
  if (key === "g1over") return giornataVal(row, 1, "over25");
  if (key === "g2over") return giornataVal(row, 2, "over25");
  if (key === "g3over") return giornataVal(row, 3, "over25");
  if (key === "g1btts") return giornataVal(row, 1, "btts");
  if (key === "g2btts") return giornataVal(row, 2, "btts");
  if (key === "g3btts") return giornataVal(row, 3, "btts");
  return row[key];
}

function sortRows(rows, sort) {
  const mul = sort.dir === "desc" ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = getSortValue(a, sort.key);
    const bv = getSortValue(b, sort.key);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string") return mul * av.localeCompare(bv, "it");
    return mul * (av - bv);
  });
}

function SortTh({ label, sortKey, sort, onSort, align = "left" }) {
  const on = sort.key === sortKey;
  return (
    <th
      className={"wm-th-sort" + (on ? " on" : "")}
      style={{ textAlign: align }}
      onClick={() => onSort(sortKey)}
      title="Clic per ordinare"
    >
      {label}{on ? (sort.dir === "desc" ? " ↓" : " ↑") : " ↕"}
    </th>
  );
}

function GiornataCsCell({ g }) {
  return (
    <td style={{ fontSize: 11 }}>
      <div className="wm-proj-gcell">
        <span className="wm-proj-avv">vs {teamName(g.avv)}</span>
        <span className="wm-proj-val" style={{ color: csColor(g.cs), fontFamily: "JetBrains Mono", fontWeight: 700 }}>
          {fmtPct(g.cs)}{g.ideal ? " 📌" : ""}
        </span>
      </div>
    </td>
  );
}

function GiornataOverCell({ g }) {
  return (
    <td style={{ fontSize: 11 }}>
      <div className="wm-proj-gcell">
        <span className="wm-proj-avv">vs {teamName(g.avv)}</span>
        <span className="wm-proj-val" style={{ color: overColor(g.over25), fontFamily: "JetBrains Mono", fontWeight: 700 }}>
          {g.hot && <Flame size={11} style={{ marginRight: 3, verticalAlign: -1 }} />}
          {fmtPct(g.over25)}
        </span>
        {g.btts != null && (
          <span className="wm-proj-sub">BTTS {fmtPct(g.btts)}</span>
        )}
      </div>
    </td>
  );
}

export default function ProiezioniTab() {
  const [torneoSort, setTorneoSort] = useState({ key: "vittoriaTorneo", dir: "desc" });
  const [csSort, setCsSort] = useState({ key: "maxCs", dir: "desc" });
  const [overSort, setOverSort] = useState({ key: "maxOver", dir: "desc" });
  const [gironeSort, setGironeSort] = useState({ key: "qualificazione", dir: "desc" });
  const [gironeDetSort, setGironeDetSort] = useState({ key: "maxCs", dir: "desc" });
  const [golSort, setGolSort] = useState({ key: "totale", dir: "desc" });
  const [gironeSel, setGironeSel] = useState("A");

  const toggleSort = (setter) => (key) => {
    setter((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));
  };

  const torneoSorted = useMemo(() => sortRows(TORNEO_PROIEZIONI, torneoSort), [torneoSort]);
  const csSorted = useMemo(() => sortRows(SQUADRA_SCHEDULE, csSort), [csSort]);
  const overSorted = useMemo(() => sortRows(SQUADRA_SCHEDULE, overSort), [overSort]);
  const golSorted = useMemo(() => sortRows(GOL_PREVISTI, golSort), [golSort]);

  const gironeData = useMemo(
    () => GIRONE_PROIEZIONI.find((g) => g.girone === gironeSel),
    [gironeSel]
  );

  const gironeRigheSorted = useMemo(
    () => (gironeData ? sortRows(gironeData.righe, gironeSort) : []),
    [gironeData, gironeSort]
  );

  const gironeScheduleSorted = useMemo(
    () => sortRows(SQUADRA_SCHEDULE.filter((s) => s.girone === gironeSel), gironeDetSort),
    [gironeSel, gironeDetSort]
  );

  return (
    <div>
      <div className="wm-panel">
        <div className="wm-ph"><BarChart3 size={15} color="var(--gold)" /> Proiezioni torneo</div>
        <p className="wm-proj-intro">
          Probabilità di vittoria del Mondiale, arrivo in finale e ai quarti, partite attese, gol e assist previsti. Tutte le colonne ordinabili.
        </p>
        <div className="wm-tscroll">
          <table className="wm-table">
            <thead>
              <tr>
                <SortTh label="Squadra" sortKey="squadra" sort={torneoSort} onSort={toggleSort(setTorneoSort)} />
                <SortTh label="Girone" sortKey="girone" sort={torneoSort} onSort={toggleSort(setTorneoSort)} />
                <SortTh label="Vittoria torneo" sortKey="vittoriaTorneo" sort={torneoSort} onSort={toggleSort(setTorneoSort)} align="right" />
                <SortTh label="Arrivo in finale" sortKey="finale" sort={torneoSort} onSort={toggleSort(setTorneoSort)} align="right" />
                <SortTh label="Arrivo ai quarti" sortKey="quarti" sort={torneoSort} onSort={toggleSort(setTorneoSort)} align="right" />
                <SortTh label="Partite attese" sortKey="partite" sort={torneoSort} onSort={toggleSort(setTorneoSort)} align="right" />
                <SortTh label="Gol previsti" sortKey="gol" sort={torneoSort} onSort={toggleSort(setTorneoSort)} align="right" />
                <SortTh label="Assist previsti" sortKey="assist" sort={torneoSort} onSort={toggleSort(setTorneoSort)} align="right" />
              </tr>
            </thead>
            <tbody>
              {torneoSorted.map((r) => (
                <tr key={r.nat}>
                  <td><SquadraCell nat={r.nat} /></td>
                  <td><span className="wm-proj-gr">{r.girone}</span></td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, color: r.vittoriaTorneo >= 10 ? "var(--gold)" : undefined }}>
                    {fmtPct(r.vittoriaTorneo)}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtPct(r.finale)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtPct(r.quarti)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.partite, 1)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.gol, 1)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.assist, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><Shield size={15} color="var(--turf)" /> Probabilità clean sheet per squadra</div>
        <p className="wm-proj-intro">
          CS% = probabilità di non subire gol in quella partita. 📌 = giornata ideale per difensori/portieri in fanta.
        </p>
        <div className="wm-tscroll">
          <table className="wm-table">
            <thead>
              <tr>
                <SortTh label="Squadra" sortKey="squadra" sort={csSort} onSort={toggleSort(setCsSort)} />
                <SortTh label="Girone" sortKey="girone" sort={csSort} onSort={toggleSort(setCsSort)} />
                <SortTh label="G1" sortKey="g1cs" sort={csSort} onSort={toggleSort(setCsSort)} align="right" />
                <SortTh label="G2" sortKey="g2cs" sort={csSort} onSort={toggleSort(setCsSort)} align="right" />
                <SortTh label="G3" sortKey="g3cs" sort={csSort} onSort={toggleSort(setCsSort)} align="right" />
                <SortTh label="Max CS" sortKey="maxCs" sort={csSort} onSort={toggleSort(setCsSort)} align="right" />
                <SortTh label="Media CS" sortKey="avgCs" sort={csSort} onSort={toggleSort(setCsSort)} align="right" />
              </tr>
            </thead>
            <tbody>
              {csSorted.map((r) => (
                <tr key={r.nat}>
                  <td><SquadraCell nat={r.nat} /></td>
                  <td><span className="wm-proj-gr">{r.girone}</span></td>
                  {r.giornate.map((g) => <GiornataCsCell key={g.md} g={g} />)}
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, color: csColor(r.maxCs) }}>
                    {fmtPct(r.maxCs)} <span style={{ color: "var(--mut)", fontSize: 9 }}>G{r.bestMdCs}</span>
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", color: csColor(r.avgCs) }}>{fmtPct(r.avgCs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><Flame size={15} color="#ef4444" /> Probabilità Over 2.5 per squadra</div>
        <p className="wm-proj-intro">
          Over 2.5 = probabilità che la partita finisca con 3+ gol totali. 🔥 = partita ad alto scoring (&gt;60%).
        </p>
        <div className="wm-tscroll">
          <table className="wm-table">
            <thead>
              <tr>
                <SortTh label="Squadra" sortKey="squadra" sort={overSort} onSort={toggleSort(setOverSort)} />
                <SortTh label="Girone" sortKey="girone" sort={overSort} onSort={toggleSort(setOverSort)} />
                <SortTh label="G1" sortKey="g1over" sort={overSort} onSort={toggleSort(setOverSort)} align="right" />
                <SortTh label="G2" sortKey="g2over" sort={overSort} onSort={toggleSort(setOverSort)} align="right" />
                <SortTh label="G3" sortKey="g3over" sort={overSort} onSort={toggleSort(setOverSort)} align="right" />
                <SortTh label="Max Over" sortKey="maxOver" sort={overSort} onSort={toggleSort(setOverSort)} align="right" />
              </tr>
            </thead>
            <tbody>
              {overSorted.map((r) => (
                <tr key={r.nat}>
                  <td><SquadraCell nat={r.nat} /></td>
                  <td><span className="wm-proj-gr">{r.girone}</span></td>
                  {r.giornate.map((g) => <GiornataOverCell key={g.md} g={g} />)}
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, color: overColor(r.maxOver) }}>
                    {fmtPct(r.maxOver)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><BarChart3 size={15} color="var(--turf)" /> Proiezioni per girone</div>
        <div className="wm-proj-controls">
          <div className="wm-form-ctrl">
            <label>Girone</label>
            <select value={gironeSel} onChange={(e) => setGironeSel(e.target.value)}>
              {GIRONI_LIST.map((g) => (
                <option key={g} value={g}>Girone {g}</option>
              ))}
            </select>
          </div>
        </div>
        {gironeData && (
          <div className="wm-proj-gblock">
            <h4 className="wm-proj-gtit">{gironeData.titolo}</h4>
            <div className="wm-tscroll">
              <table className="wm-table wm-table-compact">
                <thead>
                  <tr>
                    <SortTh label="Squadra" sortKey="squadra" sort={gironeSort} onSort={toggleSort(setGironeSort)} />
                    <SortTh label="Vittoria girone" sortKey="vittoriaGirone" sort={gironeSort} onSort={toggleSort(setGironeSort)} align="right" />
                    <SortTh label="Qualificazione" sortKey="qualificazione" sort={gironeSort} onSort={toggleSort(setGironeSort)} align="right" />
                    <SortTh label="Punti attesi" sortKey="punti" sort={gironeSort} onSort={toggleSort(setGironeSort)} align="right" />
                    <SortTh label="Gol previsti" sortKey="gol" sort={gironeSort} onSort={toggleSort(setGironeSort)} align="right" />
                    <SortTh label="Assist previsti" sortKey="assist" sort={gironeSort} onSort={toggleSort(setGironeSort)} align="right" />
                  </tr>
                </thead>
                <tbody>
                  {gironeRigheSorted.map((r) => (
                    <tr key={r.nat}>
                      <td><SquadraCell nat={r.nat} /></td>
                      <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtPct(r.vittoriaGirone)}</td>
                      <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 600, color: r.qualificazione >= 70 ? "var(--turf)" : undefined }}>
                        {fmtPct(r.qualificazione)}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.punti, 2)}</td>
                      <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.gol, 2)}</td>
                      <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.assist, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="wm-proj-nota">{gironeData.nota}</p>

            <h4 className="wm-proj-gtit" style={{ marginTop: 16, color: "var(--gold)" }}>Dettaglio CS &amp; Over — Girone {gironeSel}</h4>
            <div className="wm-tscroll">
              <table className="wm-table wm-table-compact">
                <thead>
                  <tr>
                    <SortTh label="Squadra" sortKey="squadra" sort={gironeDetSort} onSort={toggleSort(setGironeDetSort)} />
                    <SortTh label="G1" sortKey="g1cs" sort={gironeDetSort} onSort={toggleSort(setGironeDetSort)} align="right" />
                    <SortTh label="G2" sortKey="g2cs" sort={gironeDetSort} onSort={toggleSort(setGironeDetSort)} align="right" />
                    <SortTh label="G3" sortKey="g3cs" sort={gironeDetSort} onSort={toggleSort(setGironeDetSort)} align="right" />
                    <SortTh label="Max CS" sortKey="maxCs" sort={gironeDetSort} onSort={toggleSort(setGironeDetSort)} align="right" />
                    <SortTh label="Max Over" sortKey="maxOver" sort={gironeDetSort} onSort={toggleSort(setGironeDetSort)} align="right" />
                  </tr>
                </thead>
                <tbody>
                  {gironeScheduleSorted.map((r) => (
                    <tr key={r.nat}>
                      <td><SquadraCell nat={r.nat} /></td>
                      {r.giornate.map((g) => (
                        <td key={g.md} style={{ fontSize: 10.5 }}>
                          <div className="wm-proj-gcell">
                            <span className="wm-proj-avv">vs {teamName(g.avv)}</span>
                            <span style={{ color: csColor(g.cs), fontFamily: "JetBrains Mono", fontWeight: 700 }}>
                              CS {fmtPct(g.cs)}{g.ideal ? " 📌" : ""}
                            </span>
                            <span style={{ color: overColor(g.over25), fontFamily: "JetBrains Mono" }}>
                              Over {fmtPct(g.over25)}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, color: csColor(r.maxCs) }}>{fmtPct(r.maxCs)}</td>
                      <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, color: overColor(r.maxOver) }}>{fmtPct(r.maxOver)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><BarChart3 size={15} color="var(--gold)" /> Gol previsti (xGF) — fase a gironi</div>
        <p className="wm-proj-intro">
          Expected goals a favore (xGF) per tutte le 48 squadre in fase a gironi.
        </p>
        <div className="wm-tscroll">
          <table className="wm-table">
            <thead>
              <tr>
                <SortTh label="#" sortKey="pos" sort={golSort} onSort={toggleSort(setGolSort)} />
                <SortTh label="Girone" sortKey="girone" sort={golSort} onSort={toggleSort(setGolSort)} />
                <SortTh label="Squadra" sortKey="squadra" sort={golSort} onSort={toggleSort(setGolSort)} />
                <SortTh label="G1 xGF" sortKey="g1" sort={golSort} onSort={toggleSort(setGolSort)} align="right" />
                <SortTh label="G2 xGF" sortKey="g2" sort={golSort} onSort={toggleSort(setGolSort)} align="right" />
                <SortTh label="G3 xGF" sortKey="g3" sort={golSort} onSort={toggleSort(setGolSort)} align="right" />
                <SortTh label="G1+G2 xGF" sortKey="g1g2" sort={golSort} onSort={toggleSort(setGolSort)} align="right" />
                <SortTh label="G2+G3 xGF" sortKey="g2g3" sort={golSort} onSort={toggleSort(setGolSort)} align="right" />
                <SortTh label="Totale xGF" sortKey="totale" sort={golSort} onSort={toggleSort(setGolSort)} align="right" />
              </tr>
            </thead>
            <tbody>
              {golSorted.map((r, i) => (
                <tr key={r.nat}>
                  <td style={{ fontFamily: "JetBrains Mono", color: "var(--mut)", fontSize: 10 }}>{i + 1}</td>
                  <td><span className="wm-proj-gr">{r.girone}</span></td>
                  <td><SquadraCell nat={r.nat} /></td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.g1, 2)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.g2, 2)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.g3, 2)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.g1g2, 2)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>{fmtNum(r.g2g3, 2)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontWeight: 700, color: "var(--gold)" }}>{fmtNum(r.totale, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
