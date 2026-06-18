import React, { useMemo, useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, RotateCcw } from "lucide-react";
import { natFlagUrl, teamName } from "./fantamondialeLogic.js";

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
  if (delta > 0) return "var(--green)";
  if (delta < 0) return "var(--red)";
  return "var(--mut)";
}

export default function QuotazioniConfrontoTab({ rows }) {
  const [ruolo, setRuolo] = useState("all");
  const [filtro, setFiltro] = useState("all");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc");

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
    return rows
      .filter((p) => ruolo === "all" || p.ruolo === ruolo)
      .filter((p) => {
        if (filtro === "up") return p.delta > 0;
        if (filtro === "down") return p.delta < 0;
        if (filtro === "flat") return p.delta === 0;
        return true;
      })
      .filter((p) => !q || p.nome.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.nazione.toLowerCase().includes(q))
      .sort((a, b) => {
        const d = sortDir === "desc" ? b.delta - a.delta : a.delta - b.delta;
        if (d !== 0) return d;
        if (b.attuale !== a.attuale) return b.attuale - a.attuale;
        return a.nome.localeCompare(b.nome);
      });
  }, [rows, ruolo, filtro, search, sortDir]);

  const filtersActive = ruolo !== "all" || filtro !== "all" || search.trim() !== "";

  return (
    <div>
      <div className="wm-legend">
        <span style={{ fontWeight: 700, color: "var(--txt)" }}>Confronto quotazioni iniziali vs 2ª giornata (listone_2g.json):</span>
        <span className="wm-leg"><TrendingUp size={13} color="var(--green)" /> Plusvalenza</span>
        <span className="wm-leg"><TrendingDown size={13} color="var(--red)" /> Minusvalenza</span>
        <span className="wm-leg"><Minus size={13} color="var(--mut)" /> Invariato</span>
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><TrendingUp size={15} color="var(--gold)" /> Confronto quotazioni</div>
        <div className="wm-stat">
          <span><b style={{ color: "var(--green)" }}>{stats.up}</b> in aumento</span>
          <span><b style={{ color: "var(--red)" }}>{stats.down}</b> in calo</span>
          <span><b>{stats.flat}</b> invariati</span>
          {stats.maxUp && (
            <span>Max <b style={{ color: "var(--green)" }}>+{stats.maxUp.delta}</b> {stats.maxUp.nome}</span>
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
          <span
            className={"wm-fchip" + (sortDir === "desc" ? " on" : "")}
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            title="Ordina per delta"
          >
            Δ {sortDir === "desc" ? "↓" : "↑"}
          </span>
          <button
            type="button"
            className="wm-freset"
            disabled={!filtersActive}
            onClick={() => { setRuolo("all"); setFiltro("all"); setSearch(""); }}
          >
            <RotateCcw size={12} /> Reset filtri
          </button>
        </div>

        <div className="wm-tscroll">
          <table className="wm-table">
            <thead>
              <tr>
                <th>Giocatore</th>
                <th>Ruolo</th>
                <th>Iniziale</th>
                <th>2ª g.</th>
                <th>Δ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={`${p.ruolo}-${p.nome}-${p.nazione}`}>
                  <td>
                    <div className="wm-pname">{p.nome}</div>
                    <div className="wm-pmeta">
                      <TeamBadge nazione={p.nazione} team={p.team} compact />
                    </div>
                  </td>
                  <td style={{ fontFamily: "JetBrains Mono", fontSize: 10 }}>{p.ruoloLabel}</td>
                  <td style={{ fontFamily: "JetBrains Mono", color: "var(--mut)" }}>{p.iniziale}</td>
                  <td style={{ fontFamily: "JetBrains Mono", fontWeight: 700 }}>{p.attuale}</td>
                  <td style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: deltaColor(p.delta) }}>
                    {p.delta > 0 ? `+${p.delta}` : p.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="wm-note" style={{ marginTop: 10 }}>
          Quotazioni iniziali da listone.json · aggiornate alla 2ª giornata da listone_2g.json (fc_quotazioni_mondiale_02.xls).
          Il resto dell&apos;app usa le quotazioni aggiornate.
        </div>
      </div>
    </div>
  );
}
