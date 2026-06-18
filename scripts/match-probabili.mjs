import { buildListone } from "../fantamondialeLogic.js";
import { GROUPS, FIXTURES, ABBR } from "../tournamentData.js";
import { PROBABILI_RAW } from "../squadreProbabili.js";
import { resolveProbabilePlayer } from "../squadreAnalisiLogic.js";

const listonePlayers = buildListone(GROUPS, FIXTURES, ABBR);

function findPlayer(nat, raw) {
  const p = resolveProbabilePlayer(nat, raw, listonePlayers);
  if (p) return { nome: p.nome, ruolo: p.ruolo, raw };
  return { nome: null, raw };
}

const missing = [];
for (const [nat, { modulo, nomi }] of Object.entries(PROBABILI_RAW)) {
  const res = nomi.map((n) => findPlayer(nat, n));
  const miss = res.filter((r) => !r.nome);
  if (miss.length) missing.push({ nat, miss });
  console.log(`${nat} (${modulo}):`);
  res.forEach((r, i) =>
    console.log(`  ${i} ${r.nome || "MISSING:" + r.raw}${r.guess && !r.nome ? " ~" + r.guess : ""}`)
  );
}
console.log("\n=== MISSING SUMMARY ===");
missing.forEach((m) => console.log(m.nat, m.miss.map((x) => x.raw).join(", ")));
