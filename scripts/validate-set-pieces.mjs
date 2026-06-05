import listone from "../listone.json" with { type: "json" };
import { SET_PIECES } from "../setPiecesData.js";

const byNat = {};
for (const ruolo of Object.keys(listone)) {
  for (const p of listone[ruolo]) {
    if (!byNat[p.nazione]) byNat[p.nazione] = new Set();
    byNat[p.nazione].add(p.nome);
  }
}

const missing = [];
for (const [nat, data] of Object.entries(SET_PIECES)) {
  const all = [...new Set([...data.rigoristi, ...data.punizioni, ...data.angoli])];
  for (const nome of all) {
    if (!byNat[nat]?.has(nome)) missing.push({ nat, nome });
  }
}

if (missing.length) {
  console.error("Nomi piazzati non presenti nel listone:");
  missing.forEach(({ nat, nome }) => console.error(`  ${nat} | ${nome}`));
  console.error(`Totale: ${missing.length}`);
  process.exit(1);
}

console.log("OK: tutti i nomi piazzati combaciano col listone.");
console.log("Per rigenerare da rigoristi.txt: node scripts/gen-set-pieces.mjs");
