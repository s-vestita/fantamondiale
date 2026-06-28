/** Tabellone knockout Mondiale 2026 — slot ufficiali FIFA (condiviso). */

export const R32 = [
  { m: 73, a: { t: "ru", g: "A" }, b: { t: "ru", g: "B" } },
  { m: 74, a: { t: "w", g: "E" }, b: { t: "3", elig: ["A", "B", "C", "D", "F"] } },
  { m: 75, a: { t: "w", g: "F" }, b: { t: "ru", g: "C" } },
  { m: 76, a: { t: "w", g: "C" }, b: { t: "ru", g: "F" } },
  { m: 77, a: { t: "w", g: "I" }, b: { t: "3", elig: ["C", "D", "F", "G", "H"] } },
  { m: 78, a: { t: "ru", g: "E" }, b: { t: "ru", g: "I" } },
  { m: 79, a: { t: "w", g: "A" }, b: { t: "3", elig: ["C", "E", "F", "H", "I"] } },
  { m: 80, a: { t: "w", g: "L" }, b: { t: "3", elig: ["E", "H", "I", "J", "K"] } },
  { m: 81, a: { t: "w", g: "D" }, b: { t: "3", elig: ["B", "E", "F", "I", "J"] } },
  { m: 82, a: { t: "w", g: "G" }, b: { t: "3", elig: ["A", "E", "H", "I", "J"] } },
  { m: 83, a: { t: "ru", g: "K" }, b: { t: "ru", g: "L" } },
  { m: 84, a: { t: "w", g: "H" }, b: { t: "ru", g: "J" } },
  { m: 85, a: { t: "w", g: "B" }, b: { t: "3", elig: ["E", "F", "G", "I", "J"] } },
  { m: 86, a: { t: "w", g: "J" }, b: { t: "ru", g: "H" } },
  { m: 87, a: { t: "w", g: "K" }, b: { t: "3", elig: ["D", "E", "I", "J", "L"] } },
  { m: 88, a: { t: "ru", g: "D" }, b: { t: "ru", g: "G" } },
];

export const LATER = {
  89: [74, 77], 90: [73, 75], 91: [76, 78], 92: [79, 80], 93: [83, 84], 94: [81, 82], 95: [86, 88], 96: [85, 87],
  97: [89, 90], 98: [93, 94], 99: [91, 92], 100: [95, 96], 101: [97, 98], 102: [99, 100], 104: [101, 102],
};

export const ROUNDS = [
  { name: "Sedicesimi", ms: R32.map((r) => r.m) },
  { name: "Ottavi", ms: [89, 90, 91, 92, 93, 94, 95, 96] },
  { name: "Quarti", ms: [97, 98, 99, 100] },
  { name: "Semifinali", ms: [101, 102] },
  { name: "Finale", ms: [104] },
];

export const feedsInto = {};
Object.entries(LATER).forEach(([parent, kids]) => kids.forEach((k) => (feedsInto[k] = +parent)));

/** Layout tabellone a metà sinistra / destra (ordine verticale = coppie che si incrociano). */
export const BRACKET_LAYOUT = {
  left: {
    r32: [73, 75, 74, 77, 76, 78, 79, 80],
    ott: [90, 89, 91, 92],
    quart: [97, 99],
    semi: [101],
  },
  right: {
    r32: [81, 82, 83, 84, 85, 87, 86, 88],
    ott: [94, 93, 96, 95],
    quart: [98, 100],
    semi: [102],
  },
  final: 104,
};

export const BRACKET_ROUND_LABELS = {
  r32: "Sedicesimi",
  ott: "Ottavi",
  quart: "Quarti",
  semi: "Semifinale",
  final: "Finale",
};

/** Codice compatto slot: 1A, 2K, 3·ABCF (terza da sorteggiare). */
export function slotCodeShort(slot, thirdGroup) {
  if (!slot) return "—";
  if (slot.t === "w") return `1${slot.g}`;
  if (slot.t === "ru") return `2${slot.g}`;
  if (slot.t === "3") {
    if (thirdGroup) return `3${thirdGroup}`;
    return `3·${slot.elig.join("")}`;
  }
  return "?";
}

/** Etichetta accoppiamento ufficiale (es. 2A vs 2B, 1E vs 3·ABCF). */
export function r32PairLabel(r, thirdsMap = {}) {
  const tg = thirdsMap[r.m];
  const a = slotCodeShort(r.a, r.a.t === "3" ? tg : null);
  const b = slotCodeShort(r.b, r.b.t === "3" ? tg : null);
  return `${a} vs ${b}`;
}

/** Sedicesimi — schema accoppiamenti FIFA Mondiale 2026. */
export const R32_OFFICIAL_PAIRINGS = R32.map((r) => ({
  m: r.m,
  pair: r32PairLabel(r),
  slotA: r.a,
  slotB: r.b,
}));

/** Girone numerico (1–12) → lettera FIFA (A–L). */
export function gironeToLetter(n) {
  return String.fromCharCode(64 + n);
}

/** Assegna le 8 migliori terze agli slot R32 (forza = fantapunti della terza). */
export function pickThirdSlotsFantapunti(place, r32, fpByGroup) {
  const thirds = Object.keys(place).map((g) => ({
    g,
    team: place[g][2],
    fantapunti: fpByGroup[g] ?? 0,
  }));
  thirds.sort((a, b) => b.fantapunti - a.fantapunti);
  const qualified = new Set(thirds.slice(0, 8).map((t) => t.g));
  const used = new Set();
  const result = {};

  r32.forEach((r) => {
    const slot = r.a.t === "3" ? r.a : r.b.t === "3" ? r.b : null;
    if (!slot) return;
    const candidates = slot.elig
      .filter((g) => qualified.has(g) && !used.has(g))
      .sort((a, b) => (fpByGroup[b] ?? 0) - (fpByGroup[a] ?? 0));
    if (candidates.length) {
      result[r.m] = candidates[0];
      used.add(candidates[0]);
    }
  });

  return { thirdsMap: result, qualifiedThirds: thirds.filter((t) => qualified.has(t.g)), eliminatedThirds: thirds.filter((t) => !qualified.has(t.g)) };
}
