import React, { useMemo, useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, RotateCcw } from "lucide-react";
import { natFlagUrl, teamName, LISTONE_GIORNATA } from "./fantamondialeLogic.js";
import { isPlayerEliminato, filterByEliminazione, SQUADRE_ELIMINATE } from "./eliminateData.js";

function TeamBadge({ nazione, team, compact }) {
  const name = team || teamName(nazione);
  const flagSrc = natFlagUrl(nazione);
  return (
    <span className={"wm-team-badge" + (compact ? " compact" : "")} title={name}>
      {flagSrc ? (
        <img className="wm-flag" src={flagSrc} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="wm-flag-fallback">{nazione}</span>
      )}
      <span className="wm-tteam">{name}</span>
    </span>
  );
}

function deltaColor(delta) {
  if (delta > 0) return "#22c55e";
  if (delta < 0) return "var(--red)";
  return "var(--mut)";
}

function fmtDelta(delta) {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

const RUOLO_ORDER = { portieri: 0, difensori: 1, centrocampisti: 2, attaccanti: 3 };

const SORT_DEFAULT_DIR = {
  nome: "asc",
  ruolo: "asc",
  iniziale: "desc",
  g2: "desc",
  g3: "desc",
  attuale: "desc",
  delta: "desc",
};

function compareQuotRows(a, b, sortKey, sortDir) {
  const mul = sortDir === "desc" ? -1 : 1;
  let cmp = 0;
  switch (sortKey) {
    case "nome":
      cmp = a.nome.localeCompare(b.nome, "it");
      break;
    case "ruolo":
      cmp = (RUOLO_ORDER[a.ruolo] ?? 9) - (RUOLO_ORDER[b.ruolo] ?? 9);
      if (cmp === 0) cmp = a.nome.localeCompare(b.nome, "it");
      break;
    case "iniziale":
      cmp = a.iniziale - b.iniziale;
      break;
    case "g2":
      cmp = a.g2 - b.g2;
      break;
    case "g3":
      cmp = a.g3 - b.g3;
      break;
    case "attuale":
      cmp = a.attuale - b.attuale;
      break;
    case "delta":
    default:
      cmp = a.delta - b.delta;
      break;
  }
  if (cmp !== 0) return cmp * mul;
  if (sortKey !== "attuale") {
    const q = b.attuale - a.attuale;
    if (q !== 0) return q;
  }
  if (sortKey !== "iniziale") {
    const q = b.iniziale - a.iniziale;
    if (q !== 0) return q;
  }
  return a.nome.localeCompare(b.nome, "it");
}

function SortTh({ label, sortKey, activeKey, sortDir, onSort, title }) {
  const on = activeKey === sortKey;
  return (
    <th
      className={"wm-th-sort" + (on ? " on" : "")}
      onClick={() => onSort(sortKey)}
      title={title || "Clic per ordinare · clic di nuovo per invertire"}
    >
      {label}{on ? (sortDir === "desc" ? " ↓" : " ↑") : " ↕"}
    </th>
  );
}

function DeltaCell({ delta }) {
  return (
    <td style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: deltaColor(delta) }}>
      {fmtDelta(delta)}
    </td>
  );
}

export default function QuotazioniConfrontoTab({ rows }) {
  const [ruolo, setRuolo] = useState("all");
  const [filtro, setFiltro] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("delta");
  const [sortDir, setSortDir] = useState("desc");
  const [elimNatFilter, setElimNatFilter] = useState("all");

  const clickSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir(SORT_DEFAULT_DIR[key] || "desc");
    }
  };

  const stats = useMemo(() => {
    let up = 0;
    let down = 0;
    let flat = 0;
    let maxUp = null;
    let maxDown = null;
    for (const r of rows) {
      if (r.delta > 0) {
        up++;
        if (!maxUp || r.delta > maxUp.delta) maxUp = r;
      } else if (r.delta < 0) {
        down++;
        if (!maxDown || r.delta < maxDown.delta) maxDown = r;
      } else flat++;
    }
    return { up, down, flat, maxUp, maxDown };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return filterByEliminazione(rows, elimNatFilter)
      .filter((p) => ruolo === "all" || p.ruolo === ruolo)
      .filter((p) => {
        if (filtro === "up") return p.delta > 0;
        if (filtro === "down") return p.delta < 0;
        if (filtro === "flat") return p.delta === 0;
        return true;
      })
      .filter((p) => !q || p.nome.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.nazione.toLowerCase().includes(q))
      .sort((a, b) => compareQuotRows(a, b, sortKey, sortDir));
  }, [rows, ruolo, filtro, search, sortKey, sortDir, elimNatFilter]);

  const filtersActive = ruolo !== "all" || filtro !== "all" || search.trim() !== "" || elimNatFilter !== "all";

  return (
    <div>
      <div className="wm-legend">
        <span style={{ fontWeight: 700, color: "var(--txt)" }}>Confronto quotazioni 1G → 4G:</span>
        <span className="wm-leg"><TrendingUp size={13} color="#22c55e" /> Plusvalenza</span>
        <span className="wm-leg"><TrendingDown size={13} color="var(--red)" /> Minusvalenza</span>
        <span className="wm-leg"><Minus size={13} color="var(--mut)" /> Invariato</span>
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><TrendingUp size={15} color="var(--gold)" /> Confronto quotazioni</div>
        <div className="wm-stat">
          <span><b style={{ color: "#22c55e" }}>{stats.up}</b> in aumento (1→{LISTONE_GIORNATA}G)</span>
          <span><b style={{ color: "var(--red)" }}>{stats.down}</b> in calo (1→{LISTONE_GIORNATA}G)</span>
          <span><b>{stats.flat}</b> invariati (1→{LISTONE_GIORNATA}G)</span>
          {stats.maxUp && (
            <span>Max <b style={{ color: "#22c55e" }}>+{stats.maxUp.delta}</b> {stats.maxUp.nome}</span>
          )}
          {stats.maxDown && (
            <span>Max <b style={{ color: "var(--red)" }}>{stats.maxDown.delta}</b> {stats.maxDown.nome}</span>
          )}
          <span><b>{filtered.length}</b> visibili / {rows.length}</span>
        </div>

        <div className="wm-filters">
          <div className="wm-search">
            <Search size={14} color="var(--mut)" />
            <input placeholder="Cerca giocatore, nazione…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {["all", "portieri", "difensori", "centrocampisti", "attaccanti"].map((r) => (
            <span key={r} className={"wm-fchip" + (ruolo === r ? " on" : "")} onClick={() => setRuolo(r)}>
              {r === "all" ? "Tutti" : r === "portieri" ? "POR" : r === "difensori" ? "DIF" : r === "centrocampisti" ? "CEN" : "ATT"}
            </span>
          ))}
          <span style={{ color: "var(--line)" }}>|</span>
          {[
            ["all", "Tutti"],
            ["up", "Solo +"],
            ["down", "Solo −"],
            ["flat", "Invariati"],
          ].map(([id, label]) => (
            <span key={id} className={"wm-fchip" + (filtro === id ? " on" : "")} onClick={() => setFiltro(id)}>
              {label}
            </span>
          ))}
          <button
            type="button"
            className="wm-freset"
            disabled={!filtersActive}
            onClick={() => { setRuolo("all"); setFiltro("all"); setSearch(""); setElimNatFilter("all"); }}
          >
            <RotateCcw size={12} /> Reset filtri
          </button>
          <span style={{ color: "var(--line)" }}>|</span>
          <label className="wm-fchk" title="Solo nazionali ancora in competizione">
            <input type="checkbox" checked={elimNatFilter === "vivo"} onChange={(e) => setElimNatFilter(e.target.checked ? "vivo" : "all")} />
            Solo in gioco
          </label>
          <label className="wm-fchk" title="Solo squadre eliminate">
            <input type="checkbox" checked={elimNatFilter === "out"} onChange={(e) => setElimNatFilter(e.target.checked ? "out" : "all")} />
            Solo eliminate
          </label>
        </div>

        <div className="wm-tscroll">
          <table className="wm-table">
            <thead>
              <tr>
                <SortTh label="Giocatore" sortKey="nome" activeKey={sortKey} sortDir={sortDir} onSort={clickSort} />
                <SortTh label="Ruolo" sortKey="ruolo" activeKey={sortKey} sortDir={sortDir} onSort={clickSort} />
                <SortTh label="1G" sortKey="iniziale" activeKey={sortKey} sortDir={sortDir} onSort={clickSort} />
                <SortTh label="2G" sortKey="g2" activeKey={sortKey} sortDir={sortDir} onSort={clickSort} />
                <SortTh label="3G" sortKey="g3" activeKey={sortKey} sortDir={sortDir} onSort={clickSort} />
                <SortTh label="4G" sortKey="attuale" activeKey={sortKey} sortDir={sortDir} onSort={clickSort} />
                <SortTh label="Δ" sortKey="delta" activeKey={sortKey} sortDir={sortDir} onSort={clickSort} title="Variazione totale 1G → 4G (vs quotazione iniziale)" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const elim = isPlayerEliminato(p);
                return (
                <tr key={`${p.ruolo}-${p.nome}-${p.nazione}`} className={elim ? "wm-elim-row" : ""}>
                  <td>
                    <div className="wm-pname">
                      <span className={elim ? "wm-elim" : ""}>{p.nome}</span>
                    </div>
                    <div className="wm-pmeta">
                      <TeamBadge nazione={p.nazione} team={p.team} compact />
                    </div>
                  </td>
                  <td style={{ fontFamily: "JetBrains Mono", fontSize: 10 }}>{p.ruoloLabel}</td>
                  <td style={{ fontFamily: "JetBrains Mono", color: "var(--mut)" }}>{p.iniziale}</td>
                  <td style={{ fontFamily: "JetBrains Mono" }}>{p.g2}</td>
                  <td style={{ fontFamily: "JetBrains Mono" }}>{p.g3}</td>
                  <td style={{ fontFamily: "JetBrains Mono", fontWeight: 700 }}>{p.attuale}</td>
                  <DeltaCell delta={p.delta} />
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="wm-note" style={{ marginTop: 10 }}>
          Quotazioni da listone.json (1G), listone_2g.json, listone_3g.json e listone_4g.json (4G attuale).
          Il Δ è sempre rispetto alla quotazione iniziale (1G). Rosa e resto app: quotazioni {LISTONE_GIORNATA}G.
          {" "}Giocatori <span className="wm-elim">barrati</span>: squadra eliminata ({SQUADRE_ELIMINATE.length} nazionali).
        </div>
      </div>
    </div>
  );
}
