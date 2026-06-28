import classificheData from "./classifiche_gironi.json" with { type: "json" };
import { NAT_TO_TEAM } from "./fantamondialeLogic.js";
import { ABBR } from "./tournamentData.js";
import { R32, gironeToLetter } from "./tournamentBracket.js";

/** Nomi nel JSON classifiche → nomi canonici del torneo. */
export const TEAM_ALIASES = {
  "Repubblica Ceca": "Cechia",
  "Stati Uniti": "USA",
  Curacao: "Curaçao",
  Congo: "Congo DR",
};

export function normalizeTeamName(nome) {
  return TEAM_ALIASES[nome] || nome;
}

const CANONICAL_TO_NAT = Object.fromEntries(
  Object.entries(NAT_TO_TEAM).map(([nat, t]) => [t, nat])
);

export function teamNatCode(team) {
  const canon = normalizeTeamName(team);
  return CANONICAL_TO_NAT[canon] || null;
}

export function sortStandings(squadre) {
  return [...squadre].sort((a, b) => {
    if (b.PU !== a.PU) return b.PU - a.PU;
    const gdA = a.GF - a.GS;
    const gdB = b.GF - b.GS;
    if (gdB !== gdA) return gdB - gdA;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return b.fantapunti - a.fantapunti;
  });
}

function buildPlaceFromGironi(gironi) {
  const place = {};
  const fpByGroup = {};
  const gironiProcessed = gironi
    .slice()
    .sort((a, b) => a.girone - b.girone)
    .map((g) => {
      const letter = gironeToLetter(g.girone);
      const sorted = sortStandings(g.squadre).map((s) => ({
        ...s,
        nomeCanon: normalizeTeamName(s.nome),
      }));
      place[letter] = sorted.map((s) => s.nomeCanon);
      fpByGroup[letter] = sorted[2]?.fantapunti ?? 0;
      return { ...g, letter, sorted };
    });
  return { place, fpByGroup, gironiProcessed };
}

export function compareFootballStats(a, b) {
  if (b.PU !== a.PU) return b.PU - a.PU;
  const gdA = a.GF - a.GS;
  const gdB = b.GF - b.GS;
  if (gdB !== gdA) return gdB - gdA;
  if (b.GF !== a.GF) return b.GF - a.GF;
  return b.fantapunti - a.fantapunti;
}

/** Le 8 migliori terze: prima punti girone, poi diff reti, GF, fantapunti. */
export function rankThirds(gironiProcessed) {
  const thirds = gironiProcessed.map((g) => {
    const s = g.sorted[2];
    return {
      g: g.letter,
      girone: g.girone,
      team: s.nomeCanon,
      PU: s.PU,
      GF: s.GF,
      GS: s.GS,
      fantapunti: s.fantapunti,
    };
  });
  thirds.sort(compareFootballStats);
  const qualifiedThirds = thirds.slice(0, 8);
  const eliminatedThirds = thirds.slice(8);
  const qualifiedThirdGroups = new Set(qualifiedThirds.map((t) => t.g));
  return { qualifiedThirds, eliminatedThirds, qualifiedThirdGroups };
}

/** Tutte le 16 squadre eliminate (12 ultime + 4 terze escluse). */
export function getEliminatedTeams(gironiProcessed, qualifiedThirdGroups) {
  const out = [];
  for (const g of gironiProcessed) {
    g.sorted.forEach((s, i) => {
      const pos = i + 1;
      if (pos === 4) {
        out.push({
          team: s.nomeCanon,
          utente: s.utente,
          girone: g.girone,
          letter: g.letter,
          pos,
          reason: "4º posto nel girone",
          fantapunti: s.fantapunti,
        });
      } else if (pos === 3 && !qualifiedThirdGroups.has(g.letter)) {
        out.push({
          team: s.nomeCanon,
          utente: s.utente,
          girone: g.girone,
          letter: g.letter,
          pos,
          reason: "3º posto — esclusa dal confronto terze",
          fantapunti: s.fantapunti,
        });
      }
    });
  }
  return out.sort((a, b) => a.girone - b.girone);
}

/** Slot terze nel tabellone (schema FIFA). */
export function getThirdSlots(r32 = R32) {
  return r32
    .filter((r) => r.a.t === "3" || r.b.t === "3")
    .map((r) => ({
      m: r.m,
      slot: r.a.t === "3" ? r.a : r.b,
      fixed: r.a.t === "3" ? r.b : r.a,
    }));
}

/**
 * Sorteggio casuale delle 8 terze qualificate negli slot R32.
 * Rispetta gli elig ufficiali (nessun incrocio nello stesso girone).
 */
export function randomDrawThirdSlots(qualifiedGroups, r32 = R32) {
  const slots = getThirdSlots(r32);
  const remaining = [...qualifiedGroups];

  function backtrack(idx, left, acc) {
    if (idx === slots.length) return { ...acc };
    const { m, slot } = slots[idx];
    const candidates = left.filter((g) => slot.elig.includes(g));
    // Fisher-Yates shuffle per casualità
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    for (const g of candidates) {
      const res = backtrack(idx + 1, left.filter((x) => x !== g), { ...acc, [m]: g });
      if (res) return res;
    }
    return null;
  }

  return backtrack(0, remaining, {});
}

export function slotLabel(slot, thirdGroup) {
  if (slot.t === "w") return `1º Girone ${slot.g}`;
  if (slot.t === "ru") return `2º Girone ${slot.g}`;
  if (slot.t === "3") {
    if (thirdGroup) return `3º Girone ${thirdGroup}`;
    return `3º (${slot.elig.join(" / ")})`;
  }
  return "";
}

export function matchPairLabel(slotA, slotB, thirdsMap, matchId) {
  const a = slotLabel({ ...slotA, _m: matchId }, slotA.t === "3" ? thirdsMap[matchId] : null);
  const b = slotLabel({ ...slotB, _m: matchId }, slotB.t === "3" ? thirdsMap[matchId] : null);
  return `${a} vs ${b}`;
}

export function buildR32Matches(place, thirdsMap = {}) {
  const resolveSlot = (slot, matchId) => {
    if (!slot) return null;
    if (slot.t === "w") return place[slot.g]?.[0] ?? null;
    if (slot.t === "ru") return place[slot.g]?.[1] ?? null;
    if (slot.t === "3") {
      const g = thirdsMap[matchId];
      return g ? place[g]?.[2] ?? null : null;
    }
    return null;
  };

  return R32.map((r) => ({
    m: r.m,
    a: resolveSlot(r.a, r.m),
    b: resolveSlot(r.b, r.m),
    slotA: r.a,
    slotB: r.b,
    thirdGroup: thirdsMap[r.m] || null,
    pairLabel: matchPairLabel(r.a, r.b, thirdsMap, r.m),
  }));
}

export function teamStatus(pos, groupLetter, qualifiedThirdGroups) {
  if (pos <= 2) return "qualified";
  if (pos === 3) return qualifiedThirdGroups.has(groupLetter) ? "third_wait" : "eliminated";
  return "eliminated";
}

export function buildFantamontemesolaState(data = classificheData) {
  const { place, fpByGroup, gironiProcessed } = buildPlaceFromGironi(data.gironi);
  const { qualifiedThirds, eliminatedThirds, qualifiedThirdGroups } = rankThirds(gironiProcessed);
  const eliminatedTeams = getEliminatedTeams(gironiProcessed, qualifiedThirdGroups);

  return {
    gironi: gironiProcessed,
    place,
    fpByGroup,
    qualifiedThirds,
    eliminatedThirds,
    qualifiedThirdGroups,
    eliminatedTeams,
    qualifiedThirdGroupList: qualifiedThirds.map((t) => t.g),
  };
}

export { ABBR, R32 };
