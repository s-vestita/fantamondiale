import listoneIniziale from "./listone.json" with { type: "json" };
import listone from "./listone_2g.json" with { type: "json" };
import startersData from "./starters.json" with { type: "json" };
import positionsData from "./positions.json" with { type: "json" };
import { getPlayerSetPieces } from "./setPiecesData.js";
import { fallbackPosizione } from "./formationPositions.js";
import { getMatchCells, TEAM_STRENGTH } from "./matchOddsLogic.js";

export const NAT_TO_TEAM = {
  MES: "Messico", COR: "Corea del Sud", CEC: "Cechia", SUD: "Sudafrica",
  SVI: "Svizzera", CAN: "Canada", BOS: "Bosnia", QAT: "Qatar",
  BRA: "Brasile", MAR: "Marocco", SCO: "Scozia", HAI: "Haiti",
  STA: "USA", TUR: "Turchia", PAR: "Paraguay", AUS: "Australia",
  GER: "Germania", ECU: "Ecuador", COS: "Costa d'Avorio", CUR: "Curaçao",
  OLA: "Olanda", GIA: "Giappone", SVE: "Svezia", TUN: "Tunisia",
  BEL: "Belgio", EGI: "Egitto", IRN: "Iran", NUO: "Nuova Zelanda",
  SPA: "Spagna", URU: "Uruguay", CAP: "Capo Verde", ARA: "Arabia Saudita",
  FRA: "Francia", SEN: "Senegal", NOR: "Norvegia", IRQ: "Iraq",
  ARG: "Argentina", UNB: "Austria", ALG: "Algeria", GIO: "Giordania",
  POR: "Portogallo", COL: "Colombia", CON: "Congo DR", UZB: "Uzbekistan",
  ING: "Inghilterra", CRO: "Croazia", GHA: "Ghana", PAN: "Panama",
};

// Codici flagcdn (ISO2 o sotto-codici gb-eng / gb-sct)
const NAT_FLAG_CODE = {
  MES: "mx", COR: "kr", CEC: "cz", SUD: "za", SVI: "ch", CAN: "ca", BOS: "ba", QAT: "qa",
  BRA: "br", MAR: "ma", SCO: "gb-sct", HAI: "ht", STA: "us", TUR: "tr", PAR: "py", AUS: "au",
  GER: "de", ECU: "ec", COS: "ci", CUR: "cw", OLA: "nl", GIA: "jp", SVE: "se", TUN: "tn",
  BEL: "be", EGI: "eg", IRN: "ir", NUO: "nz", SPA: "es", URU: "uy", CAP: "cv", ARA: "sa",
  FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq", ARG: "ar", UNB: "at", ALG: "dz", GIO: "jo",
  POR: "pt", COL: "co", CON: "cd", UZB: "uz", ING: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

export function natFlagUrl(nat, size = 20) {
  const code = NAT_FLAG_CODE[nat];
  if (!code) return null;
  return `https://flagcdn.com/w${size}/${code}.png`;
}

export function teamName(nat, fallback) {
  return NAT_TO_TEAM[nat] || fallback || nat || "?";
}

export const PATH_EASY = new Set(["Argentina", "Francia", "Portogallo", "Spagna", "Inghilterra", "Germania"]);
export const PATH_MED = new Set(["Brasile", "Olanda", "Belgio"]);
export const PATH_HARD = new Set(["Marocco", "Norvegia", "Uruguay", "Croazia", "Senegal"]);

export const FASCE = [
  { id: "top", label: "Top", color: "#c084fc", hint: "Bonus pesanti, titolare sicuro di squadra forte" },
  { id: "semitop", label: "Semi-top", color: "#60a5fa", hint: "Titolare di valore o portiere/difensore top" },
  { id: "titolari", label: "Titolari", color: "#4ade80", hint: "Affidabile in fase a gironi" },
  { id: "lowcost", label: "Titolari low-cost", color: "#2dd4bf", hint: "Titolare a basso prezzo / bug: ottimo per il margine" },
  { id: "scommessa", label: "Scommessa", color: "#fbbf24", hint: "Upside alto ma minuti/titolarità incerti" },
  { id: "evita", label: "Da evitare", color: "#94a3b8", hint: "Panchina, trappola o nazionale debole" },
];

export const FASCIA_ORDER = ["top", "semitop", "titolari", "lowcost", "scommessa", "evita"];

const RUOLO_LABEL = { portieri: "POR", difensori: "DIF", centrocampisti: "CEN", attaccanti: "ATT" };

// --- liste curate (grafie esatte del listone) ---
const ELITE_TOP = new Set([
  "MBAPPE", "KANE", "HAALAND", "MARTINEZ LA.", "ALVAREZ", "VINICIUS", "GAKPO", "SALAH",
  "MESSI", "ISAK", "RAPHINHA", "GYOKERES", "SAKA", "DEPAY", "DEMBELE", "DOUE DE.", "WILLIAMS NI.",
  "OLISE", "BELLINGHAM", "MUSIALA", "WIRTZ", "FERNANDES", "PEDRI", "DE BRUYNE", "PULISIC",
]);

const RIGORISTI = new Set([
  "CALHANOGLU", "MODRIC", "FERNANDES", "SON", "OYARZABAL", "VALENCIA EN.", "GULER", "MAHREZ",
  "DEPAY", "ARNAUTOVIC", "AFIF", "KANE", "MBAPPE", "HAALAND", "SALAH", "MESSI", "TAREMI", "AKTURKOGLU",
]);

// centrocampisti/difensori quotati ma che giocano da rifinitori/punte -> upside da bonus
const BUG_RUOLO = new Set([
  "SON", "DE KETELAERE", "PULISIC", "GULER", "EZE", "SILVA BE.", "COUFAL", "DE CUYPER",
  "SALAH-EDDINE", "KADIOGLU",
]);

// terzini/difensori molto offensivi -> trattati come fonti di bonus
const OFFENSIVE_DEF = new Set([
  "HAKIMI", "DUMFRIES", "CANCELO", "GVARDIOL", "DAVIES", "HERNANDEZ TH.", "MENDES", "GRIMALDO",
]);

const LOWCOST_GEMME = new Set([
  "RAUL RANGEL", "EL SHENAWY", "CREPEAU", "OLUWASEYI", "MARMOUSH", "OUNAHI", "SEIWALD", "SCHLAGER",
  "PINEDA", "ONANA", "SUCIC", "TAGLIAFICO", "MOLINA", "MONTES", "VASQUEZ", "GALLARDO", "REYES",
  "DIOP", "COUFAL", "DE CUYPER", "SALAH-EDDINE", "AGUERD", "GIMENEZ JM.", "OLIVERA", "CALETA-CAR",
  "SUTALO", "DIOP I.",
]);

const SCOMMESSA = new Set([
  "JOAO FELIX", "WISSA", "ISIDOR", "YAMAL", "NEYMAR", "ENDRICK", "LEAO", "RASHFORD",
]);

const TRAP = new Set([
  "TANGVIK", "VALLE", "HORNICEK", "NORDFELDT", "ACEVEDO LOPEZ", "SHOBEIR", "ST. CLAIR", "GUNN", "GALINDEZ",
]);

const starterSet = new Set(startersData.map((s) => `${s.nome}|${s.nazione}`));

export function isStarter(nome, nazione) {
  return starterSet.has(`${nome}|${nazione}`);
}

export function getTeamForNat(nat, groups) {
  const team = NAT_TO_TEAM[nat];
  if (!team) return null;
  for (const [g, teams] of Object.entries(groups)) {
    if (teams.includes(team)) return { team, group: g };
  }
  return null;
}

export { getMatchCells, TEAM_STRENGTH, diffColor } from "./matchOddsLogic.js";

function pathNote(team, easy, hard) {
  if (easy) return "percorso favorevole (da 1º: 16esimi vs una terza)";
  if (hard) return "rischio 2º posto → incrocio duro ai 16esimi";
  if (PATH_MED.has(team)) return "può vincere il girone ma con resistenza";
  return "da 1º nel girone affronta una terza ai 16esimi";
}

function calNote(cells, tier, v) {
  if (!cells.length) return "calendario non disponibile";
  const greens = cells.filter((c) => c.str > 0 && c.str < 61).length;
  const reds = cells.filter((c) => c.str >= 79).length;
  if (tier === "top" && v >= 30) return "caro per i gironi: conviene prenderlo dai sedicesimi";
  if (greens >= 2) return "calendario gironi morbido: schieralo subito";
  if (reds >= 2) return "calendario gironi duro nei gironi";
  return "calendario gironi nella media";
}

export function classifyPlayer(p, groups, str) {
  const nome = p.nome;
  const starter = isStarter(p.nome, p.nazione);
  const info = getTeamForNat(p.nazione, groups);
  const team = info?.team || null;
  const teamStr = team ? str[team] || 0 : 0;
  const easy = team && PATH_EASY.has(team);
  const hard = team && PATH_HARD.has(team);
  const v = p.valore;

  const rig = RIGORISTI.has(nome);
  const bug = BUG_RUOLO.has(nome);
  const offDef = OFFENSIVE_DEF.has(nome);
  const isOff = p.ruolo === "attaccanti" || bug || offDef || rig;

  if (TRAP.has(nome)) {
    return { fascia: "evita", note: "trappola di quotazione / non è il vero titolare nelle probabili" };
  }

  if (!starter) {
    if (SCOMMESSA.has(nome)) return { fascia: "scommessa", note: "talento ma fuori dai titolari nelle probabili: scommessa da margine" };
    if (v >= 18) return { fascia: "scommessa", note: "quotato ma non titolare nelle probabili: rischio panchina" };
    return { fascia: "evita", note: "non titolare nelle probabili formazioni" };
  }

  let fascia;
  if (ELITE_TOP.has(nome)) {
    fascia = "top";
  } else if (SCOMMESSA.has(nome)) {
    fascia = "scommessa";
  } else if (isOff) {
    if (v >= 28) fascia = "top";
    else if (v >= 18 && teamStr >= 72) fascia = "top";
    else if (rig && v >= 12 && teamStr >= 64) fascia = "top";
    else if (v >= 14) fascia = "semitop";
    else if (v >= 8) fascia = "titolari";
    else fascia = "lowcost";
  } else if (p.ruolo === "portieri") {
    if (v >= 15) fascia = "semitop";
    else if (v >= 8) fascia = "titolari";
    else fascia = "lowcost";
  } else {
    if (v >= 22) fascia = "semitop";
    else if (v >= 12) fascia = "titolari";
    else if (v >= 8) fascia = "titolari";
    else fascia = "lowcost";
  }

  // nazionale debole: niente top/semitop (eccetto bug evidenti già low)
  if (teamStr > 0 && teamStr < 56 && (fascia === "top" || fascia === "semitop")) {
    fascia = "titolari";
  }

  // costruzione nota
  const parts = [];
  if (fascia === "scommessa") parts.push("upside alto, minuti/titolarità da confermare");
  if (fascia === "lowcost") parts.push("titolare low-cost: riempi-rosa per il margine");
  if (bug) parts.push("bug ruolo: gioca più avanzato del previsto");
  else if (offDef) parts.push("difensore offensivo (bonus)");
  if (rig) parts.push("rigorista/piazzati");
  if (p.ruolo === "portieri" && v <= 2) parts.push("bug: titolare a prezzo da terzo portiere");
  parts.push(calNote(p.cells || [], fascia, v));
  parts.push(pathNote(team, easy, hard));

  return { fascia, note: parts.join(" · ") };
}

export const ROSA_LIMITS = { portieri: 3, difensori: 8, centrocampisti: 8, attaccanti: 6 };
export const ROSA_BUDGET = 250;

/** Cassa messa da parte dopo l'asta: budget torneo − somma quotazioni 1G in rosa. */
export function computeBudgetRimanenteSuccessiva(rosa, lookupIni, budget = ROSA_BUDGET) {
  const players = Object.values(rosa).flat();
  if (!players.length) return budget;
  let iniSum = 0;
  for (const p of players) {
    const k = `${p.ruolo}|${p.nome}|${p.nazione}`;
    iniSum += lookupIni.get(k)?.valore ?? 0;
  }
  return Math.max(0, budget - iniSum);
}

export function rosaBudgetBreakdown(rosa, lookupIni, lookupCur, budget = ROSA_BUDGET) {
  const players = Object.values(rosa).flat();
  let iniSum = 0;
  let curSum = 0;
  for (const p of players) {
    const k = `${p.ruolo}|${p.nome}|${p.nazione}`;
    iniSum += lookupIni.get(k)?.valore ?? 0;
    curSum += lookupCur.get(k)?.valore ?? 0;
  }
  const cassaAsta = Math.max(0, budget - iniSum);
  const plusvalenza = curSum - iniSum;
  return { iniSum, curSum, cassaAsta, plusvalenza };
}

// Punteggio fanta per l'auto-generazione: fascia + calendario gironi + ruolo offensivo + blocco modificatore.
export function playerValue(p) {
  const w = { top: 92, semitop: 62, titolari: 36, lowcost: 30, scommessa: 18, evita: 0 }[p.fascia] || 0;
  let cal = 0;
  (p.cells || []).forEach((c) => {
    if (c.str > 0 && c.str < 61) cal += 6;
    else if (c.str >= 79) cal -= 3;
  });
  let off = 0;
  if (p.ruolo === "attaccanti") off += 8;
  if (p.fascia === "top" || p.fascia === "semitop") off += 4;
  let mod = 0;
  // blocco Messico per il modificatore difesa (guida)
  if (p.team === "Messico" && (p.ruolo === "difensori" || p.ruolo === "portieri")) mod += 5;
  return w + cal + off + mod;
}

// Auto-genera una rosa valida (3-8-8-6) entro budget, massimizzando il valore fanta.
export function autoBuildRosa(players, budget = ROSA_BUDGET, limits = ROSA_LIMITS) {
  const roles = Object.keys(limits);
  const pool = {};
  roles.forEach((r) => {
    pool[r] = players
      .filter((p) => p.ruolo === r && p.starter && p.fascia !== "evita")
      .map((p) => ({ ...p, _val: playerValue(p) }));
  });

  // baseline: i titolari più economici per ogni ruolo (rosa valida garantita)
  const sel = {};
  roles.forEach((r) => {
    const byPrice = [...pool[r]].sort((a, b) => a.valore - b.valore || b._val - a._val);
    sel[r] = byPrice.slice(0, limits[r]);
    // se per qualche motivo non bastano i titolari, completa con i meno cari in assoluto
    if (sel[r].length < limits[r]) {
      const extra = players.filter((p) => p.ruolo === r).sort((a, b) => a.valore - b.valore);
      for (const e of extra) {
        if (sel[r].length >= limits[r]) break;
        if (!sel[r].some((x) => x.nome === e.nome && x.nazione === e.nazione)) sel[r].push({ ...e, _val: playerValue(e) });
      }
    }
  });

  const totalSpent = () => roles.reduce((s, r) => s + sel[r].reduce((x, p) => x + p.valore, 0), 0);

  let guard = 0;
  while (guard++ < 5000) {
    const rem = budget - totalSpent();
    let best = null;
    for (const r of roles) {
      const selKeys = new Set(sel[r].map((p) => `${p.nome}|${p.nazione}`));
      // sostituibile: il selezionato col valore fanta più basso
      let cur = null;
      for (const p of sel[r]) if (!cur || p._val < cur._val) cur = p;
      if (!cur) continue;
      for (const cand of pool[r]) {
        if (selKeys.has(`${cand.nome}|${cand.nazione}`)) continue;
        const extra = cand.valore - cur.valore;
        if (extra > rem) continue;
        const gain = cand._val - cur._val;
        if (gain <= 0) continue;
        if (!best || gain > best.gain || (gain === best.gain && extra < best.extra)) {
          best = { r, cand, cur, gain, extra };
        }
      }
    }
    if (!best) break;
    sel[best.r] = sel[best.r].map((p) => (p === best.cur ? best.cand : p));
  }

  return sel;
}

export function buildQuotazioniConfronto() {
  const out = [];
  for (const ruolo of ["portieri", "difensori", "centrocampisti", "attaccanti"]) {
    const iniByKey = new Map(
      listoneIniziale[ruolo].map((p) => [`${p.nome}|${p.nazione}`, p.valore])
    );
    for (const p of listone[ruolo]) {
      const key = `${p.nome}|${p.nazione}`;
      const iniziale = iniByKey.get(key) ?? p.valore;
      const attuale = p.valore;
      out.push({
        nome: p.nome,
        nazione: p.nazione,
        ruolo,
        ruoloLabel: RUOLO_LABEL[ruolo],
        team: NAT_TO_TEAM[p.nazione] || p.nazione,
        iniziale,
        attuale,
        delta: attuale - iniziale,
      });
    }
  }
  return out;
}

export function buildListone(groups, fixtures, abbr) {
  return buildListoneFrom(listone, groups, fixtures, abbr);
}

export function buildListoneIniziale(groups, fixtures, abbr) {
  return buildListoneFrom(listoneIniziale, groups, fixtures, abbr);
}

function buildListoneFrom(listoneData, groups, fixtures, abbr) {
  const out = [];
  for (const ruolo of ["portieri", "difensori", "centrocampisti", "attaccanti"]) {
    for (const p of listoneData[ruolo]) {
      const info = getTeamForNat(p.nazione, groups);
      const cells = info ? getMatchCells(info.team, info.group, fixtures, abbr) : [];
      const enriched = { ...p, ruolo, cells };
      const { fascia, note } = classifyPlayer(enriched, groups, TEAM_STRENGTH);
      const starter = isStarter(p.nome, p.nazione);
      const posKey = `${p.nome}|${p.nazione}`;
      const posizione = positionsData[posKey] || (starter ? fallbackPosizione(ruolo) : null);

      out.push({
        ...p,
        ruolo,
        ruoloLabel: RUOLO_LABEL[ruolo],
        posizione,
        team: info?.team || NAT_TO_TEAM[p.nazione] || "?",
        group: info?.group || "—",
        teamStr: info ? TEAM_STRENGTH[info.team] || 0 : 0,
        starter,
        fascia,
        note,
        cells,
        sp: getPlayerSetPieces(p.nazione, p.nome),
      });
    }
  }
  return out;
}
