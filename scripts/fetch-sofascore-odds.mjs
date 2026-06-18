/**
 * Scarica quote 1X2 gironi Mondiale 2026 da Sofascore (api.sofascore.com).
 * Uso: node scripts/fetch-sofascore-odds.mjs
 * Output: groupMatchOdds.json
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "groupMatchOdds.json");

const SOFA_TEAM_TO_APP = {
  Mexico: "Messico",
  "South Africa": "Sudafrica",
  "South Korea": "Corea del Sud",
  Czechia: "Cechia",
  Switzerland: "Svizzera",
  Canada: "Canada",
  "Bosnia & Herzegovina": "Bosnia",
  Bosnia: "Bosnia",
  Qatar: "Qatar",
  Brazil: "Brasile",
  Morocco: "Marocco",
  Scotland: "Scozia",
  Haiti: "Haiti",
  USA: "USA",
  Turkey: "Turchia",
  Paraguay: "Paraguay",
  Australia: "Australia",
  Germany: "Germania",
  Ecuador: "Ecuador",
  "Côte d'Ivoire": "Costa d'Avorio",
  "Ivory Coast": "Costa d'Avorio",
  Curaçao: "Curaçao",
  Curacao: "Curaçao",
  Netherlands: "Olanda",
  Japan: "Giappone",
  Sweden: "Svezia",
  Tunisia: "Tunisia",
  Belgium: "Belgio",
  Egypt: "Egitto",
  Iran: "Iran",
  "New Zealand": "Nuova Zelanda",
  Spain: "Spagna",
  Uruguay: "Uruguay",
  "Cape Verde": "Capo Verde",
  "Saudi Arabia": "Arabia Saudita",
  France: "Francia",
  Senegal: "Senegal",
  Norway: "Norvegia",
  Iraq: "Iraq",
  Argentina: "Argentina",
  Austria: "Austria",
  Algeria: "Algeria",
  Jordan: "Giordania",
  Portugal: "Portogallo",
  Colombia: "Colombia",
  "DR Congo": "Congo DR",
  "Congo DR": "Congo DR",
  Uzbekistan: "Uzbekistan",
  England: "Inghilterra",
  Croatia: "Croazia",
  Ghana: "Ghana",
  Panama: "Panama",
};

function sofaGet(url) {
  const raw = execFileSync(
    "curl.exe",
    ["-s", "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)", url],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
  );
  return JSON.parse(raw);
}

function fracToDecimal(frac) {
  if (!frac || typeof frac !== "string") return null;
  const parts = frac.split("/").map(Number);
  if (parts.length !== 2 || !parts[1]) return null;
  return Math.round((1 + parts[0] / parts[1]) * 100) / 100;
}

function mapTeam(name) {
  return SOFA_TEAM_TO_APP[name] || name;
}

function groupLetter(tournamentName) {
  return tournamentName?.match(/Group ([A-L])\b/i)?.[1]?.toUpperCase() || null;
}

function datesBetween(start, end) {
  const out = [];
  const d = new Date(start);
  const last = new Date(end);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function extract1x2(markets) {
  const m = markets?.find((x) => x.marketGroup === "1X2" && x.marketPeriod === "Full-time");
  if (!m) return null;
  const o = {};
  for (const c of m.choices) o[c.name] = fracToDecimal(c.fractionalValue);
  return { "1": o["1"], X: o.X, "2": o["2"], sourceId: m.sourceId };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const dates = datesBetween("2026-06-11", "2026-06-27");
const eventsById = new Map();

for (const date of dates) {
  const data = sofaGet(`https://api.sofascore.com/api/v1/sport/football/scheduled-events/${date}`);
  for (const e of data.events || []) {
    const tname = e.tournament?.name || "";
    if (!/FIFA World Cup,\s*Group/i.test(tname)) continue;
    const g = groupLetter(tname);
    if (!g) continue;
    eventsById.set(e.id, { ...e, group: g });
  }
  await sleep(120);
}

console.log(`Trovate ${eventsById.size} partite di girone su Sofascore`);

const matches = [];
let fetched = 0;
let failed = 0;

for (const [eventId, e] of eventsById) {
  let odds = null;
  try {
    const od = sofaGet(`https://api.sofascore.com/api/v1/event/${eventId}/odds/1/all`);
    odds = extract1x2(od.markets);
    if (odds) fetched++;
    else failed++;
  } catch {
    failed++;
  }
  const home = mapTeam(e.homeTeam.name);
  const away = mapTeam(e.awayTeam.name);
  matches.push({
    eventId,
    group: e.group,
    home,
    away,
    startTimestamp: e.startTimestamp,
    odds,
  });
  await sleep(80);
}

matches.sort((a, b) => (a.group + a.home).localeCompare(b.group + b.home));

const payload = {
  source: "Sofascore",
  fetchedAt: new Date().toISOString(),
  seasonId: 58210,
  tournamentId: 16,
  note: "Quote 1X2 Full-time (mercato principale Sofascore). 1=casa in tabella, 2=trasferta.",
  matches,
  stats: { total: matches.length, withOdds: fetched, missingOdds: failed },
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
console.log(`Salvato ${OUT} (${fetched} con quote, ${failed} senza)`);
