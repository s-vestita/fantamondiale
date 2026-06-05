import React, { useState, useMemo, useEffect, useRef } from "react";
import { Trophy, Calendar, GitBranch, Zap, RotateCcw, Target, Star, Search, Users, Save, Plus, Trash2, Crosshair, CornerDownRight, LayoutGrid, ChevronUp, ChevronDown, BarChart3 } from "lucide-react";
import ProiezioniTab from "./ProiezioniTab.jsx";
import { buildListone, FASCE, FASCIA_ORDER, ROSA_LIMITS, ROSA_BUDGET, NAT_TO_TEAM, natFlagUrl, teamName } from "./fantamondialeLogic.js";
import { SLOT_POSITIONS, slotRoleLetter, slotRosaRuolo, ROSA_TO_ROLE_LETTER } from "./formationPositions.js";
import { SET_PIECES } from "./setPiecesData.js";
import { simulateGroupStandings, pickThirdSlots } from "./bookmakerOdds.js";

const TEAM_TO_NAT = Object.fromEntries(Object.entries(NAT_TO_TEAM).map(([nat, t]) => [t, nat]));

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

function SetPieceBadges({ sp, compact }) {
  if (!sp || (!sp.rig && !sp.pun && !sp.ang)) return null;
  const sz = compact ? 11 : 13;
  return (
    <span className="wm-sp-badges">
      {sp.rig != null && (
        <span className="wm-sp-ico rig" title={`Rigorista (${sp.rig}º)`}>
          <Crosshair size={sz} />
        </span>
      )}
      {sp.pun != null && (
        <span className="wm-sp-ico pun" title={`Punizioni (${sp.pun}º)`}>
          <Zap size={sz} />
        </span>
      )}
      {sp.ang != null && (
        <span className="wm-sp-ico ang" title={`Angoli (${sp.ang}º)`}>
          <CornerDownRight size={sz} />
        </span>
      )}
    </span>
  );
}

const setPieceLegend = (
  <>
    <span className="wm-leg"><span className="wm-sp-ico rig"><Crosshair size={12} /></span> Rigorista</span>
    <span className="wm-leg"><span className="wm-sp-ico pun"><Zap size={12} /></span> Punizioni</span>
    <span className="wm-leg"><span className="wm-sp-ico ang"><CornerDownRight size={12} /></span> Angoli</span>
  </>
);

const ROSA_STORAGE_KEY = "fantamondiale_rosa";

function emptyRosa() {
  return { portieri: [], difensori: [], centrocampisti: [], attaccanti: [] };
}

function serializeRosa(rosa) {
  const out = {};
  Object.keys(ROSA_LIMITS).forEach((r) => {
    out[r] = rosa[r].map((p) => ({ nome: p.nome, nazione: p.nazione, ruolo: p.ruolo }));
  });
  return out;
}

function hydrateRosa(data, lookup) {
  const result = emptyRosa();
  Object.keys(ROSA_LIMITS).forEach((r) => {
    result[r] = (data[r] || [])
      .map((s) => lookup.get(`${s.ruolo}|${s.nome}|${s.nazione}`))
      .filter(Boolean);
  });
  return result;
}

function hasRosaPlayers(rosa) {
  return Object.values(rosa).some((arr) => arr.length > 0);
}

async function loadRosaFromFile(lookup) {
  try {
    const res = await fetch("/api/rosa");
    if (res.ok) {
      const data = await res.json();
      const result = hydrateRosa(data, lookup);
      if (hasRosaPlayers(result)) return result;
    }
  } catch {
    /* file non disponibile */
  }
  try {
    const raw = localStorage.getItem(ROSA_STORAGE_KEY);
    if (raw) {
      const result = hydrateRosa(JSON.parse(raw), lookup);
      if (hasRosaPlayers(result)) {
        await saveRosaToFile(result);
        localStorage.removeItem(ROSA_STORAGE_KEY);
        return result;
      }
    }
  } catch {
    /* migrazione fallita */
  }
  return emptyRosa();
}

async function saveRosaToFile(rosa) {
  const res = await fetch("/api/rosa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serializeRosa(rosa), null, 2),
  });
  if (!res.ok) throw new Error("save failed");
}

const FORM_MODULES = Object.keys(SLOT_POSITIONS);
const FORM_GIORNATE = [1, 2, 3];

function emptyFormDay(modulo = "4-3-3") {
  return { modulo, titolari: Array(11).fill(null), panchina: [] };
}

function emptyFormazioniStore() {
  return { giornate: Object.fromEntries(FORM_GIORNATE.map((g) => [String(g), emptyFormDay()])) };
}

function serializeFormStore(store) {
  const giornate = {};
  for (const g of FORM_GIORNATE) {
    const key = String(g);
    const day = store.giornate[key] || emptyFormDay();
    giornate[key] = {
      modulo: day.modulo,
      titolari: day.titolari
        .map((p, slot) => (p ? { slot, nome: p.nome, nazione: p.nazione, ruolo: p.ruolo } : null))
        .filter(Boolean),
      panchina: day.panchina.map((p) => ({ nome: p.nome, nazione: p.nazione, ruolo: p.ruolo })),
    };
  }
  return { giornate };
}

function hydrateFormStore(data, lookup) {
  const store = emptyFormazioniStore();
  for (const g of FORM_GIORNATE) {
    const key = String(g);
    const raw = data?.giornate?.[key];
    if (!raw) continue;
    const titolari = Array(11).fill(null);
    (raw.titolari || []).forEach((s) => {
      const p = lookup.get(`${s.ruolo}|${s.nome}|${s.nazione}`);
      if (p && s.slot >= 0 && s.slot < 11) titolari[s.slot] = p;
    });
    const panchina = (raw.panchina || [])
      .map((s) => lookup.get(`${s.ruolo}|${s.nome}|${s.nazione}`))
      .filter(Boolean);
    store.giornate[key] = { modulo: raw.modulo || "4-3-3", titolari, panchina };
  }
  return store;
}

async function loadFormazioniFromFile(lookup) {
  try {
    const res = await fetch("/api/formazioni");
    if (res.ok) return hydrateFormStore(await res.json(), lookup);
  } catch {
    /* file non disponibile */
  }
  return emptyFormazioniStore();
}

async function saveFormazioniToFile(store) {
  const res = await fetch("/api/formazioni", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serializeFormStore(store), null, 2),
  });
  if (!res.ok) throw new Error("save failed");
}

/* ---------------- DATA ---------------- */
// Ordine array = piazzamento previsto di default (1º,2º,3º,4º)
const GROUPS = {
  A: ["Messico", "Corea del Sud", "Cechia", "Sudafrica"],
  B: ["Svizzera", "Canada", "Bosnia", "Qatar"],
  C: ["Brasile", "Marocco", "Scozia", "Haiti"],
  D: ["USA", "Turchia", "Paraguay", "Australia"],
  E: ["Germania", "Ecuador", "Costa d'Avorio", "Curaçao"],
  F: ["Olanda", "Giappone", "Svezia", "Tunisia"],
  G: ["Belgio", "Egitto", "Iran", "Nuova Zelanda"],
  H: ["Spagna", "Uruguay", "Capo Verde", "Arabia Saudita"],
  I: ["Francia", "Senegal", "Norvegia", "Iraq"],
  J: ["Argentina", "Austria", "Algeria", "Giordania"],
  K: ["Portogallo", "Colombia", "Congo DR", "Uzbekistan"],
  L: ["Inghilterra", "Croazia", "Ghana", "Panama"],
};

const STR = {
  Messico: 73, "Corea del Sud": 68, Cechia: 64, Sudafrica: 56,
  Svizzera: 75, Canada: 67, Bosnia: 62, Qatar: 55,
  Brasile: 91, Marocco: 80, Scozia: 64, Haiti: 47,
  USA: 72, Turchia: 73, Paraguay: 63, Australia: 60,
  Germania: 86, Ecuador: 70, "Costa d'Avorio": 69, "Curaçao": 45,
  Olanda: 85, Giappone: 72, Svezia: 71, Tunisia: 60,
  Belgio: 83, Egitto: 68, Iran: 65, "Nuova Zelanda": 50,
  Spagna: 92, Uruguay: 80, "Capo Verde": 52, "Arabia Saudita": 56,
  Francia: 94, Senegal: 76, Norvegia: 75, Iraq: 54,
  Argentina: 92, Austria: 70, Algeria: 64, Giordania: 52,
  Portogallo: 86, Colombia: 77, "Congo DR": 61, Uzbekistan: 55,
  Inghilterra: 89, Croazia: 80, Ghana: 64, Panama: 55,
};

const ABBR = {
  Messico: "MEX", "Corea del Sud": "KOR", Cechia: "CZE", Sudafrica: "RSA",
  Svizzera: "SUI", Canada: "CAN", Bosnia: "BIH", Qatar: "QAT",
  Brasile: "BRA", Marocco: "MAR", Scozia: "SCO", Haiti: "HAI",
  USA: "USA", Turchia: "TUR", Paraguay: "PAR", Australia: "AUS",
  Germania: "GER", Ecuador: "ECU", "Costa d'Avorio": "CIV", "Curaçao": "CUW",
  Olanda: "NED", Giappone: "JPN", Svezia: "SWE", Tunisia: "TUN",
  Belgio: "BEL", Egitto: "EGY", Iran: "IRN", "Nuova Zelanda": "NZL",
  Spagna: "ESP", Uruguay: "URU", "Capo Verde": "CPV", "Arabia Saudita": "KSA",
  Francia: "FRA", Senegal: "SEN", Norvegia: "NOR", Iraq: "IRQ",
  Argentina: "ARG", Austria: "AUT", Algeria: "ALG", Giordania: "JOR",
  Portogallo: "POR", Colombia: "COL", "Congo DR": "COD", Uzbekistan: "UZB",
  Inghilterra: "ENG", Croazia: "CRO", Ghana: "GHA", Panama: "PAN",
};

// [matchday, teamHome, teamAway] per girone
const FIXTURES = {
  A: [[1,"Messico","Sudafrica"],[1,"Corea del Sud","Cechia"],[2,"Cechia","Sudafrica"],[2,"Messico","Corea del Sud"],[3,"Cechia","Messico"],[3,"Sudafrica","Corea del Sud"]],
  B: [[1,"Canada","Bosnia"],[1,"Qatar","Svizzera"],[2,"Svizzera","Bosnia"],[2,"Canada","Qatar"],[3,"Svizzera","Canada"],[3,"Bosnia","Qatar"]],
  C: [[1,"Brasile","Marocco"],[1,"Haiti","Scozia"],[2,"Scozia","Marocco"],[2,"Brasile","Haiti"],[3,"Scozia","Brasile"],[3,"Marocco","Haiti"]],
  D: [[1,"USA","Paraguay"],[1,"Australia","Turchia"],[2,"USA","Australia"],[2,"Turchia","Paraguay"],[3,"Turchia","USA"],[3,"Paraguay","Australia"]],
  E: [[1,"Germania","Curaçao"],[1,"Costa d'Avorio","Ecuador"],[2,"Germania","Costa d'Avorio"],[2,"Ecuador","Curaçao"],[3,"Ecuador","Germania"],[3,"Curaçao","Costa d'Avorio"]],
  F: [[1,"Olanda","Giappone"],[1,"Svezia","Tunisia"],[2,"Olanda","Svezia"],[2,"Tunisia","Giappone"],[3,"Giappone","Svezia"],[3,"Tunisia","Olanda"]],
  G: [[1,"Belgio","Egitto"],[1,"Iran","Nuova Zelanda"],[2,"Belgio","Iran"],[2,"Nuova Zelanda","Egitto"],[3,"Egitto","Iran"],[3,"Nuova Zelanda","Belgio"]],
  H: [[1,"Spagna","Capo Verde"],[1,"Arabia Saudita","Uruguay"],[2,"Spagna","Arabia Saudita"],[2,"Uruguay","Capo Verde"],[3,"Capo Verde","Arabia Saudita"],[3,"Uruguay","Spagna"]],
  I: [[1,"Francia","Senegal"],[1,"Iraq","Norvegia"],[2,"Francia","Iraq"],[2,"Norvegia","Senegal"],[3,"Norvegia","Francia"],[3,"Senegal","Iraq"]],
  J: [[1,"Argentina","Algeria"],[1,"Austria","Giordania"],[2,"Argentina","Austria"],[2,"Giordania","Algeria"],[3,"Algeria","Austria"],[3,"Giordania","Argentina"]],
  K: [[1,"Portogallo","Congo DR"],[1,"Uzbekistan","Colombia"],[2,"Portogallo","Uzbekistan"],[2,"Colombia","Congo DR"],[3,"Colombia","Portogallo"],[3,"Congo DR","Uzbekistan"]],
  L: [[1,"Inghilterra","Croazia"],[1,"Ghana","Panama"],[2,"Inghilterra","Ghana"],[2,"Panama","Croazia"],[3,"Panama","Inghilterra"],[3,"Croazia","Ghana"]],
};
const MD_DATES = {
  A:["11 giu","18 giu","24 giu"], B:["12-13 giu","18 giu","24 giu"], C:["13 giu","19 giu","24 giu"],
  D:["12-13 giu","19 giu","25 giu"], E:["14 giu","20 giu","25 giu"], F:["14 giu","20 giu","25 giu"],
  G:["15 giu","21 giu","26 giu"], H:["15 giu","21 giu","26 giu"], I:["16 giu","22 giu","26 giu"],
  J:["16 giu","22 giu","27 giu"], K:["17 giu","23 giu","27 giu"], L:["17 giu","23 giu","27 giu"],
};

// Sedicesimi (slot ufficiali FIFA). t: 'w'=1º, 'ru'=2º, '3'=miglior terza (elig=gironi ammessi)
const R32 = [
  { m: 73, a: { t: "ru", g: "A" }, b: { t: "ru", g: "B" } },
  { m: 74, a: { t: "w", g: "E" }, b: { t: "3", elig: ["A","B","C","D","F"] } },
  { m: 75, a: { t: "w", g: "F" }, b: { t: "ru", g: "C" } },
  { m: 76, a: { t: "w", g: "C" }, b: { t: "ru", g: "F" } },
  { m: 77, a: { t: "w", g: "I" }, b: { t: "3", elig: ["C","D","F","G","H"] } },
  { m: 78, a: { t: "ru", g: "E" }, b: { t: "ru", g: "I" } },
  { m: 79, a: { t: "w", g: "A" }, b: { t: "3", elig: ["C","E","F","H","I"] } },
  { m: 80, a: { t: "w", g: "L" }, b: { t: "3", elig: ["E","H","I","J","K"] } },
  { m: 81, a: { t: "w", g: "D" }, b: { t: "3", elig: ["B","E","F","I","J"] } },
  { m: 82, a: { t: "w", g: "G" }, b: { t: "3", elig: ["A","E","H","I","J"] } },
  { m: 83, a: { t: "ru", g: "K" }, b: { t: "ru", g: "L" } },
  { m: 84, a: { t: "w", g: "H" }, b: { t: "ru", g: "J" } },
  { m: 85, a: { t: "w", g: "B" }, b: { t: "3", elig: ["E","F","G","I","J"] } },
  { m: 86, a: { t: "w", g: "J" }, b: { t: "ru", g: "H" } },
  { m: 87, a: { t: "w", g: "K" }, b: { t: "3", elig: ["D","E","I","J","L"] } },
  { m: 88, a: { t: "ru", g: "D" }, b: { t: "ru", g: "G" } },
];
const LATER = {
  89:[74,77], 90:[73,75], 91:[76,78], 92:[79,80], 93:[83,84], 94:[81,82], 95:[86,88], 96:[85,87],
  97:[89,90], 98:[93,94], 99:[91,92], 100:[95,96], 101:[97,98], 102:[99,100], 104:[101,102],
};
const ROUNDS = [
  { name: "Sedicesimi", ms: R32.map(r=>r.m) },
  { name: "Ottavi", ms: [89,90,91,92,93,94,95,96] },
  { name: "Quarti", ms: [97,98,99,100] },
  { name: "Semifinali", ms: [101,102] },
  { name: "Finale", ms: [104] },
];
const DEFAULT_THIRDS = { 74:"A", 77:"G", 79:"C", 80:"I", 81:"E", 82:"J", 85:"F", 87:"L" };
const feedsInto = {};
Object.entries(LATER).forEach(([parent, kids]) => kids.forEach(k => (feedsInto[k] = +parent)));

function diffColor(oppStr) {
  if (oppStr >= 79) return "#ef4444";
  if (oppStr >= 61) return "#f5a524";
  return "#22c55e";
}

function giornataStr(cells, md) {
  const c = cells.find((x) => x.md === md);
  return c?.str ?? null;
}

function diffTier(str) {
  if (str == null) return -1;
  if (str >= 79) return 2;
  if (str >= 61) return 1;
  return 0;
}

function cmpGiornata(a, b, md, dir, deferWithinTier = false) {
  const sa = giornataStr(a.cells, md);
  const sb = giornataStr(b.cells, md);
  if (sa == null && sb == null) return 0;
  if (sa == null) return 1;
  if (sb == null) return -1;
  const ta = diffTier(sa);
  const tb = diffTier(sb);
  if (ta !== tb) return dir === "asc" ? ta - tb : tb - ta;
  if (deferWithinTier) return 0;
  if (sa !== sb) return dir === "asc" ? sa - sb : sb - sa;
  return 0;
}

function sortEqual(a, b) {
  return a.key === b.key && (a.key !== "g" || a.md === b.md);
}

function defaultSortDir(key, stack) {
  if (key === "cr") return stack.length > 0 ? "asc" : "desc";
  return "asc";
}

function clickSortStack(stack, item, remove) {
  const idx = stack.findIndex((s) => sortEqual(s, item));
  if (remove) {
    if (idx < 0) return stack;
    return stack.filter((_, i) => i !== idx);
  }
  if (idx >= 0) {
    const next = [...stack];
    next[idx] = { ...next[idx], dir: next[idx].dir === "asc" ? "desc" : "asc" };
    return next;
  }
  return [...stack, { ...item, dir: defaultSortDir(item.key, stack) }];
}

function findSortEntry(stack, key, md) {
  return stack.find((s) => s.key === key && (key !== "g" || s.md === md));
}

function sortRank(stack, key, md) {
  const idx = stack.findIndex((s) => sortEqual(s, { key, md }));
  return idx >= 0 ? idx + 1 : 0;
}

function compareBySortStack(a, b, stack) {
  for (let i = 0; i < stack.length; i++) {
    const s = stack[i];
    let cmp = 0;
    if (s.key === "cr") {
      if (a.valore !== b.valore) cmp = s.dir === "desc" ? b.valore - a.valore : a.valore - b.valore;
    } else if (s.key === "g") {
      const deferWithinTier = stack.slice(i + 1).some((x) => x.key === "cr");
      cmp = cmpGiornata(a, b, s.md, s.dir, deferWithinTier);
    }
    if (cmp !== 0) return cmp;
  }
  return 0;
}

function renderGCell(cells, md) {
  const c = cells.find((x) => x.md === md);
  if (!c) return <span style={{ color: "var(--mut)", fontSize: 10 }}>—</span>;
  return (
    <span className="wm-dot" title={`G${c.md}: vs ${c.opp} (${c.str})`} style={{ background: diffColor(c.str) }}>
      {c.abbr}
    </span>
  );
}

function PlayerGiornataDots({ p, md, size = 16 }) {
  if (!p?.cells?.length) return null;
  const cells = md != null ? p.cells.filter((c) => c.md === md) : p.cells;
  if (!cells.length) return null;
  return (
    <span className="wm-dots">
      {cells.map((c) => (
        <span
          key={c.md}
          className="wm-dot"
          title={`G${c.md}: vs ${c.opp} (${c.str})`}
          style={{ background: diffColor(c.str), width: size, height: size, fontSize: size <= 16 ? 7 : 8 }}
        >
          {c.abbr}
        </span>
      ))}
    </span>
  );
}

function NatFlagImg({ nazione }) {
  const src = natFlagUrl(nazione);
  if (!src) return <span className="wm-flag-fallback">{nazione}</span>;
  return <img className="wm-flag" src={src} alt="" loading="lazy" decoding="async" />;
}

function FormPlayerSelect({ value, options, placeholder, md, open, onToggle, onClose, onChange, keyFn }) {
  const ref = useRef(null);
  const selected = value ? options.find((p) => keyFn(p) === value) : null;

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, onClose]);

  return (
    <div className="wm-fpsel" ref={ref}>
      <button type="button" className={"wm-fpsel-btn" + (open ? " open" : "")} onClick={onToggle}>
        {selected ? (
          <>
            <NatFlagImg nazione={selected.nazione} />
            <PlayerGiornataDots p={selected} md={md} />
            <span className="wm-fpsel-nm">{selected.nome}</span>
          </>
        ) : (
          <span className="wm-fpsel-ph">{placeholder}</span>
        )}
        <ChevronDown size={14} className="wm-fpsel-chev" />
      </button>
      {open && (
        <div className="wm-fpsel-menu">
          <button
            type="button"
            className="wm-fpsel-opt empty"
            onClick={() => {
              onChange(null);
              onClose();
            }}
          >
            {placeholder}
          </button>
          {options.map((p) => (
            <button
              key={keyFn(p)}
              type="button"
              className={"wm-fpsel-opt" + (value === keyFn(p) ? " on" : "")}
              onClick={() => {
                onChange(keyFn(p));
                onClose();
              }}
            >
              <NatFlagImg nazione={p.nazione} />
              <PlayerGiornataDots p={p} md={md} />
              <span className="wm-fpsel-nm">{p.nome}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
.wm-root{--ink:#0a0e16;--panel:#111726;--panel2:#0d1320;--line:#222c3d;--gold:#fcd34d;--turf:#22c55e;--txt:#e7ecf3;--mut:#8b97aa;
  background:var(--ink);color:var(--txt);font-family:'Archivo',sans-serif;border-radius:18px;overflow:hidden;
  background-image:radial-gradient(circle at 18% -10%,rgba(34,197,94,.10),transparent 45%),radial-gradient(circle at 92% 0%,rgba(252,211,77,.07),transparent 40%);}
.wm-head{padding:22px 22px 14px;border-bottom:1px solid var(--line);position:relative;}
.wm-kick{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:var(--turf);text-transform:uppercase;}
.wm-title{font-family:'Anton',sans-serif;font-size:34px;line-height:.95;letter-spacing:.5px;margin:6px 0 2px;text-transform:uppercase;}
.wm-sub{color:var(--mut);font-size:13px;}
.wm-tabs{display:flex;gap:8px;padding:14px 22px 0;flex-wrap:wrap;}
.wm-tab{display:flex;align-items:center;gap:7px;padding:9px 15px;border:1px solid var(--line);border-radius:999px;background:var(--panel2);
  color:var(--mut);font-weight:600;font-size:13px;cursor:pointer;transition:.15s;}
.wm-tab:hover{color:var(--txt);border-color:var(--turf);}
.wm-tab.on{background:var(--turf);color:#06210f;border-color:var(--turf);}
.wm-body{padding:20px 22px 26px;}
.wm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(245px,1fr));gap:13px;}
.wm-card{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:13px 13px 9px;}
.wm-gtag{font-family:'Anton';font-size:15px;letter-spacing:1px;color:var(--gold);}
.wm-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;border-top:1px dashed #1b2433;}
.wm-row:first-of-type{border-top:none;}
.wm-tname{font-size:13px;font-weight:600;}
.wm-tpos{font-family:'JetBrains Mono';font-size:9px;color:var(--mut);margin-right:5px;}
.wm-dots{display:flex;gap:5px;}
.wm-dot{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;
  font-family:'JetBrains Mono';font-size:8px;font-weight:700;color:#06210f;}
.wm-legend{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;font-size:12px;color:var(--mut);align-items:center;}
.wm-leg{display:flex;align-items:center;gap:6px;}
.wm-pill{width:13px;height:13px;border-radius:4px;}
.wm-panel{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:14px;margin-bottom:16px;}
.wm-ph{font-family:'Anton';font-size:14px;letter-spacing:1px;text-transform:uppercase;margin-bottom:11px;display:flex;align-items:center;gap:8px;color:var(--txt);}
.wm-mini{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;}
.wm-mc{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:9px;}
.wm-mc b{font-family:'Anton';color:var(--gold);font-size:13px;}
.wm-sel{width:100%;margin-top:5px;background:#0a0f1a;color:var(--txt);border:1px solid var(--line);border-radius:7px;
  padding:5px 6px;font-size:11.5px;font-family:'Archivo';cursor:pointer;}
.wm-sel:focus{outline:1px solid var(--turf);}
.wm-flex{display:flex;gap:9px;flex-wrap:wrap;align-items:center;}
.wm-btn{display:flex;align-items:center;gap:7px;padding:9px 14px;border-radius:9px;border:1px solid var(--line);
  background:var(--panel2);color:var(--txt);font-weight:600;font-size:12.5px;cursor:pointer;transition:.15s;}
.wm-btn:hover{border-color:var(--turf);}
.wm-btn.gold{background:var(--gold);color:#3a2c00;border-color:var(--gold);}
.wm-btn.turf{background:var(--turf);color:#06210f;border-color:var(--turf);}
.wm-bracket{display:flex;gap:18px;overflow-x:auto;padding:6px 2px 14px;}
.wm-col{display:flex;flex-direction:column;gap:9px;min-width:188px;}
.wm-coln{font-family:'JetBrains Mono';font-size:10px;letter-spacing:2px;color:var(--mut);text-transform:uppercase;margin-bottom:2px;}
.wm-match{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;transition:.15s;}
.wm-match.path{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),0 0 22px rgba(252,211,77,.18);}
.wm-mnum{font-family:'JetBrains Mono';font-size:8.5px;color:var(--mut);padding:4px 8px 2px;display:flex;justify-content:space-between;}
.wm-team{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:7px 9px;cursor:pointer;border-top:1px solid #1a2231;transition:.12s;}
.wm-team:hover{background:#16203100;background-color:#152033;}
.wm-team.win{background:linear-gradient(90deg,rgba(34,197,94,.16),transparent);}
.wm-team.focus{background:linear-gradient(90deg,rgba(252,211,77,.18),transparent);}
.wm-team .nm{font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:7px;}
.wm-team.win .nm{color:#7af0a0;}
.wm-team .ab{font-family:'JetBrains Mono';font-size:9px;color:var(--mut);}
.wm-sdot{width:7px;height:7px;border-radius:50%;flex:none;}
.wm-empty{padding:8px 9px;font-size:11px;color:var(--mut);font-style:italic;}
.wm-pathbox{background:var(--panel2);border:1px solid var(--gold);border-radius:11px;padding:12px 14px;margin-bottom:16px;}
.wm-pathbox h4{font-family:'Anton';color:var(--gold);font-size:14px;letter-spacing:1px;margin:0 0 4px;}
.wm-pathline{font-size:12.5px;color:var(--mut);line-height:1.7;}
.wm-pathline b{color:var(--txt);}
.wm-note{font-size:11.5px;color:var(--mut);margin-top:4px;line-height:1.6;}
.wm-filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px;}
.wm-fchip{padding:6px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel2);font-size:11.5px;font-weight:600;color:var(--mut);cursor:pointer;transition:.15s;}
.wm-fchip:hover,.wm-fchip.on{color:var(--txt);border-color:var(--turf);}
.wm-fchip.on{background:rgba(34,197,94,.12);color:#7af0a0;border-color:var(--turf);}
.wm-freset{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:999px;border:1px dashed var(--line);background:transparent;font-size:11.5px;font-weight:600;color:var(--mut);cursor:pointer;transition:.15s;}
.wm-freset:hover:not(:disabled){color:var(--txt);border-color:var(--mut);}
.wm-freset:disabled{opacity:.35;cursor:default;}
.wm-search{display:flex;align-items:center;gap:7px;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:7px 11px;min-width:200px;}
.wm-search input{background:transparent;border:none;outline:none;color:var(--txt);font-size:12.5px;width:100%;font-family:'Archivo';}
.wm-table{width:100%;border-collapse:collapse;font-size:12px;}
.wm-table th{font-family:'JetBrains Mono';font-size:9px;letter-spacing:1px;color:var(--mut);text-transform:uppercase;text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--panel);z-index:1;}
.wm-th-sort{cursor:pointer;user-select:none;white-space:nowrap;}
.wm-th-sort:hover{color:var(--txt);}
.wm-th-sort.on{color:var(--gold);}
.wm-th-g{text-align:center;width:42px;}
.wm-sort-n{font-size:9px;opacity:.75;margin-left:1px;}
.wm-table td{padding:7px 10px;border-bottom:1px solid #1a2231;vertical-align:middle;}
.wm-table tr:hover td{background:#152033;}
.wm-pname{font-weight:600;font-size:12.5px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.wm-sp-badges{display:inline-flex;align-items:center;gap:3px;}
.wm-sp-ico{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;flex:none;}
.wm-sp-ico.rig{background:#fcd34d22;color:#fcd34d;}
.wm-sp-ico.pun{background:#60a5fa22;color:#60a5fa;}
.wm-sp-ico.ang{background:#2dd4bf22;color:#2dd4bf;}
.wm-pmeta{font-size:10px;color:var(--mut);}
.wm-team-badge{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--txt);font-weight:600;}
.wm-team-badge.compact{font-size:10.5px;}
.wm-flag{width:20px;height:14px;object-fit:cover;border-radius:2px;box-shadow:0 0 0 1px rgba(255,255,255,.12);flex:none;display:block;}
.wm-flag-fallback{font-family:'JetBrains Mono';font-size:9px;color:var(--mut);padding:1px 4px;border:1px solid var(--line);border-radius:3px;flex:none;}
.wm-tteam{white-space:nowrap;}
.wm-fascia{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;white-space:nowrap;}
.wm-fdot{width:7px;height:7px;border-radius:50%;flex:none;}
.wm-tscroll{overflow:auto;max-height:68vh;border:1px solid var(--line);border-radius:11px;}
.wm-stat{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;}
.wm-stat span{font-size:11.5px;color:var(--mut);padding:4px 10px;background:var(--panel2);border-radius:7px;border:1px solid var(--line);}
.wm-stat b{color:var(--txt);}
.wm-budget{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:14px;}
.wm-bnum{display:flex;flex-direction:column;line-height:1.1;}
.wm-bnum b{font-family:'Anton';font-size:26px;}
.wm-bnum span{font-size:10px;color:var(--mut);letter-spacing:1px;text-transform:uppercase;font-family:'JetBrains Mono';}
.wm-bar{flex:1;min-width:160px;height:10px;background:var(--panel2);border:1px solid var(--line);border-radius:999px;overflow:hidden;}
.wm-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--turf),var(--gold));transition:width .25s;}
.wm-roles{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-bottom:16px;}
.wm-rcol{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:10px;}
.wm-rh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.wm-rh b{font-family:'Anton';font-size:14px;letter-spacing:1px;color:var(--gold);}
.wm-rh span{font-family:'JetBrains Mono';font-size:10px;color:var(--mut);}
.wm-slot{display:flex;align-items:center;gap:7px;padding:5px 7px;border-radius:7px;border:1px solid #1a2231;margin-bottom:5px;background:var(--panel);}
.wm-slot .nm{font-size:12px;font-weight:600;flex:1;min-width:0;overflow:hidden;line-height:1.35;}
.wm-slot .nm > span:first-child{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wm-slot .cr{font-family:'JetBrains Mono';font-size:11px;font-weight:700;}
.wm-slot .x{cursor:pointer;color:var(--mut);display:flex;}
.wm-slot .x:hover{color:#ef4444;}
.wm-slot.empty{justify-content:center;color:var(--mut);font-size:11px;font-style:italic;border-style:dashed;background:transparent;}
.wm-addbtn{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:6px;border:1px solid var(--turf);background:rgba(34,197,94,.12);color:#7af0a0;font-size:11px;font-weight:700;cursor:pointer;}
.wm-addbtn:hover{background:rgba(34,197,94,.22);}
.wm-addbtn:disabled{opacity:.35;cursor:not-allowed;border-color:var(--line);color:var(--mut);background:transparent;}
.wm-sp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:13px;}
.wm-sp-card{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:13px;}
.wm-sp-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--line);}
.wm-sp-gtag{font-family:'JetBrains Mono';font-size:9px;color:var(--mut);letter-spacing:1px;}
.wm-sp-row{margin-bottom:9px;}
.wm-sp-row:last-child{margin-bottom:0;}
.wm-sp-lbl{font-family:'JetBrains Mono';font-size:9px;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;font-weight:700;}
.wm-sp-list{list-style:none;margin:0;padding:0;}
.wm-sp-list li{font-size:12px;padding:3px 0;display:flex;justify-content:space-between;gap:8px;border-bottom:1px dashed #1a2231;}
.wm-sp-list li:last-child{border-bottom:none;}
.wm-sp-list .ord{font-family:'JetBrains Mono';font-size:9px;color:var(--mut);width:14px;flex:none;}
.wm-sp-list .cr{font-family:'JetBrains Mono';font-size:10px;color:var(--gold);flex:none;}
.wm-sp-layout{display:grid;grid-template-columns:minmax(220px,280px) 1fr;gap:14px;min-height:420px;}
@media(max-width:820px){.wm-sp-layout{grid-template-columns:1fr;}}
.wm-sp-sidebar{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:10px;display:flex;flex-direction:column;max-height:70vh;}
.wm-sp-sbtitle{font-family:'JetBrains Mono';font-size:9px;letter-spacing:1px;color:var(--mut);text-transform:uppercase;margin:8px 0 6px;}
.wm-sp-sbtitle:first-child{margin-top:0;}
.wm-sp-gchips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px;}
.wm-sp-gchip{padding:5px 10px;border-radius:7px;border:1px solid var(--line);background:var(--panel);font-family:'Anton';font-size:12px;letter-spacing:1px;color:var(--mut);cursor:pointer;transition:.12s;}
.wm-sp-gchip:hover,.wm-sp-gchip.on{color:var(--gold);border-color:var(--gold);background:rgba(252,211,77,.08);}
.wm-sp-teamlist{overflow:auto;flex:1;display:flex;flex-direction:column;gap:4px;margin-top:4px;}
.wm-sp-teambtn{display:flex;align-items:center;gap:8px;width:100%;padding:7px 9px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--txt);cursor:pointer;text-align:left;transition:.12s;}
.wm-sp-teambtn:hover{background:#152033;border-color:#1a2231;}
.wm-sp-teambtn.on{background:rgba(34,197,94,.1);border-color:var(--turf);}
.wm-sp-teambtn .meta{margin-left:auto;display:flex;gap:3px;flex:none;}
.wm-sp-mini{width:7px;height:7px;border-radius:3px;flex:none;}
.wm-sp-detail{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:16px;min-height:320px;}
.wm-sp-dhead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--line);flex-wrap:wrap;}
.wm-sp-dhead h3{margin:0;font-family:'Anton';font-size:20px;letter-spacing:.5px;text-transform:uppercase;}
.wm-sp-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:700px){.wm-sp-cols{grid-template-columns:1fr;}}
.wm-sp-col{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px;}
.wm-sp-col-hd{display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono';font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin-bottom:10px;padding-bottom:8px;border-bottom:1px dashed #1a2231;}
.wm-sp-empty{color:var(--mut);font-size:13px;font-style:italic;padding:24px;text-align:center;}
.wm-form-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;}
.wm-form-ctrl{display:flex;flex-direction:column;gap:4px;}
.wm-form-ctrl label{font-family:'JetBrains Mono';font-size:9px;letter-spacing:1px;color:var(--mut);text-transform:uppercase;}
.wm-form-ctrl select{min-width:140px;background:#0a0f1a;color:var(--txt);border:1px solid var(--line);border-radius:7px;padding:8px 10px;font-size:12px;}
.wm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:900px){.wm-form-grid{grid-template-columns:1fr;}}
.wm-form-col{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:12px;}
.wm-form-col h4{margin:0 0 10px;font-family:'Anton';font-size:13px;letter-spacing:1px;color:var(--gold);text-transform:uppercase;}
.wm-form-slot{display:grid;grid-template-columns:42px 1fr;gap:8px;align-items:center;padding:6px 8px;border-bottom:1px solid #1a2231;border-radius:8px;margin-bottom:2px;}
.wm-form-slot:last-child{border-bottom:none;}
.wm-form-slot.role-p{background:rgba(252,211,77,.07);border-left:3px solid #fcd34d;}
.wm-form-slot.role-d{background:rgba(59,130,246,.08);border-left:3px solid #3b82f6;}
.wm-form-slot.role-c{background:rgba(34,197,94,.08);border-left:3px solid #22c55e;}
.wm-form-slot.role-a{background:rgba(239,68,68,.08);border-left:3px solid #ef4444;}
.wm-form-pos{font-family:'Anton';font-size:16px;font-weight:700;text-align:center;line-height:1;}
.wm-form-pos.p{color:#fcd34d;}
.wm-form-pos.d{color:#3b82f6;}
.wm-form-pos.c{color:#22c55e;}
.wm-form-pos.a{color:#ef4444;}
.wm-form-role{font-family:'Anton';font-size:11px;width:18px;height:18px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex:none;}
.wm-form-role.p{background:rgba(252,211,77,.2);color:#fcd34d;}
.wm-form-role.d{background:rgba(59,130,246,.2);color:#3b82f6;}
.wm-form-role.c{background:rgba(34,197,94,.2);color:#22c55e;}
.wm-form-role.a{background:rgba(239,68,68,.2);color:#ef4444;}
.wm-form-pick{display:flex;flex-direction:column;gap:5px;min-width:0;}
.wm-fpsel{position:relative;width:100%;}
.wm-fpsel-btn{width:100%;display:flex;align-items:center;gap:6px;padding:6px 8px;background:#0a0f1a;border:1px solid var(--line);border-radius:7px;color:var(--txt);font-size:11px;cursor:pointer;text-align:left;}
.wm-fpsel-btn.open,.wm-fpsel-btn:hover{border-color:var(--turf);}
.wm-fpsel-ph{color:var(--mut);flex:1;}
.wm-fpsel-nm{flex:1;min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.wm-fpsel-chev{color:var(--mut);flex:none;margin-left:auto;}
.wm-fpsel-menu{position:absolute;z-index:30;top:calc(100% + 4px);left:0;right:0;max-height:240px;overflow-y:auto;background:#0a0f1a;border:1px solid var(--line);border-radius:7px;box-shadow:0 10px 28px rgba(0,0,0,.45);}
.wm-fpsel-opt{width:100%;display:flex;align-items:center;gap:8px;padding:7px 10px;border:none;background:transparent;color:var(--txt);font-size:11px;cursor:pointer;text-align:left;}
.wm-fpsel-opt:hover,.wm-fpsel-opt.on{background:rgba(34,197,94,.12);}
.wm-fpsel-opt.empty{color:var(--mut);font-style:italic;border-bottom:1px solid var(--line);}
.wm-bench-main{display:flex;align-items:center;gap:6px;flex:1;min-width:0;}
.wm-bench-row{display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px dashed #1a2231;}
.wm-bench-row:last-child{border-bottom:none;}
.wm-bench-ord{font-family:'JetBrains Mono';font-size:9px;color:var(--mut);width:18px;flex:none;}
.wm-bench-nm{flex:1;min-width:0;font-size:12px;font-weight:600;}
.wm-bench-nm .sub{font-size:10px;color:var(--mut);font-weight:500;}
.wm-bench-actions{display:flex;gap:2px;flex:none;}
.wm-proj-intro{color:var(--mut);font-size:12.5px;line-height:1.55;margin:0 0 14px;}
.wm-proj-gr{font-family:'Anton';font-size:13px;color:var(--gold);letter-spacing:.5px;}
.wm-proj-gironi{display:flex;flex-direction:column;gap:20px;}
.wm-proj-gblock{background:var(--panel2);border:1px solid var(--line);border-radius:11px;padding:12px;}
.wm-proj-gtit{margin:0 0 10px;font-family:'Anton';font-size:14px;letter-spacing:.5px;color:var(--turf);text-transform:uppercase;}
.wm-proj-nota{margin:10px 0 0;color:var(--mut);font-size:12px;line-height:1.55;}
.wm-proj-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;}
.wm-proj-gcell{display:flex;flex-direction:column;gap:2px;line-height:1.3;}
.wm-proj-avv{color:var(--mut);font-size:10px;}
.wm-proj-val{font-size:12px;}
.wm-proj-sub{color:var(--mut);font-size:9px;font-family:'JetBrains Mono';}
.wm-table-compact td,.wm-table-compact th{padding:5px 8px;}
.wm-iconbtn{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--mut);cursor:pointer;}
.wm-iconbtn:hover{color:var(--txt);border-color:var(--turf);}
.wm-iconbtn:disabled{opacity:.3;cursor:default;}
`;

/* ---------------- COMPONENT ---------------- */
export default function SimulatoreMondiale() {
  const [tab, setTab] = useState("cal");
  const [place, setPlace] = useState(() => {
    const o = {};
    Object.entries(GROUPS).forEach(([g, t]) => (o[g] = [...t]));
    return o;
  });
  const [thirds, setThirds] = useState({ ...DEFAULT_THIRDS });
  const [winners, setWinners] = useState({});
  const [focus, setFocus] = useState("");
  const [fantaRuolo, setFantaRuolo] = useState("all");
  const [fantaFascia, setFantaFascia] = useState("all");
  const [fantaSearch, setFantaSearch] = useState("");
  const [fantaSorts, setFantaSorts] = useState([]);
  const [rosa, setRosa] = useState(emptyRosa);
  const [rosaRuolo, setRosaRuolo] = useState("portieri");
  const [rosaSearch, setRosaSearch] = useState("");
  const [rosaSorts, setRosaSorts] = useState([]);
  const [rosaSavedMsg, setRosaSavedMsg] = useState("");
  const [formStore, setFormStore] = useState(emptyFormazioniStore);
  const [formMd, setFormMd] = useState(1);
  const [formSavedMsg, setFormSavedMsg] = useState("");
  const [formPickerOpen, setFormPickerOpen] = useState(null);
  const [piazzatiSearch, setPiazzatiSearch] = useState("");
  const [piazzatiGroup, setPiazzatiGroup] = useState("A");
  const [piazzatiTeam, setPiazzatiTeam] = useState(null);

  // ---- slot resolver ----
  const resolveSlot = useMemo(() => {
    return (slot, win) => {
      if (!slot) return null;
      if (slot.t === "w") return place[slot.g][0];
      if (slot.t === "ru") return place[slot.g][1];
      if (slot.t === "3") {
        const g = thirds[slot._m];
        return g ? place[g][2] : null;
      }
      return null;
    };
  }, [place, thirds]);

  // teams of any match (73..104) with current winners
  const matchTeams = useMemo(() => {
    const cache = {};
    const get = (m) => {
      if (cache[m]) return cache[m];
      let A = null, B = null;
      const def = R32.find((r) => r.m === m);
      if (def) {
        const sa = { ...def.a, _m: m }, sb = { ...def.b, _m: m };
        A = resolveSlot(sa); B = resolveSlot(sb);
      } else if (LATER[m]) {
        const [p, q] = LATER[m];
        A = win(p); B = win(q);
      }
      cache[m] = [A, B];
      return cache[m];
    };
    const win = (m) => {
      const [A, B] = get(m);
      const w = winners[m];
      if (w && (w === A || w === B)) return w;
      return null;
    };
    return { get, win };
  }, [resolveSlot, winners]);

  const setPos = (g, pos, team) => {
    setPlace((prev) => {
      const arr = [...prev[g]];
      const cur = arr.indexOf(team);
      const tmp = arr[pos];
      arr[pos] = team; arr[cur] = tmp;
      return { ...prev, [g]: arr };
    });
    setWinners({});
  };

  const pickWinner = (m, team) => {
    if (!team) return;
    setWinners((prev) => {
      const n = { ...prev };
      if (n[m] === team) delete n[m]; else n[m] = team;
      return n;
    });
  };

  const autoFill = () => {
    const newPlace = {};
    Object.entries(GROUPS).forEach(([g, teams]) => {
      newPlace[g] = simulateGroupStandings(g, teams, FIXTURES);
    });
    const thirdsMap = pickThirdSlots(newPlace, R32);
    setPlace(newPlace);
    setThirds(thirdsMap);

    const resolveLocal = (slot, m) => {
      if (slot.t === "w") return newPlace[slot.g][0];
      if (slot.t === "ru") return newPlace[slot.g][1];
      if (slot.t === "3") {
        const tg = thirdsMap[m];
        return tg ? newPlace[tg][2] : null;
      }
      return null;
    };

    const w = {};
    const all = [...R32.map((r) => r.m), ...Object.keys(LATER).map(Number)].sort((a, b) => a - b);
    all.forEach((m) => {
      const def = R32.find((r) => r.m === m);
      let A = null;
      let B = null;
      if (def) {
        A = resolveLocal(def.a, m);
        B = resolveLocal(def.b, m);
      } else {
        const [p, q] = LATER[m];
        A = w[p] || null;
        B = w[q] || null;
      }
      if (A && B) w[m] = (STR[A] || 0) >= (STR[B] || 0) ? A : B;
      else w[m] = A || B || null;
    });
    setWinners(w);
  };

  const resetAll = () => {
    const o = {};
    Object.entries(GROUPS).forEach(([g, t]) => (o[g] = [...t]));
    setPlace(o); setThirds({ ...DEFAULT_THIRDS }); setWinners({});
  };

  // focus path
  const pathMatches = useMemo(() => {
    if (!focus) return new Set();
    let start = null;
    for (const r of R32) {
      const [A, B] = matchTeams.get(r.m);
      if (A === focus || B === focus) { start = r.m; break; }
    }
    const set = new Set();
    let cur = start;
    while (cur) { set.add(cur); cur = feedsInto[cur]; }
    return set;
  }, [focus, matchTeams]);

  const pathInfo = useMemo(() => {
    if (!focus || pathMatches.size === 0) return null;
    const opps = [];
    [...pathMatches].sort((a, b) => a - b).forEach((m) => {
      const [A, B] = matchTeams.get(m);
      const opp = A === focus ? B : B === focus ? A : null;
      // opp solo valido se 'focus' è effettivamente uno dei due
      if ((A === focus || B === focus) && opp) opps.push({ m, opp });
    });
    const known = opps.filter((o) => STR[o.opp]);
    const avg = known.length ? Math.round(known.reduce((s, o) => s + STR[o.opp], 0) / known.length) : null;
    return { opps, avg };
  }, [focus, pathMatches, matchTeams]);

  const listonePlayers = useMemo(
    () => buildListone(GROUPS, FIXTURES, STR, ABBR),
    []
  );

  const fantaFiltered = useMemo(() => {
    const q = fantaSearch.trim().toLowerCase();
    return listonePlayers
      .filter((p) => fantaRuolo === "all" || p.ruolo === fantaRuolo)
      .filter((p) => fantaFascia === "all" || p.fascia === fantaFascia)
      .filter((p) => !q || p.nome.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.nazione.toLowerCase().includes(q))
      .sort((a, b) => {
        const cmp = compareBySortStack(a, b, fantaSorts);
        if (cmp !== 0) return cmp;
        if (fantaSorts.length === 0) {
          const fa = FASCIA_ORDER.indexOf(a.fascia) - FASCIA_ORDER.indexOf(b.fascia);
          if (fa !== 0) return fa;
          if (b.valore !== a.valore) return b.valore - a.valore;
        }
        return a.nome.localeCompare(b.nome);
      });
  }, [listonePlayers, fantaRuolo, fantaFascia, fantaSearch, fantaSorts]);

  const fantaStats = useMemo(() => {
    const s = {};
    FASCIA_ORDER.forEach((f) => (s[f] = 0));
    listonePlayers.forEach((p) => s[p.fascia]++);
    return s;
  }, [listonePlayers]);

  const playerByKey = useMemo(() => {
    const m = new Map();
    listonePlayers.forEach((p) => m.set(`${p.ruolo}|${p.nome}|${p.nazione}`, p));
    return m;
  }, [listonePlayers]);

  useEffect(() => {
    if ((tab !== "rosa" && tab !== "form") || !listonePlayers.length) return;
    let cancelled = false;
    loadRosaFromFile(playerByKey).then((data) => {
      if (!cancelled) setRosa(data);
    });
    return () => {
      cancelled = true;
    };
  }, [tab, listonePlayers, playerByKey]);

  useEffect(() => {
    if (tab !== "form" || !listonePlayers.length) return;
    let cancelled = false;
    loadFormazioniFromFile(playerByKey).then((data) => {
      if (!cancelled) setFormStore(data);
    });
    return () => {
      cancelled = true;
    };
  }, [tab, listonePlayers, playerByKey]);

  useEffect(() => {
    setFormPickerOpen(null);
  }, [formMd, formStore.giornate[String(formMd)]?.modulo]);

  const pkey = (p) => `${p.ruolo}|${p.nome}|${p.nazione}`;
  const rosaKeys = useMemo(() => {
    const s = new Set();
    Object.values(rosa).forEach((arr) => arr.forEach((p) => s.add(pkey(p))));
    return s;
  }, [rosa]);

  const rosaSpent = useMemo(
    () => Object.values(rosa).reduce((s, arr) => s + arr.reduce((x, p) => x + p.valore, 0), 0),
    [rosa]
  );
  const rosaCount = useMemo(
    () => Object.values(rosa).reduce((s, arr) => s + arr.length, 0),
    [rosa]
  );
  const rosaRemaining = ROSA_BUDGET - rosaSpent;

  const addToRosa = (p) => {
    setRosa((prev) => {
      if (prev[p.ruolo].length >= ROSA_LIMITS[p.ruolo]) return prev;
      if (prev[p.ruolo].some((x) => pkey(x) === pkey(p))) return prev;
      return { ...prev, [p.ruolo]: [...prev[p.ruolo], p] };
    });
  };
  const removeFromRosa = (p) => {
    setRosa((prev) => ({ ...prev, [p.ruolo]: prev[p.ruolo].filter((x) => pkey(x) !== pkey(p)) }));
  };
  const saveRosa = () => {
    saveRosaToFile(rosa)
      .then(() => {
        setRosaSavedMsg("Rosa salvata in rosa.json sul disco.");
        setTimeout(() => setRosaSavedMsg(""), 2500);
      })
      .catch(() => {
        setRosaSavedMsg("Errore: impossibile scrivere rosa.json. Avvia con npm run dev.");
        setTimeout(() => setRosaSavedMsg(""), 4000);
      });
  };
  const clearRosa = () => {
    const blank = emptyRosa();
    setRosa(blank);
    saveRosaToFile(blank)
      .then(() => {
        setRosaSavedMsg("Rosa svuotata e rosa.json aggiornato.");
        setTimeout(() => setRosaSavedMsg(""), 2500);
      })
      .catch(() => {
        setRosaSavedMsg("Errore: impossibile aggiornare rosa.json.");
        setTimeout(() => setRosaSavedMsg(""), 4000);
      });
  };

  const rosaFlat = useMemo(() => Object.values(rosa).flat(), [rosa]);
  const formDayKey = String(formMd);
  const formDay = formStore.giornate[formDayKey] || emptyFormDay();
  const formSlots = SLOT_POSITIONS[formDay.modulo] || SLOT_POSITIONS["4-3-3"];

  const setFormModulo = (modulo) => {
    setFormStore((prev) => ({
      ...prev,
      giornate: {
        ...prev.giornate,
        [formDayKey]: { ...prev.giornate[formDayKey], modulo, titolari: Array(11).fill(null) },
      },
    }));
  };

  const setFormTitolare = (slot, key) => {
    const player = key ? rosaFlat.find((p) => pkey(p) === key) : null;
    setFormStore((prev) => {
      const day = prev.giornate[formDayKey];
      const titolari = [...day.titolari];
      titolari[slot] = player;
      return { ...prev, giornate: { ...prev.giornate, [formDayKey]: { ...day, titolari } } };
    });
  };

  const addToPanchina = (p) => {
    setFormStore((prev) => {
      const day = prev.giornate[formDayKey];
      if (day.panchina.some((x) => pkey(x) === pkey(p))) return prev;
      if (day.titolari.some((x) => x && pkey(x) === pkey(p))) return prev;
      return {
        ...prev,
        giornate: { ...prev.giornate, [formDayKey]: { ...day, panchina: [...day.panchina, p] } },
      };
    });
  };

  const removeFromPanchina = (p) => {
    setFormStore((prev) => {
      const day = prev.giornate[formDayKey];
      return {
        ...prev,
        giornate: {
          ...prev.giornate,
          [formDayKey]: { ...day, panchina: day.panchina.filter((x) => pkey(x) !== pkey(p)) },
        },
      };
    });
  };

  const movePanchina = (idx, dir) => {
    setFormStore((prev) => {
      const day = prev.giornate[formDayKey];
      const panchina = [...day.panchina];
      const j = idx + dir;
      if (j < 0 || j >= panchina.length) return prev;
      [panchina[idx], panchina[j]] = [panchina[j], panchina[idx]];
      return { ...prev, giornate: { ...prev.giornate, [formDayKey]: { ...day, panchina } } };
    });
  };

  const saveFormazione = () => {
    saveFormazioniToFile(formStore)
      .then(() => {
        setFormSavedMsg(`Formazione G${formMd} salvata in formazioni_giornate.json.`);
        setTimeout(() => setFormSavedMsg(""), 2500);
      })
      .catch(() => {
        setFormSavedMsg("Errore: impossibile scrivere formazioni_giornate.json. Avvia con npm run dev.");
        setTimeout(() => setFormSavedMsg(""), 4000);
      });
  };

  const valoreByNatNome = useMemo(() => {
    const m = new Map();
    listonePlayers.forEach((p) => m.set(`${p.nazione}|${p.nome}`, p.valore));
    return m;
  }, [listonePlayers]);

  const piazzatiQ = piazzatiSearch.trim().toLowerCase();
  const piazzatiTeams = useMemo(() => {
    const out = [];
    Object.entries(GROUPS).forEach(([g, teams]) => {
      if (piazzatiGroup !== "all" && g !== piazzatiGroup) return;
      teams.forEach((team) => {
        const nat = TEAM_TO_NAT[team];
        const sp = SET_PIECES[nat];
        if (piazzatiQ) {
          const names = sp ? [...sp.rigoristi, ...sp.punizioni, ...sp.angoli].join(" ").toLowerCase() : "";
          if (!team.toLowerCase().includes(piazzatiQ) && !names.includes(piazzatiQ)) return;
        }
        out.push({ team, group: g, nat, sp });
      });
    });
    return out;
  }, [piazzatiGroup, piazzatiQ]);

  useEffect(() => {
    if (!piazzatiTeams.length) {
      setPiazzatiTeam(null);
      return;
    }
    if (!piazzatiTeam || !piazzatiTeams.some((t) => t.team === piazzatiTeam)) {
      setPiazzatiTeam(piazzatiTeams[0].team);
    }
  }, [piazzatiTeams, piazzatiTeam]);

  const rosaPickList = useMemo(() => {
    const q = rosaSearch.trim().toLowerCase();
    return listonePlayers
      .filter((p) => p.ruolo === rosaRuolo)
      .filter((p) => !q || p.nome.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
      .sort((a, b) => {
        const cmp = compareBySortStack(a, b, rosaSorts);
        if (cmp !== 0) return cmp;
        if (rosaSorts.length === 0) {
          const fa = FASCIA_ORDER.indexOf(a.fascia) - FASCIA_ORDER.indexOf(b.fascia);
          if (fa !== 0) return fa;
          if (b.valore !== a.valore) return b.valore - a.valore;
        }
        return a.nome.localeCompare(b.nome);
      });
  }, [listonePlayers, rosaRuolo, rosaSearch, rosaSorts]);

  const fantaFiltersActive = fantaSearch.trim() !== "" || fantaRuolo !== "all" || fantaFascia !== "all" || fantaSorts.length > 0;
  const rosaFiltersActive = rosaSearch.trim() !== "" || rosaRuolo !== "portieri" || rosaSorts.length > 0;

  const resetFantaFilters = () => {
    setFantaSearch("");
    setFantaRuolo("all");
    setFantaFascia("all");
    setFantaSorts([]);
  };

  const resetRosaFilters = () => {
    setRosaSearch("");
    setRosaRuolo("portieri");
    setRosaSorts([]);
  };

  const matchRoundName = (m) => {
    if (m <= 88) return "Sedicesimi";
    if (m <= 96) return "Ottavi";
    if (m <= 100) return "Quarti";
    if (m <= 102) return "Semifinale";
    return "Finale";
  };

  /* ---- RENDER: calendar ---- */
  const calendarView = (
    <div>
      <div className="wm-legend">
        <span style={{ fontWeight: 700, color: "var(--txt)" }}>Difficoltà partita:</span>
        <span className="wm-leg"><span className="wm-pill" style={{ background: "#22c55e" }} /> facile</span>
        <span className="wm-leg"><span className="wm-pill" style={{ background: "#f5a524" }} /> media</span>
        <span className="wm-leg"><span className="wm-pill" style={{ background: "#ef4444" }} /> dura</span>
        <span style={{ color: "var(--mut)" }}>· la sigla nel pallino è l'avversario di quella giornata (G1/G2/G3)</span>
      </div>
      <div className="wm-grid">
        {Object.keys(GROUPS).map((g) => (
          <div className="wm-card" key={g}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span className="wm-gtag">GIRONE {g}</span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 8.5, color: "var(--mut)" }}>
                {MD_DATES[g].join(" · ")}
              </span>
            </div>
            {GROUPS[g].map((team) => {
              const fx = FIXTURES[g];
              const cells = [1, 2, 3].map((md) => {
                const match = fx.find((f) => f[0] === md && (f[1] === team || f[2] === team));
                const opp = match ? (match[1] === team ? match[2] : match[1]) : null;
                return { md, opp, str: opp ? STR[opp] : 0 };
              });
              return (
                <div className="wm-row" key={team}>
                  <span className="wm-tname">{team}</span>
                  <span className="wm-dots">
                    {cells.map((c) => (
                      <span key={c.md} className="wm-dot" title={`G${c.md}: ${c.opp}`}
                        style={{ background: diffColor(c.str) }}>
                        {ABBR[c.opp]}
                      </span>
                    ))}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const fasciaMeta = (id) => FASCE.find((f) => f.id === id) || FASCE[5];

  /* ---- RENDER: fantamondiale ---- */
  const fantamondialeView = (
    <div>
      <div className="wm-legend">
        <span style={{ fontWeight: 700, color: "var(--txt)" }}>Fasce (strategia 250 cr · plusvalenze):</span>
        {FASCE.map((f) => (
          <span className="wm-leg" key={f.id}>
            <span className="wm-pill" style={{ background: f.color }} /> {f.label}
            <span style={{ opacity: 0.7 }}> — {f.hint}</span>
          </span>
        ))}
      </div>
      <div className="wm-legend">
        <span style={{ fontWeight: 700, color: "var(--txt)" }}>Calci piazzati:</span>
        {setPieceLegend}
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><Star size={15} color="var(--gold)" /> Listone Fantamondiale</div>
        <div className="wm-stat">
          {FASCE.map((f) => (
            <span key={f.id}><b style={{ color: f.color }}>{fantaStats[f.id]}</b> {f.label}</span>
          ))}
          <span><b>{fantaFiltered.length}</b> visibili / {listonePlayers.length} giocatori</span>
        </div>

        <div className="wm-filters">
          <div className="wm-search">
            <Search size={14} color="var(--mut)" />
            <input placeholder="Cerca giocatore, nazione…" value={fantaSearch} onChange={(e) => setFantaSearch(e.target.value)} />
          </div>
          {["all", "portieri", "difensori", "centrocampisti", "attaccanti"].map((r) => (
            <span key={r} className={"wm-fchip" + (fantaRuolo === r ? " on" : "")} onClick={() => setFantaRuolo(r)}>
              {r === "all" ? "Tutti" : r === "portieri" ? "POR" : r === "difensori" ? "DIF" : r === "centrocampisti" ? "CEN" : "ATT"}
            </span>
          ))}
          <span style={{ color: "var(--line)" }}>|</span>
          <span className={"wm-fchip" + (fantaFascia === "all" ? " on" : "")} onClick={() => setFantaFascia("all")}>Tutte le fasce</span>
          {FASCE.map((f) => (
            <span key={f.id} className={"wm-fchip" + (fantaFascia === f.id ? " on" : "")} onClick={() => setFantaFascia(f.id)} style={fantaFascia === f.id ? { borderColor: f.color, color: f.color } : {}}>
              {f.label}
            </span>
          ))}
          <button type="button" className="wm-freset" disabled={!fantaFiltersActive} onClick={resetFantaFilters} title="Reset ricerca, filtri e ordinamenti">
            <RotateCcw size={12} /> Reset filtri
          </button>
        </div>

        <div className="wm-tscroll">
          <table className="wm-table">
            <thead>
              <tr>
                <th>Giocatore</th>
                <th>Ruolo</th>
                <th
                  className={"wm-th-sort" + (findSortEntry(fantaSorts, "cr") ? " on" : "")}
                  onClick={(e) => setFantaSorts((s) => clickSortStack(s, { key: "cr" }, e.shiftKey))}
                  title="Clic: aggiungi/inverti crediti · Shift+clic: rimuovi · Con G attivo: spareggia dentro facile/medio/difficile"
                >
                  Cr {(() => {
                    const e = findSortEntry(fantaSorts, "cr");
                    const r = sortRank(fantaSorts, "cr");
                    return <>{e ? (e.dir === "desc" ? "↓" : "↑") : "↕"}{fantaSorts.length > 1 && r ? <span className="wm-sort-n">{r}</span> : null}</>;
                  })()}
                </th>
                <th>Fascia</th>
                {[1, 2, 3].map((md) => (
                  <th
                    key={md}
                    className={"wm-th-sort wm-th-g" + (findSortEntry(fantaSorts, "g", md) ? " on" : "")}
                    onClick={(e) => setFantaSorts((s) => clickSortStack(s, { key: "g", md }, e.shiftKey))}
                    title="Clic: aggiungi/inverti G · Shift+clic: rimuovi · Con Cr attivo: raggruppa per facile/medio/difficile"
                  >
                    G{md}{(() => {
                      const e = findSortEntry(fantaSorts, "g", md);
                      const r = sortRank(fantaSorts, "g", md);
                      return <>{e ? (e.dir === "asc" ? " ↑" : " ↓") : ""}{fantaSorts.length > 1 && r ? <span className="wm-sort-n">{r}</span> : null}</>;
                    })()}
                  </th>
                ))}
                <th>Pos</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {fantaFiltered.map((p) => {
                const fm = fasciaMeta(p.fascia);
                return (
                  <tr key={`${p.ruolo}-${p.nome}-${p.nazione}`}>
                    <td>
                      <div className="wm-pname">
                        <span>{p.nome}</span>
                        <SetPieceBadges sp={p.sp} />
                      </div>
                      <div className="wm-pmeta">
                        <TeamBadge nazione={p.nazione} team={p.team} compact /> · Gir. {p.group}{p.starter ? " · titolare" : " · panchina"}
                      </div>
                    </td>
                    <td style={{ fontFamily: "JetBrains Mono", fontSize: 10 }}>{p.ruoloLabel}</td>
                    <td style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: p.valore >= 30 ? "var(--gold)" : "var(--txt)" }}>{p.valore}</td>
                    <td>
                      <span className="wm-fascia" style={{ background: fm.color + "22", color: fm.color, border: `1px solid ${fm.color}44` }}>
                        <span className="wm-fdot" style={{ background: fm.color }} />{fm.label}
                      </span>
                    </td>
                    {[1, 2, 3].map((md) => (
                      <td key={md}>{renderGCell(p.cells, md)}</td>
                    ))}
                    <td style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: p.posizione ? "var(--txt)" : "var(--mut)" }}>{p.posizione || "—"}</td>
                    <td style={{ color: "var(--mut)", fontSize: 11, maxWidth: 220 }}>{p.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="wm-note" style={{ marginTop: 10 }}>
          Fasce basate su quotazioni (listone.json), probabili formazioni, calendario gironi e strategia margine/plusvalenze.
          Verde = partita facile · giallo = media · rosso = dura. I top conviene prenderli dai sedicesimi con il margine.
        </div>
      </div>
    </div>
  );

  const SpList = ({ label, color, names, nat }) => (
    <div className="wm-sp-row">
      {label ? <div className="wm-sp-lbl" style={{ color }}>{label}</div> : null}
      {names.length === 0 ? (
        <div style={{ color: "var(--mut)", fontSize: 12, fontStyle: "italic" }}>—</div>
      ) : (
        <ul className="wm-sp-list">
          {names.map((nome, i) => {
            const cr = valoreByNatNome.get(`${nat}|${nome}`);
            return (
              <li key={nome}>
                <span><span className="ord">{i + 1}.</span> {nome}</span>
                {cr != null && <span className="cr">{cr} cr</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  /* ---- RENDER: piazzati ---- */
  const piazzatiSelected = piazzatiTeams.find((t) => t.team === piazzatiTeam);
  const piazzatiView = (
    <div>
      <div className="wm-legend">
        <span className="wm-leg"><span className="wm-pill" style={{ background: "#fcd34d" }} /> Rigoristi 1→2→3</span>
        <span className="wm-leg"><span className="wm-pill" style={{ background: "#60a5fa" }} /> Punizioni</span>
        <span className="wm-leg"><span className="wm-pill" style={{ background: "#2dd4bf" }} /> Angoli</span>
      </div>
      <div className="wm-panel">
        <div className="wm-ph"><Crosshair size={15} color="var(--gold)" /> Calci piazzati</div>
        <div className="wm-sp-layout">
          <div className="wm-sp-sidebar">
            <div className="wm-sp-sbtitle">Girone</div>
            <div className="wm-sp-gchips">
              <span className={"wm-sp-gchip" + (piazzatiGroup === "all" ? " on" : "")} onClick={() => setPiazzatiGroup("all")}>Tutti</span>
              {Object.keys(GROUPS).map((g) => (
                <span key={g} className={"wm-sp-gchip" + (piazzatiGroup === g ? " on" : "")} onClick={() => setPiazzatiGroup(g)}>{g}</span>
              ))}
            </div>
            <div className="wm-sp-sbtitle">Cerca</div>
            <div className="wm-search" style={{ minWidth: 0, marginBottom: 6 }}>
              <Search size={14} color="var(--mut)" />
              <input placeholder="Squadra o giocatore…" value={piazzatiSearch} onChange={(e) => setPiazzatiSearch(e.target.value)} />
            </div>
            <div className="wm-sp-sbtitle">Squadre ({piazzatiTeams.length})</div>
            <div className="wm-sp-teamlist">
              {piazzatiTeams.map(({ team, group, nat, sp }) => (
                <button
                  type="button"
                  key={team}
                  className={"wm-sp-teambtn" + (piazzatiTeam === team ? " on" : "")}
                  onClick={() => setPiazzatiTeam(team)}
                >
                  <TeamBadge nazione={nat} team={team} compact />
                  <span className="meta">
                    {sp?.rigoristi?.length > 0 && <span className="wm-sp-mini" style={{ background: "#fcd34d" }} title="Rigoristi" />}
                    {sp?.punizioni?.length > 0 && <span className="wm-sp-mini" style={{ background: "#60a5fa" }} title="Punizioni" />}
                    {sp?.angoli?.length > 0 && <span className="wm-sp-mini" style={{ background: "#2dd4bf" }} title="Angoli" />}
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 9, color: "var(--mut)", marginLeft: 4 }}>{group}</span>
                  </span>
                </button>
              ))}
              {piazzatiTeams.length === 0 && (
                <div className="wm-sp-empty" style={{ padding: 16, fontSize: 12 }}>Nessuna squadra trovata</div>
              )}
            </div>
          </div>

          <div className="wm-sp-detail">
            {piazzatiSelected?.sp ? (
              <>
                <div className="wm-sp-dhead">
                  <div>
                    <h3>{piazzatiSelected.team}</h3>
                    <div style={{ marginTop: 6 }}>
                      <TeamBadge nazione={piazzatiSelected.nat} team={piazzatiSelected.team} />
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: "var(--mut)", marginLeft: 10 }}>GIRONE {piazzatiSelected.group}</span>
                    </div>
                  </div>
                </div>
                <div className="wm-sp-cols">
                  <div className="wm-sp-col">
                    <div className="wm-sp-col-hd" style={{ color: "#fcd34d" }}>
                      <Crosshair size={13} /> Rigoristi
                    </div>
                    <SpList label="" color="#fcd34d" names={piazzatiSelected.sp.rigoristi} nat={piazzatiSelected.nat} />
                  </div>
                  <div className="wm-sp-col">
                    <div className="wm-sp-col-hd" style={{ color: "#60a5fa" }}>
                      <Zap size={13} /> Punizioni
                    </div>
                    <SpList label="" color="#60a5fa" names={piazzatiSelected.sp.punizioni} nat={piazzatiSelected.nat} />
                  </div>
                  <div className="wm-sp-col">
                    <div className="wm-sp-col-hd" style={{ color: "#2dd4bf" }}>
                      <CornerDownRight size={13} /> Angoli
                    </div>
                    <SpList label="" color="#2dd4bf" names={piazzatiSelected.sp.angoli} nat={piazzatiSelected.nat} />
                  </div>
                </div>
              </>
            ) : (
              <div className="wm-sp-empty">Seleziona un girone e una squadra dalla lista a sinistra</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* ---- RENDER: simulatore rosa ---- */
  const ROLE_LABELS = { portieri: "Portieri", difensori: "Difensori", centrocampisti: "Centrocampisti", attaccanti: "Attaccanti" };
  const rosaView = (
    <div>
      <div className="wm-legend">
        <span style={{ fontWeight: 700, color: "var(--txt)" }}>Calci piazzati:</span>
        {setPieceLegend}
      </div>
      <div className="wm-panel">
        <div className="wm-ph"><Users size={15} color="var(--turf)" /> Simulatore rosa · 3 POR · 8 DIF · 8 CEN · 6 ATT · budget {ROSA_BUDGET} cr</div>
        <div className="wm-budget">
          <div className="wm-bnum"><b style={{ color: rosaRemaining < 0 ? "#ef4444" : "var(--turf)" }}>{rosaSpent}</b><span>Spesi</span></div>
          <div className="wm-bnum"><b style={{ color: rosaRemaining < 0 ? "#ef4444" : "var(--gold)" }}>{rosaRemaining}</b><span>Rimanenti</span></div>
          <div className="wm-bnum"><b>{rosaCount}/25</b><span>Giocatori</span></div>
          <div className="wm-bar"><i style={{ width: `${Math.min(100, (rosaSpent / ROSA_BUDGET) * 100)}%`, background: rosaRemaining < 0 ? "#ef4444" : undefined }} /></div>
          <button className="wm-btn turf" onClick={saveRosa}><Save size={14} /> Salva</button>
          <button className="wm-btn" onClick={clearRosa}><RotateCcw size={14} /> Svuota</button>
        </div>
        {rosaSavedMsg && (
          <div className="wm-note" style={{ color: "var(--turf)", marginBottom: 10 }}>{rosaSavedMsg}</div>
        )}
        {rosaRemaining < 0 && (
          <div className="wm-note" style={{ color: "#ef4444", marginBottom: 10 }}>Hai sforato il budget di {-rosaRemaining} crediti: togli qualche giocatore.</div>
        )}

        <div className="wm-roles">
          {Object.keys(ROSA_LIMITS).map((r) => {
            const list = rosa[r];
            const cost = list.reduce((s, p) => s + p.valore, 0);
            return (
              <div className="wm-rcol" key={r}>
                <div className="wm-rh">
                  <b>{ROLE_LABELS[r]}</b>
                  <span>{list.length}/{ROSA_LIMITS[r]} · {cost} cr</span>
                </div>
                {[...list].sort((a, b) => b.valore - a.valore).map((p) => {
                  const fm = fasciaMeta(p.fascia);
                  return (
                    <div className="wm-slot" key={pkey(p)}>
                      <span className="wm-fdot" style={{ background: fm.color }} />
                      <span className="nm" title={`${p.team} · ${fm.label}`}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                          <span>{p.nome}</span>
                          <SetPieceBadges sp={p.sp} compact />
                        </span>
                        <TeamBadge nazione={p.nazione} team={p.team} compact />
                      </span>
                      <span className="wm-dots">
                        {p.cells.map((c) => (
                          <span key={c.md} className="wm-dot" title={`G${c.md}: vs ${c.opp} (${c.str})`} style={{ background: diffColor(c.str), width: 16, height: 16, fontSize: 7 }}>{c.abbr}</span>
                        ))}
                      </span>
                      <span className="cr">{p.valore}</span>
                      <span className="x" title="Rimuovi" onClick={() => removeFromRosa(p)}><Trash2 size={13} /></span>
                    </div>
                  );
                })}
                {Array.from({ length: Math.max(0, ROSA_LIMITS[r] - list.length) }).map((_, i) => (
                  <div className="wm-slot empty" key={`e${i}`}>slot libero</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="wm-panel">
        <div className="wm-ph"><Search size={15} color="var(--gold)" /> Aggiungi giocatori</div>
        <div className="wm-filters">
          <div className="wm-search">
            <Search size={14} color="var(--mut)" />
            <input placeholder="Cerca giocatore, nazione…" value={rosaSearch} onChange={(e) => setRosaSearch(e.target.value)} />
          </div>
          {Object.keys(ROSA_LIMITS).map((r) => (
            <span key={r} className={"wm-fchip" + (rosaRuolo === r ? " on" : "")} onClick={() => setRosaRuolo(r)}>
              {ROLE_LABELS[r]} ({rosa[r].length}/{ROSA_LIMITS[r]})
            </span>
          ))}
          <button type="button" className="wm-freset" disabled={!rosaFiltersActive} onClick={resetRosaFilters} title="Reset ricerca, ruolo e ordinamenti">
            <RotateCcw size={12} /> Reset filtri
          </button>
        </div>
        <div className="wm-tscroll">
          <table className="wm-table">
            <thead>
              <tr>
                <th></th>
                <th>Giocatore</th>
                <th
                  className={"wm-th-sort" + (findSortEntry(rosaSorts, "cr") ? " on" : "")}
                  onClick={(e) => setRosaSorts((s) => clickSortStack(s, { key: "cr" }, e.shiftKey))}
                  title="Clic: aggiungi/inverti crediti · Shift+clic: rimuovi · Con G attivo: spareggia dentro facile/medio/difficile"
                >
                  Cr {(() => {
                    const e = findSortEntry(rosaSorts, "cr");
                    const r = sortRank(rosaSorts, "cr");
                    return <>{e ? (e.dir === "desc" ? "↓" : "↑") : "↕"}{rosaSorts.length > 1 && r ? <span className="wm-sort-n">{r}</span> : null}</>;
                  })()}
                </th>
                <th>Fascia</th>
                {[1, 2, 3].map((md) => (
                  <th
                    key={md}
                    className={"wm-th-sort wm-th-g" + (findSortEntry(rosaSorts, "g", md) ? " on" : "")}
                    onClick={(e) => setRosaSorts((s) => clickSortStack(s, { key: "g", md }, e.shiftKey))}
                    title="Clic: aggiungi/inverti G · Shift+clic: rimuovi · Con Cr attivo: raggruppa per facile/medio/difficile"
                  >
                    G{md}{(() => {
                      const e = findSortEntry(rosaSorts, "g", md);
                      const r = sortRank(rosaSorts, "g", md);
                      return <>{e ? (e.dir === "asc" ? " ↑" : " ↓") : ""}{rosaSorts.length > 1 && r ? <span className="wm-sort-n">{r}</span> : null}</>;
                    })()}
                  </th>
                ))}
                <th>Pos</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {rosaPickList.map((p) => {
                const fm = fasciaMeta(p.fascia);
                const inRosa = rosaKeys.has(pkey(p));
                const roleFull = rosa[p.ruolo].length >= ROSA_LIMITS[p.ruolo];
                return (
                  <tr key={pkey(p)} style={inRosa ? { opacity: 0.5 } : {}}>
                    <td>
                      <button className="wm-addbtn" disabled={inRosa || roleFull} onClick={() => addToRosa(p)}>
                        <Plus size={12} />{inRosa ? "In rosa" : "Aggiungi"}
                      </button>
                    </td>
                    <td>
                      <div className="wm-pname">
                        <span>{p.nome}</span>
                        <SetPieceBadges sp={p.sp} />
                      </div>
                      <div className="wm-pmeta">
                        <TeamBadge nazione={p.nazione} team={p.team} compact /> · Gir. {p.group}{p.starter ? " · titolare" : " · panchina"}
                      </div>
                    </td>
                    <td style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: p.valore >= 30 ? "var(--gold)" : "var(--txt)" }}>{p.valore}</td>
                    <td>
                      <span className="wm-fascia" style={{ background: fm.color + "22", color: fm.color, border: `1px solid ${fm.color}44` }}>
                        <span className="wm-fdot" style={{ background: fm.color }} />{fm.label}
                      </span>
                    </td>
                    {[1, 2, 3].map((md) => (
                      <td key={md}>{renderGCell(p.cells, md)}</td>
                    ))}
                    <td style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: p.posizione ? "var(--txt)" : "var(--mut)" }}>{p.posizione || "—"}</td>
                    <td style={{ color: "var(--mut)", fontSize: 11, maxWidth: 260 }}>{p.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="wm-note" style={{ marginTop: 10 }}>
          La rosa viene salvata nel file <b>rosa.json</b> nella cartella del progetto sul tuo PC. Ogni volta che apri questo tab viene letta da lì. Usa <b>Salva</b> per scriverla sul disco; <b>Svuota</b> cancella rosa e file.
        </div>
      </div>
    </div>
  );

  /* ---- RENDER: simulatore formazione ---- */
  const formView = (
    <div>
      <div className="wm-panel">
        <div className="wm-ph"><LayoutGrid size={15} color="var(--turf)" /> Simulatore formazione · titolari + panchina per giornata girone</div>
        {rosaCount === 0 && (
          <div className="wm-note" style={{ marginBottom: 10 }}>Compila prima la rosa nel tab Simulatore rosa.</div>
        )}
        <div className="wm-form-controls">
          <div className="wm-form-ctrl">
            <label>Giornata</label>
            <select value={formMd} onChange={(e) => setFormMd(Number(e.target.value))}>
              {FORM_GIORNATE.map((g) => (
                <option key={g} value={g}>G{g} girone</option>
              ))}
            </select>
          </div>
          <div className="wm-form-ctrl">
            <label>Modulo</label>
            <select value={formDay.modulo} onChange={(e) => setFormModulo(e.target.value)}>
              {FORM_MODULES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button className="wm-btn turf" onClick={saveFormazione}><Save size={14} /> Salva formazione</button>
        </div>
        {formSavedMsg && (
          <div className="wm-note" style={{ color: "var(--turf)", marginBottom: 10 }}>{formSavedMsg}</div>
        )}
        <div className="wm-form-grid">
          <div className="wm-form-col">
            <h4>Titolari ({formDay.modulo})</h4>
            {formSlots.map((pos, i) => {
              const current = formDay.titolari[i];
              const roleLetter = slotRoleLetter(pos);
              const roleRuolo = slotRosaRuolo(pos);
              const usedElsewhere = new Set(
                formDay.titolari.filter(Boolean).filter((_, j) => j !== i).map(pkey)
              );
              const options = rosaFlat.filter(
                (p) => p.ruolo === roleRuolo && !usedElsewhere.has(pkey(p))
              );
              return (
                <div className={"wm-form-slot role-" + roleLetter.toLowerCase()} key={i}>
                  <span className={"wm-form-pos " + roleLetter.toLowerCase()}>{roleLetter}</span>
                  <div className="wm-form-pick">
                    <FormPlayerSelect
                      value={current ? pkey(current) : ""}
                      options={options}
                      placeholder={`— scegli ${roleLetter} —`}
                      md={formMd}
                      open={formPickerOpen === i}
                      onToggle={() => setFormPickerOpen(formPickerOpen === i ? null : i)}
                      onClose={() => setFormPickerOpen(null)}
                      onChange={(key) => setFormTitolare(i, key)}
                      keyFn={pkey}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="wm-form-col">
            <h4>Panchina ({formDay.panchina.length})</h4>
            {formDay.panchina.map((p, i) => (
              <div className="wm-bench-row" key={pkey(p)}>
                <span className="wm-bench-ord">{i + 1}</span>
                <div className="wm-bench-main">
                  <span className={"wm-form-role " + (ROSA_TO_ROLE_LETTER[p.ruolo] || "c").toLowerCase()}>
                    {ROSA_TO_ROLE_LETTER[p.ruolo] || "?"}
                  </span>
                  <TeamBadge nazione={p.nazione} team={p.team} compact />
                  <div className="wm-bench-nm">{p.nome}</div>
                  <PlayerGiornataDots p={p} md={formMd} />
                </div>
                <div className="wm-bench-actions">
                  <button type="button" className="wm-iconbtn" disabled={i === 0} onClick={() => movePanchina(i, -1)}><ChevronUp size={14} /></button>
                  <button type="button" className="wm-iconbtn" disabled={i === formDay.panchina.length - 1} onClick={() => movePanchina(i, 1)}><ChevronDown size={14} /></button>
                  <button type="button" className="wm-iconbtn" onClick={() => removeFromPanchina(p)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
            {formDay.panchina.length === 0 && (
              <div className="wm-sp-empty">Nessun giocatore in panchina</div>
            )}
            <h4 style={{ marginTop: 16 }}>Aggiungi alla panchina</h4>
            {(() => {
              const used = new Set([
                ...formDay.titolari.filter(Boolean).map(pkey),
                ...formDay.panchina.map(pkey),
              ]);
              const avail = rosaFlat.filter((p) => !used.has(pkey(p)));
              if (!avail.length) {
                return <div className="wm-sp-empty">Tutti i giocatori della rosa sono già schierati</div>;
              }
              return avail.map((p) => (
                <div className="wm-bench-row" key={pkey(p)}>
                  <div className="wm-bench-main">
                    <span className={"wm-form-role " + (ROSA_TO_ROLE_LETTER[p.ruolo] || "c").toLowerCase()}>
                      {ROSA_TO_ROLE_LETTER[p.ruolo] || "?"}
                    </span>
                    <TeamBadge nazione={p.nazione} team={p.team} compact />
                    <div className="wm-bench-nm">{p.nome}</div>
                    <PlayerGiornataDots p={p} md={formMd} />
                  </div>
                  <button type="button" className="wm-btn" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => addToPanchina(p)}>
                    <Plus size={12} /> Aggiungi
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  /* ---- RENDER: bracket ---- */
  const ordinal = ["1º", "2º", "3º", "4º"];
  const bracketView = (
    <div>
      {/* controls */}
      <div className="wm-panel">
        <div className="wm-ph"><Zap size={15} color="var(--gold)" /> Comandi</div>
        <div className="wm-flex">
          <button className="wm-btn turf" onClick={autoFill}><Zap size={14} /> Auto (quote bookmaker)</button>
          <button className="wm-btn" onClick={() => setWinners({})}><RotateCcw size={14} /> Azzera vincenti</button>
          <button className="wm-btn" onClick={resetAll}><RotateCcw size={14} /> Reset totale</button>
          <span style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <Target size={14} color="var(--gold)" />
            <span style={{ fontSize: 12.5, color: "var(--mut)" }}>Evidenzia percorso di:</span>
            <select className="wm-sel" style={{ width: 160 }} value={focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="">Nessuno</option>
              {Object.keys(STR).sort().map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </span>
        </div>
      </div>

      {/* focus path summary */}
      {pathInfo && pathInfo.opps.length > 0 && (
        <div className="wm-pathbox">
          <h4>Percorso di {focus}{pathInfo.avg != null && <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, marginLeft: 10, color: pathInfo.avg >= 79 ? "#ef4444" : pathInfo.avg >= 68 ? "#f5a524" : "#22c55e" }}>difficoltà media avversari: {pathInfo.avg}/100</span>}</h4>
          <div className="wm-pathline">
            {pathInfo.opps.map((o, i) => (
              <span key={o.m}>
                {i > 0 && " → "}
                <b>{matchRoundName(o.m)}</b>: vs <b style={{ color: STR[o.opp] >= 79 ? "#ef4444" : STR[o.opp] >= 61 ? "#f5a524" : "#22c55e" }}>{o.opp}</b>
              </span>
            ))}
          </div>
          <div className="wm-note">Cambia i piazzamenti o i vincenti per vedere come si muove il percorso. Verde = avversario abbordabile, rosso = avversario forte.</div>
        </div>
      )}

      {/* group placements */}
      <div className="wm-panel">
        <div className="wm-ph"><GitBranch size={15} color="var(--turf)" /> Imposta i gironi (1º / 2º / 3º — il 4º è escluso)</div>
        <div className="wm-mini">
          {Object.keys(GROUPS).map((g) => (
            <div className="wm-mc" key={g}>
              <b>GIRONE {g}</b>
              {[0, 1, 2].map((pos) => (
                <select key={pos} className="wm-sel" value={place[g][pos]} onChange={(e) => setPos(g, pos, e.target.value)}>
                  {GROUPS[g].map((t) => <option key={t} value={t}>{ordinal[pos]} — {t}</option>)}
                </select>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* third slots */}
      <div className="wm-panel">
        <div className="wm-ph"><Target size={15} color="var(--gold)" /> Assegna le 8 migliori terze agli slot</div>
        <div className="wm-mini">
          {R32.filter((r) => r.a.t === "3" || r.b.t === "3").map((r) => {
            const slot = r.a.t === "3" ? r.a : r.b;
            return (
              <div className="wm-mc" key={r.m}>
                <b>M{r.m}</b>
                <span style={{ fontSize: 10.5, color: "var(--mut)", display: "block", margin: "2px 0" }}>
                  terza da: {slot.elig.join("/")}
                </span>
                <select className="wm-sel" value={thirds[r.m] || ""} onChange={(e) => { setThirds((p) => ({ ...p, [r.m]: e.target.value })); setWinners({}); }}>
                  <option value="">— scegli —</option>
                  {slot.elig.map((gg) => <option key={gg} value={gg}>3º {gg} ({place[gg][2]})</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* bracket tree */}
      <div className="wm-panel" style={{ paddingBottom: 6 }}>
        <div className="wm-ph"><Trophy size={15} color="var(--gold)" /> Tabellone — clicca una squadra per farla passare</div>
        <div className="wm-bracket">
          {ROUNDS.map((round) => (
            <div className="wm-col" key={round.name} style={{ minWidth: round.name === "Finale" ? 200 : 190 }}>
              <div className="wm-coln">{round.name}</div>
              {round.ms.map((m) => {
                const [A, B] = matchTeams.get(m);
                const w = winners[m];
                const onPath = pathMatches.has(m);
                const feed = feedsInto[m];
                const TeamRow = ({ team }) => {
                  if (!team) {
                    const def = R32.find((r) => r.m === m);
                    let lbl = "da definire";
                    if (def) {
                      const slot = (def.a.t === "3" && resolveSlot({ ...def.a, _m: m }) == null) ? def.a
                        : (def.b.t === "3" && resolveSlot({ ...def.b, _m: m }) == null) ? def.b : null;
                      if (slot) lbl = "3º " + slot.elig.join("/");
                    }
                    return <div className="wm-empty">{lbl}</div>;
                  }
                  const isW = w === team;
                  const isF = team === focus;
                  return (
                    <div className={"wm-team" + (isW ? " win" : "") + (isF && !isW ? " focus" : "")}
                      onClick={() => pickWinner(m, team)}>
                      <span className="nm">
                        <span className="wm-sdot" style={{ background: diffColor(STR[team] || 0) }} />
                        {team}
                      </span>
                      <span className="ab">{ABBR[team] || ""}</span>
                    </div>
                  );
                };
                return (
                  <div className={"wm-match" + (onPath ? " path" : "")} key={m}>
                    <div className="wm-mnum">
                      <span>M{m}</span>
                      <span>{feed ? `vince → M${feed}` : (m === 104 ? "🏆 CAMPIONE" : "")}</span>
                    </div>
                    <TeamRow team={A} />
                    <TeamRow team={B} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="wm-root">
      <style>{CSS}</style>
      <div className="wm-head">
        <div className="wm-kick">Fantamondiale 2026 · Strumento simulazioni</div>
        <div className="wm-title">Calendario &amp; Tabellone</div>
      </div>
      <div className="wm-tabs">
        <div className={"wm-tab" + (tab === "cal" ? " on" : "")} onClick={() => setTab("cal")}>
          <Calendar size={15} /> Calendario gironi
        </div>
        <div className={"wm-tab" + (tab === "bra" ? " on" : "")} onClick={() => setTab("bra")}>
          <Trophy size={15} /> Tabellone (simulatore)
        </div>
        <div className={"wm-tab" + (tab === "fan" ? " on" : "")} onClick={() => setTab("fan")}>
          <Star size={15} /> Fantamondiale
        </div>
        <div className={"wm-tab" + (tab === "rosa" ? " on" : "")} onClick={() => setTab("rosa")}>
          <Users size={15} /> Simulatore rosa
        </div>
        <div className={"wm-tab" + (tab === "form" ? " on" : "")} onClick={() => setTab("form")}>
          <LayoutGrid size={15} /> Simulatore formazione
        </div>
        <div className={"wm-tab" + (tab === "piaz" ? " on" : "")} onClick={() => setTab("piaz")}>
          <Crosshair size={15} /> Piazzati
        </div>
        <div className={"wm-tab" + (tab === "proj" ? " on" : "")} onClick={() => setTab("proj")}>
          <BarChart3 size={15} /> Proiezioni
        </div>
      </div>
      <div className="wm-body">
        {tab === "cal" ? calendarView
          : tab === "bra" ? bracketView
          : tab === "fan" ? fantamondialeView
          : tab === "rosa" ? rosaView
          : tab === "form" ? formView
          : tab === "piaz" ? piazzatiView
          : tab === "proj" ? <ProiezioniTab />
          : calendarView}
      </div>
    </div>
  );
}
