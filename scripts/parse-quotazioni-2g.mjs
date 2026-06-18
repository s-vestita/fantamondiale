import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Nomi squadra Excel (minuscolo) → codice listone */
const SQUADRA_TO_NAT = {
  algeria: "ALG",
  "arabia saudita": "ARA",
  argentina: "ARG",
  australia: "AUS",
  austria: "UNB",
  belgio: "BEL",
  bosnia: "BOS",
  brasile: "BRA",
  canada: "CAN",
  "capo verde": "CAP",
  cechia: "CEC",
  colombia: "COL",
  congo: "CON",
  "corea del sud": "COR",
  "costa di avorio": "COS",
  croazia: "CRO",
  curacao: "CUR",
  ecuador: "ECU",
  egitto: "EGI",
  francia: "FRA",
  germania: "GER",
  ghana: "GHA",
  giappone: "GIA",
  giordania: "GIO",
  haiti: "HAI",
  inghilterra: "ING",
  iran: "IRN",
  iraq: "IRQ",
  marocco: "MAR",
  messico: "MES",
  norvegia: "NOR",
  "nuova zelanda": "NUO",
  olanda: "OLA",
  panama: "PAN",
  paraguay: "PAR",
  portogallo: "POR",
  qatar: "QAT",
  scozia: "SCO",
  senegal: "SEN",
  spagna: "SPA",
  "stati uniti": "STA",
  sudafrica: "SUD",
  svezia: "SVE",
  svizzera: "SVI",
  tunisia: "TUN",
  turchia: "TUR",
  uruguay: "URU",
  uzbekistan: "UZB",
};

/** Grafia listone → grafia Excel (stessa nazione) */
const NOME_ALIASES = {
  "EDERSON|BRA": "EDERSON MO.",
  "MATTHEW|STA": "MAT FRESE",
  "PONS|SPA": "GARCIA JO.",
  "DANILO OL.|BRA": "DANILO DS",
  "DANILO|BRA": "DANILO OL",
  "PASALIC M.|CRO": "PASALIC MARCO",
  "RODRIGUEZ|SPA": "RODRIGUEZ BEANA",
};

function squadraToNat(squadra) {
  const key = String(squadra || "").trim().toLowerCase();
  if (!key || key === "undefined") return null;
  return SQUADRA_TO_NAT[key] || null;
}

function normNome(n) {
  return String(n || "").trim().toUpperCase().replace(/\.+$/, "");
}

const xlsPath = path.join(root, "fc_quotazioni_mondiale_02.xls");
const listonePath = path.join(root, "listone.json");
const outPath = path.join(root, "listone_2g.json");

const wb = XLSX.readFile(xlsPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
const listone = JSON.parse(fs.readFileSync(listonePath, "utf8"));

const excelByKey = new Map();
const excelByNome = new Map();

for (const row of rows) {
  const nome = String(row.Giocatore || "").trim().toUpperCase();
  const nazione = squadraToNat(row.Squadra);
  const quot = Number(row.Quotazione);
  if (!nome || Number.isNaN(quot)) continue;

  if (nazione) {
    excelByKey.set(`${nome}|${nazione}`, quot);
    const normKey = `${normNome(nome)}|${nazione}`;
    if (!excelByKey.has(normKey)) excelByKey.set(normKey, quot);
  } else {
    excelByNome.set(nome, quot);
    const norm = normNome(nome);
    if (!excelByNome.has(norm)) excelByNome.set(norm, quot);
  }
}

function lookupQuotazione(p) {
  const nome = p.nome.toUpperCase();
  const key = `${nome}|${p.nazione}`;

  if (excelByKey.has(key)) return excelByKey.get(key);

  const alias = NOME_ALIASES[key];
  if (alias) {
    const aliasKey = `${alias}|${p.nazione}`;
    if (excelByKey.has(aliasKey)) return excelByKey.get(aliasKey);
  }

  const normKey = `${normNome(p.nome)}|${p.nazione}`;
  if (excelByKey.has(normKey)) return excelByKey.get(normKey);

  if (excelByNome.has(nome)) return excelByNome.get(nome);
  if (excelByNome.has(normNome(p.nome))) return excelByNome.get(normNome(p.nome));

  return null;
}

const out = { portieri: [], difensori: [], centrocampisti: [], attaccanti: [] };
const missing = [];
let updated = 0;

for (const cat of Object.keys(out)) {
  for (const p of listone[cat]) {
    const nuovo = lookupQuotazione(p);
    if (nuovo != null) {
      out[cat].push({ nome: p.nome, nazione: p.nazione, valore: nuovo });
      if (nuovo !== p.valore) updated++;
    } else {
      out[cat].push({ ...p });
      missing.push({ ...p, cat });
    }
  }
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");

const count = (o) => Object.values(o).reduce((a, arr) => a + arr.length, 0);
console.log("Creato", outPath);
console.log("Giocatori:", count(out));
console.log("Quotazioni aggiornate:", updated);
console.log("Senza match in excel (valore iniziale):", missing.length);
if (missing.length) {
  console.log(
    missing.map((m) => `${m.nome} (${m.nazione}) ${m.valore}`).join("\n")
  );
}
