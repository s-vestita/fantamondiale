import { buildListone, autoBuildRosa, ROSA_LIMITS } from "../fantamondialeLogic.js";

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
  Messico: 73, "Corea del Sud": 68, Cechia: 64, Sudafrica: 56, Svizzera: 75, Canada: 67, Bosnia: 62, Qatar: 55,
  Brasile: 91, Marocco: 80, Scozia: 64, Haiti: 47, USA: 72, Turchia: 73, Paraguay: 63, Australia: 60,
  Germania: 86, Ecuador: 70, "Costa d'Avorio": 69, "Curaçao": 45, Olanda: 85, Giappone: 72, Svezia: 71, Tunisia: 60,
  Belgio: 83, Egitto: 68, Iran: 65, "Nuova Zelanda": 50, Spagna: 92, Uruguay: 80, "Capo Verde": 52, "Arabia Saudita": 56,
  Francia: 94, Senegal: 76, Norvegia: 75, Iraq: 54, Argentina: 92, Austria: 70, Algeria: 64, Giordania: 52,
  Portogallo: 86, Colombia: 77, "Congo DR": 61, Uzbekistan: 55, Inghilterra: 89, Croazia: 80, Ghana: 64, Panama: 55,
};
const ABBR = {};
Object.keys(STR).forEach((t) => (ABBR[t] = t.slice(0, 3).toUpperCase()));
const FIXTURES = {
  A: [[1, "Messico", "Sudafrica"], [1, "Corea del Sud", "Cechia"], [2, "Cechia", "Sudafrica"], [2, "Messico", "Corea del Sud"], [3, "Cechia", "Messico"], [3, "Sudafrica", "Corea del Sud"]],
  B: [[1, "Canada", "Bosnia"], [1, "Qatar", "Svizzera"], [2, "Svizzera", "Bosnia"], [2, "Canada", "Qatar"], [3, "Svizzera", "Canada"], [3, "Bosnia", "Qatar"]],
  C: [[1, "Brasile", "Marocco"], [1, "Haiti", "Scozia"], [2, "Scozia", "Marocco"], [2, "Brasile", "Haiti"], [3, "Scozia", "Brasile"], [3, "Marocco", "Haiti"]],
  D: [[1, "USA", "Paraguay"], [1, "Australia", "Turchia"], [2, "USA", "Australia"], [2, "Turchia", "Paraguay"], [3, "Turchia", "USA"], [3, "Paraguay", "Australia"]],
  E: [[1, "Germania", "Curaçao"], [1, "Costa d'Avorio", "Ecuador"], [2, "Germania", "Costa d'Avorio"], [2, "Ecuador", "Curaçao"], [3, "Ecuador", "Germania"], [3, "Curaçao", "Costa d'Avorio"]],
  F: [[1, "Olanda", "Giappone"], [1, "Svezia", "Tunisia"], [2, "Olanda", "Svezia"], [2, "Tunisia", "Giappone"], [3, "Giappone", "Svezia"], [3, "Tunisia", "Olanda"]],
  G: [[1, "Belgio", "Egitto"], [1, "Iran", "Nuova Zelanda"], [2, "Belgio", "Iran"], [2, "Nuova Zelanda", "Egitto"], [3, "Egitto", "Iran"], [3, "Nuova Zelanda", "Belgio"]],
  H: [[1, "Spagna", "Capo Verde"], [1, "Arabia Saudita", "Uruguay"], [2, "Spagna", "Arabia Saudita"], [2, "Uruguay", "Capo Verde"], [3, "Capo Verde", "Arabia Saudita"], [3, "Uruguay", "Spagna"]],
  I: [[1, "Francia", "Senegal"], [1, "Iraq", "Norvegia"], [2, "Francia", "Iraq"], [2, "Norvegia", "Senegal"], [3, "Norvegia", "Francia"], [3, "Senegal", "Iraq"]],
  J: [[1, "Argentina", "Algeria"], [1, "Austria", "Giordania"], [2, "Argentina", "Austria"], [2, "Giordania", "Algeria"], [3, "Algeria", "Austria"], [3, "Giordania", "Argentina"]],
  K: [[1, "Portogallo", "Congo DR"], [1, "Uzbekistan", "Colombia"], [2, "Portogallo", "Uzbekistan"], [2, "Colombia", "Congo DR"], [3, "Colombia", "Portogallo"], [3, "Congo DR", "Uzbekistan"]],
  L: [[1, "Inghilterra", "Croazia"], [1, "Ghana", "Panama"], [2, "Inghilterra", "Ghana"], [2, "Panama", "Croazia"], [3, "Panama", "Inghilterra"], [3, "Croazia", "Ghana"]],
};

const all = buildListone(GROUPS, FIXTURES, ABBR);
const sel = autoBuildRosa(all);
let total = 0;
for (const r of Object.keys(ROSA_LIMITS)) {
  const list = sel[r];
  const cost = list.reduce((s, p) => s + p.valore, 0);
  total += cost;
  console.log(`\n${r.toUpperCase()} (${list.length}/${ROSA_LIMITS[r]}) — ${cost} cr`);
  list.sort((a, b) => b.valore - a.valore).forEach((p) => console.log(`  ${p.valore.toString().padStart(2)}cr  ${p.fascia.padEnd(8)} ${p.nome} (${p.team})`));
}
console.log(`\nTOTALE: ${total}/250 cr — margine ${250 - total}`);
