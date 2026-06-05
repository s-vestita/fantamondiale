/**
 * Genera setPiecesData.js da rigoristi.txt + punizioni/angoli (Bulinews/Squawka).
 * Solo nomi presenti in listone.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import listone from "../listone.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const NAT_LABELS = {
  ALGERIA: "ALG",
  "ARABIA SAUDITA": "ARA",
  ARGENTINA: "ARG",
  AUSTRALIA: "AUS",
  AUSTRIA: "UNB",
  BELGIO: "BEL",
  BOSNIA: "BOS",
  BRASILE: "BRA",
  CANADA: "CAN",
  "CAPO VERDE": "CAP",
  COLOMBIA: "COL",
  "COREA DEL SUD": "COR",
  "COSTA D'AVORIO": "COS",
  "CURAÇAO": "CUR",
  CROAZIA: "CRO",
  ECUADOR: "ECU",
  EGITTO: "EGI",
  FRANCIA: "FRA",
  GERMANIA: "GER",
  GHANA: "GHA",
  GIAPPONE: "GIA",
  GIORDANIA: "GIO",
  HAITI: "HAI",
  INGHILTERRA: "ING",
  IRAN: "IRN",
  IRAQ: "IRQ",
  MAROCCO: "MAR",
  MESSICO: "MES",
  NORVEGIA: "NOR",
  "NUOVA ZELANDA": "NUO",
  OLANDA: "OLA",
  PANAMA: "PAN",
  PARAGUAY: "PAR",
  PORTOGALLO: "POR",
  QATAR: "QAT",
  "REPUBBLICA CECA": "CEC",
  "REPUBBLICA DEMOCRATICA DEL CONGO": "CON",
  SCOZIA: "SCO",
  SENEGAL: "SEN",
  SPAGNA: "SPA",
  "STATI UNITI": "STA",
  SUDAFRICA: "SUD",
  SVEZIA: "SVE",
  SVIZZERA: "SVI",
  TUNISIA: "TUN",
  TURCHIA: "TUR",
  URUGUAY: "URU",
  UZBEKISTAN: "UZB",
};

const byNat = {};
for (const ruolo of Object.keys(listone)) {
  for (const p of listone[ruolo]) {
    if (!byNat[p.nazione]) byNat[p.nazione] = [];
    byNat[p.nazione].push(p.nome);
  }
}

const norm = (s) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[''`]/g, "")
    .replace(/\./g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Override espliciti sorgente → listone */
const ALIASES = {
  "CAN|J. David": "DAVID",
  "CAN|P. David": "PROMISE DAVID",
  "CAN|Larin": "LARIN",
  "COL|James Rodriguez": "RODRIGUEZ JA.",
  "COL|Diaz": "DIAZ LU.",
  "COL|Quintero": "QUINTERO JF.",
  "COR|Heung-Min Son": "SON",
  "COR|Hee-Chan Hwang": "HWANG H.",
  "COR|Lee Kang-In": "LEE KI.",
  "ECU|E. Valencia": "VALENCIA EN.",
  "ECU|J. Caicedo": "CAICEDO MO.",
  "FRA|Mbappé": "MBAPPE",
  "FRA|Dembelé": "DEMBELE",
  "FRA|T. Hernandez": "HERNANDEZ TH.",
  "GHA|J. Ayew": "AYEW",
  "GHA|I. Williams": "WILLIAMS",
  "GIO|A. Olwan": "OLWAN",
  "GIO|Tamari": "AL TAMARI",
  "GIO|Shararh": "SHARARA",
  "IRQ|Hussein": "HUSSEIN A.",
  "IRQ|M. Ali": "ALI H.",
  "MAR|Brahim Diaz": "DIAZ B.",
  "MES|S. Gimenez": "GIMENEZ",
  "PAN|Waterman": "WATERMAN CE.",
  "PAN|Davis": "ERIC DAVIS",
  "PAN|Diaz": "DIAZ IS.",
  "PAR|Sanabria": "SANABRIA AN.",
  "POR|Cristiano Ronaldo": "RONALDO",
  "POR|Bruno Fernandes": "FERNANDES",
  "BRA|Vinicius Jr": "VINICIUS",
  "CAP|Mendes": "MENDES R.",
  "CAP|Rodriguez": "RODRIGUES",
  "CUR|L. Bacuna": "BACUNA LE.",
  "CUR|J. Bacuna": "BACUNA",
  "BEL|De Bruyne": "DE BRUYNE",
  "ARA|Al-Dawsari": "AL-DAWSARI S.",
  "SEN|I. Sarr": "SARR",
  "COS|Kessié": "KESSIE",
  "COS|Pepé": "PEPE",
  "COS|Sangaré": "SANGARE",
  "QAT|Afif": "AFIF",
  "QAT|A. Ali": "AL-HAYDOS",
  "QAT|Miguel": "MUNTARI",
  "SVI|Amdouni": "NDOYE",
};

function resolveName(nat, raw) {
  const key = `${nat}|${raw}`;
  if (ALIASES[key]) return ALIASES[key];

  const names = byNat[nat] || [];
  const n = norm(raw);

  const exact = names.find((x) => norm(x) === n);
  if (exact) return exact;

  const words = n.split(" ").filter((w) => w.length > 1);
  const byWords = names.filter((x) => {
    const xn = norm(x);
    return words.every((w) => xn.includes(w));
  });
  if (byWords.length === 1) return byWords[0];
  if (byWords.length > 1) {
    byWords.sort((a, b) => norm(a).length - norm(b).length);
    return byWords[0];
  }

  const last = words[words.length - 1];
  const byLast = names.filter((x) => norm(x).endsWith(last) || norm(x).split(" ").includes(last));
  if (byLast.length === 1) return byLast[0];
  if (byLast.length > 1) {
    byLast.sort((a, b) => norm(a).length - norm(b).length);
    return byLast[0];
  }

  return null;
}

function parseRigoristi(text) {
  const lines = text.split(/\r?\n/);
  const out = {};
  let nat = null;

  for (const line of lines) {
    const head = line.match(/^RIGORISTI (.+)$/);
    if (head) {
      nat = NAT_LABELS[head[1].trim()] || null;
      if (nat && !out[nat]) out[nat] = [];
      continue;
    }
    const item = line.match(/^\d+\.\s*(.+)$/);
    if (item && nat) out[nat].push(item[1].trim());
  }
  return out;
}

/** Punizioni e angoli — Bulinews / Squawka (giu 2026), grafia listone */
const PUN_ANG = {
  MES: { punizioni: ["JIMENEZ", "ALVAREZ ED.", "VEGA"], angoli: ["GUTIERREZ", "VEGA", "ALVARADO"] },
  SUD: { punizioni: ["APPOLLIS", "MODIBA"], angoli: ["APPOLLIS", "MODIBA", "MUDAU"] },
  COR: { punizioni: ["SON", "LEE KI."], angoli: ["SON", "LEE KI.", "LEE JS."] },
  CEC: { punizioni: ["COUFAL", "PROVOD", "SULC"], angoli: ["COUFAL", "PROVOD", "SULC"] },
  CAN: { punizioni: ["DAVIES", "EUSTAQUIO"], angoli: ["CHOINIERE", "AHMED", "DAVIES"] },
  BOS: { punizioni: ["ALAJBEGOVIC", "DEDIC", "TAHIROVIC"], angoli: ["ALAJBEGOVIC", "BAJRAKTAREVIC"] },
  QAT: { punizioni: ["AFIF"], angoli: ["AFIF", "KHOUKHI"] },
  SVI: { punizioni: ["XHAKA", "VARGAS", "RIEDER"], angoli: ["VARGAS", "RIEDER"] },
  BRA: { punizioni: ["NEYMAR", "RAPHINHA"], angoli: ["NEYMAR", "RAPHINHA", "GUIMARAES"] },
  MAR: { punizioni: ["DIAZ B.", "HAKIMI"], angoli: ["HAKIMI", "DIAZ B."] },
  SCO: { punizioni: ["MCGINN", "MCTOMINAY"], angoli: ["MCGINN", "FERGUSON"] },
  HAI: { punizioni: ["BELLEGARDE", "DEEDSON"], angoli: ["BELLEGARDE", "DEEDSON"] },
  STA: { punizioni: ["PULISIC"], angoli: ["PULISIC", "TILLMAN"] },
  PAR: { punizioni: ["GOMEZ DI.", "ENCISO", "ALMIRON"], angoli: ["GOMEZ DI.", "ALMIRON"] },
  AUS: { punizioni: ["HRUSTIC", "IRANKUNDA"], angoli: ["HRUSTIC", "BEHICH"] },
  TUR: { punizioni: ["CALHANOGLU", "GULER"], angoli: ["CALHANOGLU", "GULER"] },
  GER: { punizioni: ["RAUM", "WIRTZ"], angoli: ["RAUM", "WIRTZ", "KIMMICH"] },
  ECU: { punizioni: ["ESTUPINAN", "VALENCIA EN."], angoli: ["CAICEDO MO.", "PLATA"] },
  COS: { punizioni: ["DIALLO AM.", "KESSIE"], angoli: ["DIALLO AM.", "DIOMANDE"] },
  CUR: { punizioni: ["BACUNA LE.", "ANTONISSE"], angoli: ["BACUNA LE.", "ANTONISSE", "BACUNA"] },
  OLA: { punizioni: ["DEPAY", "GAKPO"], angoli: ["DEPAY", "GAKPO"] },
  GIA: { punizioni: ["KUBO", "ITO J."], angoli: ["ITO J.", "DOAN"] },
  SVE: { punizioni: ["AYARI", "ISAK"], angoli: ["ELANGA", "SVENSSON", "AYARI"] },
  TUN: { punizioni: ["MEJBRI", "ABDI"], angoli: ["MEJBRI", "ABDI"] },
  BEL: { punizioni: ["DE BRUYNE"], angoli: ["DE BRUYNE", "TIELEMANS"] },
  EGI: { punizioni: ["SALAH", "MARMOUSH"], angoli: ["SALAH", "MARMOUSH"] },
  IRN: { punizioni: ["GHODDOS"], angoli: ["GHODDOS"] },
  NUO: { punizioni: ["RANDALL", "SINGH"], angoli: ["PAYNE", "RANDALL"] },
  SPA: { punizioni: ["YAMAL", "OYARZABAL", "GRIMALDO GARCIA"], angoli: ["YAMAL", "OLMO", "GRIMALDO GARCIA"] },
  CAP: { punizioni: ["CABRAL"], angoli: ["CABRAL", "MONTEIRO J."] },
  ARA: { punizioni: ["AL-DAWSARI S."], angoli: ["AL-DAWSARI S."] },
  URU: { punizioni: ["VALVERDE"], angoli: ["DE LA CRUZ", "VALVERDE"] },
  FRA: { punizioni: ["OLISE", "CHERKI"], angoli: ["OLISE"] },
  SEN: { punizioni: ["MANE"], angoli: ["DIOUF", "CAMARA"] },
  IRQ: { punizioni: ["AL-AMMARI", "JASIM"], angoli: ["AL-AMMARI", "JASIM"] },
  NOR: { punizioni: ["ODEGAARD", "RYERSON"], angoli: ["ODEGAARD", "RYERSON"] },
  ARG: { punizioni: ["MESSI", "ALVAREZ", "DE PAUL"], angoli: ["MESSI", "DE PAUL"] },
  ALG: { punizioni: ["MAHREZ", "CHAIBI"], angoli: ["CHAIBI", "MAHREZ"] },
  UNB: { punizioni: ["SABITZER", "ALABA"], angoli: ["SABITZER", "ALABA"] },
  GIO: { punizioni: ["AL TAMARI", "AL MARDI"], angoli: ["AL TAMARI", "AL MARDI"] },
  POR: { punizioni: ["RONALDO", "FERNANDES"], angoli: ["FERNANDES", "SILVA BE.", "MENDES"] },
  COL: { punizioni: ["RODRIGUEZ JA."], angoli: ["RODRIGUEZ JA."] },
  CON: { punizioni: ["BONGONDA", "MASUAKU"], angoli: ["BONGONDA", "MASUAKU"] },
  UZB: { punizioni: ["FAYZULLAYEV", "SHUKUROV"], angoli: ["FAYZULLAYEV", "SHUKUROV"] },
  ING: { punizioni: ["KANE", "JAMES"], angoli: ["RICE"] },
  CRO: { punizioni: ["MODRIC", "PERISIC"], angoli: ["MODRIC", "BATURINA", "PERISIC"] },
  GHA: { punizioni: ["AYEW"], angoli: ["AYEW", "SULEMANA", "NUAMAH"] },
  PAN: { punizioni: ["ERIC DAVIS"], angoli: ["ERIC DAVIS", "CARRASQUILLA"] },
};

const rigText = fs.readFileSync(path.join(root, "rigoristi.txt"), "utf8");
const rigRaw = parseRigoristi(rigText);

const warnings = [];
const SET_PIECES_RAW = {};

const allNats = new Set([...Object.keys(PUN_ANG), ...Object.keys(rigRaw)]);

for (const nat of [...allNats].sort()) {
  const rigSrc = rigRaw[nat] || [];
  const rig = [];
  const used = new Set();

  for (const raw of rigSrc) {
    const resolved = resolveName(nat, raw);
    if (resolved && !used.has(resolved)) {
      rig.push(resolved);
      used.add(resolved);
    } else if (!resolved) {
      warnings.push(`RIG ${nat}: "${raw}" non trovato nel listone`);
    }
  }

  const pa = PUN_ANG[nat] || { punizioni: [], angoli: [] };
  const filter = (arr) => arr.filter((n) => (byNat[nat] || []).includes(n));

  SET_PIECES_RAW[nat] = {
    rigoristi: rig,
    punizioni: filter(pa.punizioni),
    angoli: filter(pa.angoli),
  };
}

if (warnings.length) {
  console.warn("Avvisi risoluzione nomi:");
  warnings.forEach((w) => console.warn(" ", w));
}

const out = `// Rigoristi, punizioni e angoli per nazionale.
// Solo giocatori presenti in listone.json (grafia esatta).
// Rigoristi: rigoristi.txt (Goal.com / fonti WC2026)
// Punizioni/angoli: Bulinews / Squawka (giu 2026)
// Rigenera: node scripts/gen-set-pieces.mjs

import listone from "./listone.json" with { type: "json" };

const LISTONE_KEYS = new Set();
for (const ruolo of Object.keys(listone)) {
  for (const p of listone[ruolo]) {
    LISTONE_KEYS.add(\`\${p.nazione}|\${p.nome}\`);
  }
}

function onlyListone(nat, names) {
  return names.filter((n) => LISTONE_KEYS.has(\`\${nat}|\${n}\`));
}

const SET_PIECES_RAW = ${JSON.stringify(SET_PIECES_RAW, null, 2).replace(/"([^"]+)":/g, "$1:")};

export const SET_PIECES = Object.fromEntries(
  Object.entries(SET_PIECES_RAW).map(([nat, data]) => [
    nat,
    {
      rigoristi: onlyListone(nat, data.rigoristi),
      punizioni: onlyListone(nat, data.punizioni),
      angoli: onlyListone(nat, data.angoli),
    },
  ])
);

const SET_PIECES_INDEX = new Map();

for (const [nat, data] of Object.entries(SET_PIECES)) {
  const touch = (key, list) => {
    list.forEach((nome, i) => {
      const k = \`\${nat}|\${nome}\`;
      if (!SET_PIECES_INDEX.has(k)) {
        SET_PIECES_INDEX.set(k, { rig: null, pun: null, ang: null });
      }
      SET_PIECES_INDEX.get(k)[key] = i + 1;
    });
  };
  touch("rig", data.rigoristi);
  touch("pun", data.punizioni);
  touch("ang", data.angoli);
}

export function getPlayerSetPieces(nat, nome) {
  return SET_PIECES_INDEX.get(\`\${nat}|\${nome}\`) || null;
}
`;

fs.writeFileSync(path.join(root, "setPiecesData.js"), out, "utf8");
console.log("setPiecesData.js rigenerato.");
console.log("Nazionali:", Object.keys(SET_PIECES_RAW).length);
