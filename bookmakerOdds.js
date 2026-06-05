// Quote vincente girone — media da più bookmaker (decimali, giu 2026).
// Fonti: TAB NZ/KICKOFF26, FanDuel (SI.com), bwin.it, BetMGM.
// Valore più basso = favorita al 1º posto.

export const ODDS_SOURCES = ["TAB NZ", "FanDuel", "bwin", "BetMGM"];

/** @type {Record<string, Record<string, number>>} */
export const GROUP_WINNER_ODDS = {
  A: { Messico: 1.81, "Corea del Sud": 3.72, Cechia: 4.58, Sudafrica: 10.67 },
  B: { Svizzera: 2.01, Canada: 2.88, Bosnia: 4.83, Qatar: 17.33 },
  C: { Brasile: 1.35, Marocco: 4.58, Scozia: 10.67, Haiti: 38.67 },
  D: { USA: 1.85, Turchia: 3.08, Paraguay: 5.83, Australia: 8.33 },
  E: { Germania: 1.32, Ecuador: 5.17, "Costa d'Avorio": 7.33, "Curaçao": 80.67 },
  F: { Olanda: 1.72, Giappone: 3.75, Svezia: 5.17, Tunisia: 10.33 },
  G: { Belgio: 1.44, Egitto: 4.92, Iran: 6.17, "Nuova Zelanda": 15.33 },
  H: { Spagna: 1.37, Uruguay: 4.08, "Arabia Saudita": 13.67, "Capo Verde": 24.67 },
  I: { Francia: 1.31, Norvegia: 4.58, Senegal: 6.33, Iraq: 32.67 },
  J: { Argentina: 1.33, Austria: 5.08, Algeria: 6.17, Giordania: 30.67 },
  K: { Portogallo: 1.51, Colombia: 3.25, "Congo DR": 9.33, Uzbekistan: 22.67 },
  L: { Inghilterra: 1.42, Croazia: 4.08, Ghana: 9.33, Panama: 28.67 },
};

function strengthFromOdds(odds) {
  return 1 / Math.max(odds, 1.01);
}

function matchOutcome(home, away, strengths) {
  const sh = strengths[home];
  const sa = strengths[away];
  const gap = Math.abs(sh - sa) / Math.max(sh, sa);
  const drawP = Math.max(0.14, 0.32 - gap * 0.45);
  const rem = 1 - drawP;
  const ph = (sh / (sh + sa)) * rem;
  const pa = rem - ph;
  if (ph >= pa && ph >= drawP) return "H";
  if (pa >= drawP) return "A";
  return "D";
}

/**
 * Simula classifica girone usando quote vincente girone come forza relativa
 * e esiti più probabili su ogni partita del calendario.
 */
export function simulateGroupStandings(groupKey, teams, fixtures, oddsMap = GROUP_WINNER_ODDS) {
  const odds = oddsMap[groupKey] || {};
  const strengths = Object.fromEntries(teams.map((t) => [t, strengthFromOdds(odds[t] || 50)]));
  const pts = Object.fromEntries(teams.map((t) => [t, 0]));
  const gf = Object.fromEntries(teams.map((t) => [t, 0]));
  const ga = Object.fromEntries(teams.map((t) => [t, 0]));

  (fixtures[groupKey] || []).forEach(([, home, away]) => {
    const out = matchOutcome(home, away, strengths);
    if (out === "H") {
      pts[home] += 3;
      gf[home] += 1;
      ga[away] += 1;
    } else if (out === "A") {
      pts[away] += 3;
      gf[away] += 1;
      ga[home] += 1;
    } else {
      pts[home] += 1;
      pts[away] += 1;
    }
  });

  return [...teams].sort((a, b) => {
    if (pts[b] !== pts[a]) return pts[b] - pts[a];
    const gdA = gf[a] - ga[a];
    const gdB = gf[b] - ga[b];
    if (gdB !== gdA) return gdB - gdA;
    if (gf[b] !== gf[a]) return gf[b] - gf[a];
    return (odds[a] || 99) - (odds[b] || 99);
  });
}

/** Ordina 1º→4º solo per quote vincente girone (fallback). */
export function orderGroupByOdds(groupKey, teams, oddsMap = GROUP_WINNER_ODDS) {
  const odds = oddsMap[groupKey] || {};
  return [...teams].sort((a, b) => (odds[a] || 99) - (odds[b] || 99));
}

/**
 * Assegna le migliori terze ai slot R32 in base a forza (da quote).
 */
export function pickThirdSlots(place, r32, oddsMap = GROUP_WINNER_ODDS) {
  const thirds = Object.keys(place).map((g) => {
    const team = place[g][2];
    const odds = oddsMap[g]?.[team] ?? 50;
    return { g, team, strength: strengthFromOdds(odds) };
  });
  thirds.sort((a, b) => b.strength - a.strength);
  const qualified = new Set(thirds.slice(0, 8).map((t) => t.g));
  const used = new Set();
  const result = {};

  r32.forEach((r) => {
    const slot = r.a.t === "3" ? r.a : r.b.t === "3" ? r.b : null;
    if (!slot) return;
    const candidates = slot.elig
      .filter((g) => qualified.has(g) && !used.has(g))
      .sort((a, b) => {
        const sa = strengthFromOdds(oddsMap[a]?.[place[a][2]] ?? 50);
        const sb = strengthFromOdds(oddsMap[b]?.[place[b][2]] ?? 50);
        return sb - sa;
      });
    if (candidates.length) {
      result[r.m] = candidates[0];
      used.add(candidates[0]);
    }
  });

  return result;
}
