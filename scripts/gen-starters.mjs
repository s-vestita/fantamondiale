import fs from "fs";

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

// Estrae il "core" (cognome) di un nome del listone, scartando le iniziali del nome.
// Formato tipico listone: "COGNOME INIZIALE." (es. "SIMON UN." -> SIMON, "VARGAS CA." -> VARGAS)
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

// Ordina le nazioni per lunghezza decrescente per evitare match parziali errati.
const NAT_ENTRIES = Object.entries(NAT).map(([k, v]) => [norm(k), v]).sort((a, b) => b[0].length - a[0].length);
function detectNat(str) {
  const s = norm(str);
  for (const [nk, v] of NAT_ENTRIES) {
    const re = new RegExp(`(^| )${nk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( |$|\\()`);
    if (re.test(s)) return v;
  }
  return null;
}

const starters = new Map();
let curNat = null;
for (const rawLine of form.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line) continue;
  if (/^(allenatore|ct\.|fonte|probabili formazioni|gruppo|________)/i.test(line)) {
    // riga header testuale: aggiorna comunque la nazione se presente (es. "PROBABILE FORMAZIONE NORVEGIA")
    const n = detectNat(line);
    if (n && !line.includes(":")) curNat = n;
    if (!line.includes(":")) continue;
  }
  const colonIdx = line.indexOf(":");
  const natFromLine = detectNat(line.split(":")[0]);
  if (natFromLine && colonIdx === -1) {
    curNat = natFromLine;
    continue;
  }
  if (colonIdx === -1) {
    const n = detectNat(line);
    if (n) curNat = n;
    continue;
  }
  const natCode = natFromLine || curNat;
  if (!natCode) continue;
  const body = line.slice(colonIdx + 1).replace(/\.\s*$/, "").replace(/ct\..*$/i, "");
  const slots = body
    .split(/[;,]/)
    .flatMap((g) => g.split("/"))
    .map((s) => s.trim())
    .filter(Boolean);
  if (slots.length < 6) continue; // scarta righe brevi (allenatori, note)
  if (natFromLine) curNat = natFromLine;
  const pool = byNat[natCode] || [];
  for (const slot of slots) {
    const stoks = slotTokens(slot);
    if (stoks.length === 0) continue;
    for (const p of pool) {
      if (playerMatchesSlot(p, stoks)) starters.set(`${p.nome}|${p.nazione}`, p);
    }
  }
}

fs.writeFileSync(
  "starters.json",
  JSON.stringify([...starters.values()].map(({ nome, nazione, ruolo }) => ({ nome, nazione, ruolo })), null, 2)
);
console.log("starters", starters.size);

for (const n of ["SIMON UN.", "OYARZABAL", "WILLIAMS NI.", "NYLAND", "TANGVIK", "YAMAL", "RANGEL", "RAUL RANGEL", "DE KETELAERE", "SON", "ITO"]) {
  const p = players.find((x) => x.nome === n);
  if (p) console.log(n, "->", starters.has(`${p.nome}|${p.nazione}`) ? "TITOLARE" : "panchina");
  else console.log(n, "-> (non nel listone)");
}
