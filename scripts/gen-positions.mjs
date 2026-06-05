/**
 * Genera positions.json dalle probabili formazioni Fantamaster.
 * Uso: node scripts/gen-positions.mjs
 */
import fs from "fs";
import { positionsForModule, normalizeModule } from "../formationPositions.js";

const listone = JSON.parse(fs.readFileSync("listone.json", "utf8"));
const form = fs.readFileSync("formazioni_tipo_05_06_2026.txt", "utf8");

const NAT = {
  MESSICO: "MES", SUDAFRICA: "SUD", "REPUBBLICA CECA": "CEC", "COREA DEL SUD": "COR",
  SVIZZERA: "SVI", BOSNIA: "BOS", CANADA: "CAN", QATAR: "QAT", BRASILE: "BRA",
  MAROCCO: "MAR", SCOZIA: "SCO", HAITI: "HAI", TURCHIA: "TUR", USA: "STA",
  "STATI UNITI": "STA", PARAGUAY: "PAR", AUSTRALIA: "AUS", GERMANIA: "GER",
  ECUADOR: "ECU", "COSTA D'AVORIO": "COS", "COSTA D AVORIO": "COS", CURACAO: "CUR",
  CURAÇAO: "CUR", OLANDA: "OLA", "PAESI BASSI": "OLA", GIAPPONE: "GIA", TUNISIA: "TUN",
  SVEZIA: "SVE", BELGIO: "BEL", EGITTO: "EGI", "NUOVA ZELANDA": "NUO", IRAN: "IRN",
  SPAGNA: "SPA", "CAPO VERDE": "CAP", URUGUAY: "URU", "ARABIA SAUDITA": "ARA",
  FRANCIA: "FRA", SENEGAL: "SEN", NOVERGIA: "NOR", NORVEGIA: "NOR", IRAQ: "IRQ",
  ARGENTINA: "ARG", ALGERIA: "ALG", AUSTRIA: "UNB", GIORDANIA: "GIO", PORTOGALLO: "POR",
  COLOMBIA: "COL", CONGO: "CON", "CONGO DR": "CON", "REPUBBLICA DEMOCRATICA DEL CONGO": "CON",
  UZBEKISTAN: "UZB", INGHILTERRA: "ING", CROAZIA: "CRO", PANAMA: "PAN", GHANA: "GHA",
  CECHIA: "CEC", "REP. CECA": "CEC",
};

const players = [];
for (const r of ["portieri", "difensori", "centrocampisti", "attaccanti"]) {
  listone[r].forEach((p) => players.push({ ...p, ruolo: r }));
}
const byNat = {};
players.forEach((p) => {
  (byNat[p.nazione] ||= []).push(p);
});

const norm = (s) =>
  s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9.\- ]/g, " ").replace(/\s+/g, " ").trim();

function coreInfo(nome) {
  const n = norm(nome).replace(/-/g, " ");
  let toks = n.split(" ").filter(Boolean);
  while (toks.length > 1 && /\.$/.test(toks[toks.length - 1])) toks.pop();
  toks = toks.map((t) => t.replace(/\./g, ""));
  const key = toks.slice().sort((a, b) => b.length - a.length)[0] || "";
  return { toks, key };
}

function slotTokens(slot) {
  return norm(slot).replace(/-/g, " ").split(" ").map((t) => t.replace(/\./g, "")).filter(Boolean);
}

function playerMatchesSlot(player, stoks) {
  const { toks, key } = coreInfo(player.nome);
  if (key.length >= 3 && stoks.includes(key)) return true;
  if (toks.length >= 2 && toks[0].length >= 5 && stoks.includes(toks[0])) return true;
  return false;
}

const NAT_ENTRIES = Object.entries(NAT).map(([k, v]) => [norm(k), v]).sort((a, b) => b[0].length - a[0].length);

function detectNat(str) {
  const s = norm(str);
  for (const [nk, v] of NAT_ENTRIES) {
    const re = new RegExp(`(^| )${nk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( |$|\\()`);
    if (re.test(s)) return v;
  }
  return null;
}

function parseSlots(body) {
  return body
    .split(/[;,]/)
    .flatMap((g) => g.split("/"))
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractModule(line) {
  const m = line.match(/\((\d(?:-\d)+)\)/);
  return m ? normalizeModule(m[1]) : null;
}

/** @type {Map<string, string>} */
const positions = new Map();
let curNat = null;

for (const rawLine of form.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line) continue;
  if (/^(allenatore|ct\.|fonte|probabili formazioni|gruppo|________)/i.test(line)) {
    const n = detectNat(line);
    if (n && !line.includes(":")) curNat = n;
    if (!line.includes(":")) continue;
  }

  const colonIdx = line.indexOf(":");
  const head = colonIdx >= 0 ? line.slice(0, colonIdx) : line;
  const natFromLine = detectNat(head);
  if (colonIdx === -1) {
    if (natFromLine) curNat = natFromLine;
    continue;
  }

  const natCode = natFromLine || curNat;
  if (!natCode) continue;

  const module = extractModule(line);
  const body = line.slice(colonIdx + 1).replace(/\.\s*$/, "").replace(/ct\..*$/i, "");
  const slots = parseSlots(body);
  if (slots.length < 6 || !module) continue;
  if (natFromLine) curNat = natFromLine;

  const posList = positionsForModule(module, slots.length);
  const pool = byNat[natCode] || [];

  slots.forEach((slot, idx) => {
    const pos = posList[idx] || posList[posList.length - 1] || "CC";
    const stoks = slotTokens(slot);
    if (!stoks.length) return;
    for (const p of pool) {
      if (playerMatchesSlot(p, stoks)) {
        positions.set(`${p.nome}|${p.nazione}`, pos);
      }
    }
  });
}

const out = Object.fromEntries(positions.entries());
fs.writeFileSync("positions.json", JSON.stringify(out, null, 2));
console.log("positions", positions.size);

const checks = [
  ["MAIGNAN", "FRA", "POR"],
  ["KOUNDE", "FRA", "DD"],
  ["MBAPPE", "FRA", "ATT"],
  ["COUFAL", "CEC", "E"],
  ["SON", "COR", "ATT"],
  ["HAKIMI", "MAR", "DD"],
  ["DE BRUYNE", "BEL", "TRQ"],
  ["PEDRI", "SPA", "CC"],
];
for (const [nome, nat, exp] of checks) {
  const got = positions.get(`${nome}|${nat}`);
  console.log(nome, got === exp ? got : `${got} (atteso ${exp})`);
}
