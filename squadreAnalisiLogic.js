import { SLOT_POSITIONS, slotRosaRuolo } from "./formationPositions.js";
import { emptySquadraStore } from "./squadreAnalisiData.js";
import {
  getProbabileModulo,
  getProbabiliNomi,
  NAME_ALIASES,
} from "./squadreProbabili.js";

function normKey(s) {
  return String(s)
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s) {
  return normKey(s).split(" ").filter(Boolean);
}

function scoreMatch(candidate, listoneName) {
  const c = tokens(candidate);
  const l = tokens(listoneName);
  if (!c.length || !l.length) return 0;
  let score = 0;
  const cLast = c[c.length - 1];
  const lLast = l[l.length - 1];
  if (cLast === lLast) score += 5;
  else if (lLast.startsWith(cLast) || cLast.startsWith(lLast)) score += 3;
  for (const t of c) {
    if (l.includes(t)) score += 2;
    else if (l.some((x) => x.startsWith(t) || t.startsWith(x))) score += 1;
  }
  const nc = normKey(candidate);
  const nl = normKey(listoneName);
  if (nc === nl) score += 20;
  if (nl.includes(nc)) score += 4;
  if (nc.includes(nl)) score += 3;
  return score;
}

export function resolveProbabilePlayer(nat, raw, listonePlayers) {
  const pool = listonePlayers.filter((p) => p.nazione === nat);
  const cands = String(raw)
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const c of cands) {
    const aliasKey = `${nat}|${normKey(c)}`;
    const aliasNome = NAME_ALIASES[aliasKey];
    if (aliasNome) {
      const exact = pool.find((p) => p.nome === aliasNome);
      if (exact) return exact;
    }
  }

  let best = null;
  let bestScore = 0;
  for (const c of cands) {
    for (const p of pool) {
      const sc = scoreMatch(c, p.nome);
      if (sc > bestScore) {
        bestScore = sc;
        best = p;
      }
    }
  }
  return best && bestScore >= 5 ? best : null;
}

export function buildProbabiliTitolari(nat, listonePlayers) {
  const modulo = getProbabileModulo(nat);
  const nomi = getProbabiliNomi(nat);
  const slots = SLOT_POSITIONS[modulo] || SLOT_POSITIONS["4-3-3"];
  const titolari = Array(11).fill(null);
  const used = new Set();

  nomi.forEach((raw, slot) => {
    if (slot >= 11) return;
    const player = resolveProbabilePlayer(nat, raw, listonePlayers);
    if (!player) return;
    const key = `${player.ruolo}|${player.nome}|${player.nazione}`;
    if (used.has(key)) return;
    used.add(key);
    titolari[slot] = player;
  });

  const pool = listonePlayers.filter((p) => p.nazione === nat);
  const byRole = { portieri: [], difensori: [], centrocampisti: [], attaccanti: [] };
  pool.forEach((p) => {
    if (byRole[p.ruolo]) byRole[p.ruolo].push(p);
  });
  for (const r of Object.keys(byRole)) {
    byRole[r].sort(
      (a, b) => (b.starter ? 1 : 0) - (a.starter ? 1 : 0) || b.valore - a.valore
    );
  }

  slots.forEach((pos, slot) => {
    if (titolari[slot]) return;
    const ruolo = slotRosaRuolo(pos);
    while (byRole[ruolo].length) {
      const p = byRole[ruolo].shift();
      const key = `${p.ruolo}|${p.nome}|${p.nazione}`;
      if (!used.has(key)) {
        used.add(key);
        titolari[slot] = p;
        break;
      }
    }
  });

  return { modulo, titolari };
}

export function serializeSquadra(store) {
  return {
    nat: store.nat,
    modulo: getProbabileModulo(store.nat),
    titolari: store.titolari
      .map((p, slot) => (p ? { slot, nome: p.nome, ruolo: p.ruolo } : null))
      .filter(Boolean),
    note: store.note || "",
    noteAmichevoli: store.noteAmichevoli || "",
  };
}

export function hydrateSquadra(data, nat, lookup) {
  const modulo = getProbabileModulo(nat);
  const base = { ...emptySquadraStore(nat), modulo };
  if (!data) return base;
  const titolari = Array(11).fill(null);
  (data.titolari || []).forEach((s) => {
    const p = lookup.get(`${s.ruolo}|${s.nome}|${nat}`);
    if (p && s.slot >= 0 && s.slot < 11) titolari[s.slot] = p;
  });
  return {
    nat,
    modulo,
    titolari: normalizeTitolariFromLookup(titolari, nat, lookup),
    note: data.note || "",
    noteAmichevoli: data.noteAmichevoli || "",
  };
}

/** Forza grafia listone su ogni titolare caricato. */
function normalizeTitolariFromLookup(titolari, nat, lookup) {
  return titolari.map((p) => {
    if (!p) return null;
    const exact = lookup.get(`${p.ruolo}|${p.nome}|${nat}`);
    if (exact) return exact;
    for (const [, v] of lookup) {
      if (v.nazione === nat && v.ruolo === p.ruolo && v.nome === p.nome) return v;
    }
    return p;
  });
}

export async function loadSquadraFromFile(nat, lookup, listonePlayers) {
  try {
    const res = await fetch(`/api/squadre/${nat}`);
    if (res.ok) {
      const data = await res.json();
      const store = hydrateSquadra(data, nat, lookup);
      const hasPlayers = store.titolari.some(Boolean);
      if (!hasPlayers && listonePlayers.length) {
        const prob = buildProbabiliTitolari(nat, listonePlayers);
        store.titolari = prob.titolari;
      }
      return store;
    }
  } catch {
    /* dev server non attivo */
  }
  const store = emptySquadraStore(nat);
  if (listonePlayers.length) {
    const prob = buildProbabiliTitolari(nat, listonePlayers);
    store.modulo = prob.modulo;
    store.titolari = prob.titolari;
  }
  return store;
}

export async function saveSquadraToFile(store) {
  const res = await fetch(`/api/squadre/${store.nat}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serializeSquadra(store), null, 2),
  });
  if (!res.ok) throw new Error("save failed");
}

export function resetToProbabili(nat, listonePlayers) {
  const prob = buildProbabiliTitolari(nat, listonePlayers);
  return {
    nat,
    modulo: prob.modulo,
    titolari: prob.titolari,
    note: "",
    noteAmichevoli: "",
  };
}
