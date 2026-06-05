/**
 * Clean sheet, Over 2.5 e BTTS — incrocio per squadra/giornata.
 * Fonte: clean_sheet_over25_mondiali2026.md (xG RotoWire, modello Poisson).
 */

/** @type {{ g: number, home: string, away: string, xgH: number, xgA: number, over: number, btts: number, hot?: boolean }[]} */
export const PARTITE_OVER25 = [
  { g: 1, home: "GER", away: "CUR", xgH: 3.25, xgA: 0.42, over: 71, btts: 33, hot: true },
  { g: 1, home: "SPA", away: "CAP", xgH: 3.47, xgA: 0.67, over: 78, btts: 47, hot: true },
  { g: 1, home: "BRA", away: "MAR", xgH: 2.46, xgA: 1.12, over: 69, btts: 62, hot: true },
  { g: 1, home: "FRA", away: "SEN", xgH: 2.21, xgA: 0.97, over: 62, btts: 55, hot: true },
  { g: 1, home: "ING", away: "CRO", xgH: 2.04, xgA: 1.27, over: 64, btts: 63, hot: true },
  { g: 1, home: "ARG", away: "ALG", xgH: 2.03, xgA: 0.92, over: 57, btts: 52 },
  { g: 1, home: "POR", away: "CON", xgH: 2.37, xgA: 0.59, over: 57, btts: 41 },
  { g: 1, home: "BEL", away: "EGI", xgH: 2.08, xgA: 0.98, over: 59, btts: 55 },
  { g: 1, home: "UZB", away: "COL", xgH: 0.57, xgA: 2.02, over: 48, btts: 38 },
  { g: 1, home: "OLA", away: "GIA", xgH: 1.86, xgA: 1.0, over: 55, btts: 53 },
  { g: 1, home: "SVI", away: "QAT", xgH: 2.27, xgA: 0.58, over: 54, btts: 40 },
  { g: 1, home: "IRQ", away: "NOR", xgH: 0.63, xgA: 1.91, over: 46, btts: 40 },
  { g: 1, home: "UNB", away: "GIO", xgH: 1.68, xgA: 0.65, over: 45, btts: 39 },
  { g: 1, home: "MES", away: "SUD", xgH: 2.07, xgA: 0.59, over: 50, btts: 39 },
  { g: 1, home: "STA", away: "PAR", xgH: 1.64, xgA: 0.92, over: 47, btts: 49 },
  { g: 1, home: "CAN", away: "BOS", xgH: 1.32, xgA: 1.12, over: 44, btts: 49 },
  { g: 1, home: "COS", away: "ECU", xgH: 1.23, xgA: 1.25, over: 44, btts: 51 },
  { g: 1, home: "AUS", away: "TUR", xgH: 0.85, xgA: 1.34, over: 38, btts: 42 },
  { g: 1, home: "COR", away: "CEC", xgH: 1.06, xgA: 1.17, over: 39, btts: 45 },
  { g: 1, home: "SVE", away: "TUN", xgH: 1.34, xgA: 0.79, over: 38, btts: 40 },
  { g: 1, home: "IRN", away: "NUO", xgH: 1.29, xgA: 0.73, over: 33, btts: 38 },
  { g: 1, home: "ARA", away: "URU", xgH: 0.73, xgA: 1.86, over: 48, btts: 44 },
  { g: 1, home: "HAI", away: "SCO", xgH: 0.6, xgA: 1.48, over: 35, btts: 35 },
  { g: 1, home: "GHA", away: "PAN", xgH: 1.15, xgA: 0.7, over: 28, btts: 35 },
  { g: 2, home: "GER", away: "COS", xgH: 2.71, xgA: 0.99, over: 71, btts: 59, hot: true },
  { g: 2, home: "NOR", away: "SEN", xgH: 1.59, xgA: 1.21, over: 53, btts: 56 },
  { g: 2, home: "ARG", away: "UNB", xgH: 2.03, xgA: 1.12, over: 62, btts: 59, hot: true },
  { g: 2, home: "BEL", away: "IRN", xgH: 2.08, xgA: 0.86, over: 56, btts: 50 },
  { g: 2, home: "OLA", away: "SVE", xgH: 1.86, xgA: 0.89, over: 52, btts: 50 },
  { g: 2, home: "MES", away: "COR", xgH: 1.72, xgA: 0.85, over: 48, btts: 47 },
  { g: 2, home: "ARA", away: "SPA", xgH: 0.58, xgA: 3.47, over: 77, btts: 43, hot: true },
  { g: 2, home: "FRA", away: "IRQ", xgH: 2.66, xgA: 0.5, over: 62, btts: 37 },
  { g: 2, home: "URU", away: "CAP", xgH: 1.86, xgA: 0.84, over: 49, btts: 48 },
  { g: 2, home: "COL", away: "CON", xgH: 2.02, xgA: 0.59, over: 49, btts: 39 },
  { g: 2, home: "POR", away: "UZB", xgH: 2.37, xgA: 0.57, over: 56, btts: 39 },
  { g: 2, home: "SVI", away: "BOS", xgH: 1.89, xgA: 0.9, over: 53, btts: 50 },
  { g: 2, home: "CAN", away: "QAT", xgH: 1.58, xgA: 0.73, over: 41, btts: 41 },
  { g: 2, home: "SCO", away: "MAR", xgH: 1.24, xgA: 1.4, over: 49, btts: 54 },
  { g: 2, home: "BRA", away: "HAI", xgH: 2.95, xgA: 0.48, over: 66, btts: 36, hot: true },
  { g: 2, home: "TUR", away: "PAR", xgH: 1.34, xgA: 0.92, over: 39, btts: 44 },
  { g: 2, home: "STA", away: "AUS", xgH: 1.64, xgA: 0.85, over: 45, btts: 46 },
  { g: 2, home: "TUN", away: "GIA", xgH: 0.79, xgA: 1.5, over: 41, btts: 43 },
  { g: 2, home: "NUO", away: "EGI", xgH: 0.73, xgA: 1.47, over: 39, btts: 40 },
  { g: 2, home: "GIO", away: "ALG", xgH: 0.65, xgA: 1.38, over: 34, btts: 36 },
  { g: 2, home: "CEC", away: "SUD", xgH: 1.41, xgA: 0.74, over: 37, btts: 40 },
  { g: 2, home: "ING", away: "GHA", xgH: 1.9, xgA: 0.75, over: 46, btts: 44 },
  { g: 2, home: "CRO", away: "PAN", xgH: 1.55, xgA: 0.65, over: 40, btts: 42 },
  { g: 3, home: "URU", away: "SPA", xgH: 1.24, xgA: 2.89, over: 78, btts: 67, hot: true },
  { g: 3, home: "ECU", away: "GER", xgH: 1.0, xgA: 2.71, over: 72, btts: 59, hot: true },
  { g: 3, home: "NOR", away: "FRA", xgH: 1.27, xgA: 2.21, over: 68, btts: 64, hot: true },
  { g: 3, home: "SCO", away: "BRA", xgH: 0.99, xgA: 2.46, over: 67, btts: 57, hot: true },
  { g: 3, home: "ARG", away: "GIO", xgH: 2.44, xgA: 0.52, over: 57, btts: 37 },
  { g: 3, home: "POR", away: "COL", xgH: 1.58, xgA: 1.35, over: 56, btts: 59 },
  { g: 3, home: "ING", away: "PAN", xgH: 2.44, xgA: 0.56, over: 58, btts: 39 },
  { g: 3, home: "NUO", away: "BEL", xgH: 0.59, xgA: 2.5, over: 60, btts: 41 },
  { g: 3, home: "SVI", away: "CAN", xgH: 1.89, xgA: 1.06, over: 57, btts: 55 },
  { g: 3, home: "MAR", away: "HAI", xgH: 1.68, xgA: 0.6, over: 40, btts: 37 },
  { g: 3, home: "CEC", away: "MES", xgH: 0.94, xgA: 1.72, over: 50, btts: 50 },
  { g: 3, home: "COS", away: "CUR", xgH: 1.48, xgA: 0.53, over: 33, btts: 32 },
  { g: 3, home: "BOS", away: "QAT", xgH: 1.34, xgA: 0.73, over: 34, btts: 38 },
  { g: 3, home: "SUD", away: "COR", xgH: 0.74, xgA: 1.27, over: 33, btts: 38 },
  { g: 3, home: "PAR", away: "AUS", xgH: 1.1, xgA: 1.02, over: 37, btts: 43 },
  { g: 3, home: "ALG", away: "UNB", xgH: 1.15, xgA: 1.4, over: 47, btts: 52 },
  { g: 3, home: "TUR", away: "STA", xgH: 1.11, xgA: 1.37, over: 44, btts: 50 },
  { g: 3, home: "TUN", away: "OLA", xgH: 0.63, xgA: 2.24, over: 55, btts: 42 },
  { g: 3, home: "GIA", away: "SVE", xgH: 1.25, xgA: 1.11, over: 46, btts: 48 },
  { g: 3, home: "SEN", away: "IRQ", xgH: 1.46, xgA: 0.63, over: 35, btts: 36 },
  { g: 3, home: "EGI", away: "IRN", xgH: 1.22, xgA: 1.07, over: 41, btts: 46 },
  { g: 3, home: "CON", away: "UZB", xgH: 0.89, xgA: 0.85, over: 21, btts: 34 },
  { g: 3, home: "CRO", away: "GHA", xgH: 1.58, xgA: 0.96, over: 46, btts: 49 },
];

/** @type {{ nat: string, girone: string, giornate: { md: number, avv: string, cs: number, ideal?: boolean }[] }[]} */
const CLEAN_SHEET_RAW = [
  { nat: "MES", girone: "A", giornate: [{ md: 1, avv: "SUD", cs: 55, ideal: true }, { md: 2, avv: "COR", cs: 43 }, { md: 3, avv: "CEC", cs: 39 }] },
  { nat: "COR", girone: "A", giornate: [{ md: 1, avv: "CEC", cs: 31 }, { md: 2, avv: "MES", cs: 18 }, { md: 3, avv: "SUD", cs: 48, ideal: true }] },
  { nat: "CEC", girone: "A", giornate: [{ md: 1, avv: "COR", cs: 35 }, { md: 2, avv: "SUD", cs: 48, ideal: true }, { md: 3, avv: "MES", cs: 18 }] },
  { nat: "SUD", girone: "A", giornate: [{ md: 1, avv: "MES", cs: 13 }, { md: 2, avv: "CEC", cs: 25 }, { md: 3, avv: "COR", cs: 48 }] },
  { nat: "SVI", girone: "B", giornate: [{ md: 1, avv: "QAT", cs: 56, ideal: true }, { md: 2, avv: "BOS", cs: 41 }, { md: 3, avv: "CAN", cs: 15 }] },
  { nat: "CAN", girone: "B", giornate: [{ md: 1, avv: "BOS", cs: 33 }, { md: 2, avv: "QAT", cs: 48, ideal: true }, { md: 3, avv: "SVI", cs: 35 }] },
  { nat: "BOS", girone: "B", giornate: [{ md: 1, avv: "CAN", cs: 27 }, { md: 2, avv: "SVI", cs: 15 }, { md: 3, avv: "QAT", cs: 48, ideal: true }] },
  { nat: "QAT", girone: "B", giornate: [{ md: 1, avv: "SVI", cs: 10 }, { md: 2, avv: "CAN", cs: 21 }, { md: 3, avv: "BOS", cs: 26 }] },
  { nat: "BRA", girone: "C", giornate: [{ md: 1, avv: "MAR", cs: 33 }, { md: 2, avv: "HAI", cs: 62, ideal: true }, { md: 3, avv: "SCO", cs: 37 }] },
  { nat: "MAR", girone: "C", giornate: [{ md: 1, avv: "BRA", cs: 9 }, { md: 2, avv: "SCO", cs: 29 }, { md: 3, avv: "HAI", cs: 55, ideal: true }] },
  { nat: "SCO", girone: "C", giornate: [{ md: 1, avv: "HAI", cs: 55 }, { md: 2, avv: "MAR", cs: 25 }, { md: 3, avv: "BRA", cs: 9 }] },
  { nat: "HAI", girone: "C", giornate: [{ md: 1, avv: "SCO", cs: 23 }, { md: 2, avv: "BRA", cs: 5 }, { md: 3, avv: "MAR", cs: 19 }] },
  { nat: "STA", girone: "D", giornate: [{ md: 1, avv: "PAR", cs: 40, ideal: true }, { md: 2, avv: "AUS", cs: 43 }, { md: 3, avv: "TUR", cs: 33 }] },
  { nat: "TUR", girone: "D", giornate: [{ md: 1, avv: "AUS", cs: 43, ideal: true }, { md: 2, avv: "PAR", cs: 40 }, { md: 3, avv: "STA", cs: 26 }] },
  { nat: "PAR", girone: "D", giornate: [{ md: 1, avv: "STA", cs: 19 }, { md: 2, avv: "TUR", cs: 26 }, { md: 3, avv: "AUS", cs: 33 }] },
  { nat: "AUS", girone: "D", giornate: [{ md: 1, avv: "TUR", cs: 26 }, { md: 2, avv: "STA", cs: 19 }, { md: 3, avv: "PAR", cs: 36 }] },
  { nat: "GER", girone: "E", giornate: [{ md: 1, avv: "CUR", cs: 66, ideal: true }, { md: 2, avv: "COS", cs: 37 }, { md: 3, avv: "ECU", cs: 37 }] },
  { nat: "ECU", girone: "E", giornate: [{ md: 1, avv: "COS", cs: 29 }, { md: 2, avv: "CUR", cs: 59, ideal: true }, { md: 3, avv: "GER", cs: 7 }] },
  { nat: "COS", girone: "E", giornate: [{ md: 1, avv: "ECU", cs: 29 }, { md: 2, avv: "GER", cs: 7 }, { md: 3, avv: "CUR", cs: 59, ideal: true }] },
  { nat: "CUR", girone: "E", giornate: [{ md: 1, avv: "GER", cs: 4 }, { md: 2, avv: "ECU", cs: 22 }, { md: 3, avv: "COS", cs: 23 }] },
  { nat: "OLA", girone: "F", giornate: [{ md: 1, avv: "GIA", cs: 37 }, { md: 2, avv: "SVE", cs: 41, ideal: true }, { md: 3, avv: "TUN", cs: 53, ideal: true }] },
  { nat: "GIA", girone: "F", giornate: [{ md: 1, avv: "OLA", cs: 16 }, { md: 2, avv: "TUN", cs: 45, ideal: true }, { md: 3, avv: "SVE", cs: 33 }] },
  { nat: "SVE", girone: "F", giornate: [{ md: 1, avv: "TUN", cs: 45 }, { md: 2, avv: "OLA", cs: 16 }, { md: 3, avv: "GIA", cs: 29 }] },
  { nat: "TUN", girone: "F", giornate: [{ md: 1, avv: "SVE", cs: 26 }, { md: 2, avv: "GIA", cs: 22 }, { md: 3, avv: "OLA", cs: 11 }] },
  { nat: "BEL", girone: "G", giornate: [{ md: 1, avv: "EGI", cs: 38 }, { md: 2, avv: "IRN", cs: 42, ideal: true }, { md: 3, avv: "NUO", cs: 56, ideal: true }] },
  { nat: "EGI", girone: "G", giornate: [{ md: 1, avv: "BEL", cs: 13 }, { md: 2, avv: "NUO", cs: 48, ideal: true }, { md: 3, avv: "IRN", cs: 34 }] },
  { nat: "IRN", girone: "G", giornate: [{ md: 1, avv: "NUO", cs: 48, ideal: true }, { md: 2, avv: "BEL", cs: 13 }, { md: 3, avv: "EGI", cs: 29 }] },
  { nat: "NUO", girone: "G", giornate: [{ md: 1, avv: "IRN", cs: 28 }, { md: 2, avv: "EGI", cs: 23 }, { md: 3, avv: "BEL", cs: 8 }] },
  { nat: "SPA", girone: "H", giornate: [{ md: 1, avv: "CAP", cs: 51, ideal: true }, { md: 2, avv: "ARA", cs: 56, ideal: true }, { md: 3, avv: "URU", cs: 29 }] },
  { nat: "URU", girone: "H", giornate: [{ md: 1, avv: "ARA", cs: 48, ideal: true }, { md: 2, avv: "CAP", cs: 43 }, { md: 3, avv: "SPA", cs: 6 }] },
  { nat: "CAP", girone: "H", giornate: [{ md: 1, avv: "SPA", cs: 3 }, { md: 2, avv: "URU", cs: 16 }, { md: 3, avv: "ARA", cs: 36 }] },
  { nat: "ARA", girone: "H", giornate: [{ md: 1, avv: "URU", cs: 16 }, { md: 2, avv: "SPA", cs: 3 }, { md: 3, avv: "CAP", cs: 36 }] },
  { nat: "FRA", girone: "I", giornate: [{ md: 1, avv: "SEN", cs: 38 }, { md: 2, avv: "IRQ", cs: 61, ideal: true }, { md: 3, avv: "NOR", cs: 28 }] },
  { nat: "SEN", girone: "I", giornate: [{ md: 1, avv: "FRA", cs: 11 }, { md: 2, avv: "NOR", cs: 20 }, { md: 3, avv: "IRQ", cs: 54, ideal: true }] },
  { nat: "NOR", girone: "I", giornate: [{ md: 1, avv: "IRQ", cs: 54, ideal: true }, { md: 2, avv: "SEN", cs: 30 }, { md: 3, avv: "FRA", cs: 11 }] },
  { nat: "IRQ", girone: "I", giornate: [{ md: 1, avv: "NOR", cs: 15 }, { md: 2, avv: "FRA", cs: 7 }, { md: 3, avv: "SEN", cs: 23 }] },
  { nat: "ARG", girone: "J", giornate: [{ md: 1, avv: "ALG", cs: 40, ideal: true }, { md: 2, avv: "UNB", cs: 33 }, { md: 3, avv: "GIO", cs: 59, ideal: true }] },
  { nat: "ALG", girone: "J", giornate: [{ md: 1, avv: "ARG", cs: 13 }, { md: 2, avv: "GIO", cs: 52 }, { md: 3, avv: "UNB", cs: 25 }] },
  { nat: "UNB", girone: "J", giornate: [{ md: 1, avv: "GIO", cs: 52, ideal: true }, { md: 2, avv: "ARG", cs: 13 }, { md: 3, avv: "ALG", cs: 32 }] },
  { nat: "GIO", girone: "J", giornate: [{ md: 1, avv: "UNB", cs: 19 }, { md: 2, avv: "ALG", cs: 25 }, { md: 3, avv: "ARG", cs: 9 }] },
  { nat: "POR", girone: "K", giornate: [{ md: 1, avv: "CON", cs: 55, ideal: true }, { md: 2, avv: "UZB", cs: 57, ideal: true }, { md: 3, avv: "COL", cs: 26 }] },
  { nat: "COL", girone: "K", giornate: [{ md: 1, avv: "UZB", cs: 57, ideal: true }, { md: 2, avv: "CON", cs: 55, ideal: true }, { md: 3, avv: "POR", cs: 21 }] },
  { nat: "CON", girone: "K", giornate: [{ md: 1, avv: "POR", cs: 9 }, { md: 2, avv: "COL", cs: 13 }, { md: 3, avv: "UZB", cs: 43 }] },
  { nat: "UZB", girone: "K", giornate: [{ md: 1, avv: "COL", cs: 13 }, { md: 2, avv: "POR", cs: 9 }, { md: 3, avv: "CON", cs: 41 }] },
  { nat: "ING", girone: "L", giornate: [{ md: 1, avv: "CRO", cs: 28 }, { md: 2, avv: "GHA", cs: 47, ideal: true }, { md: 3, avv: "PAN", cs: 57, ideal: true }] },
  { nat: "CRO", girone: "L", giornate: [{ md: 1, avv: "ING", cs: 13 }, { md: 2, avv: "PAN", cs: 50, ideal: true }, { md: 3, avv: "GHA", cs: 38 }] },
  { nat: "GHA", girone: "L", giornate: [{ md: 1, avv: "PAN", cs: 50 }, { md: 2, avv: "ING", cs: 13 }, { md: 3, avv: "CRO", cs: 21 }] },
  { nat: "PAN", girone: "L", giornate: [{ md: 1, avv: "GHA", cs: 32 }, { md: 2, avv: "CRO", cs: 15 }, { md: 3, avv: "ING", cs: 9 }] },
];

function findPartita(nat, avv, md) {
  return PARTITE_OVER25.find(
    (p) => p.g === md && ((p.home === nat && p.away === avv) || (p.home === avv && p.away === nat))
  );
}

function enrichGiornate(raw) {
  const giornate = raw.giornate.map((g) => {
    const partita = findPartita(raw.nat, g.avv, g.md);
    return {
      ...g,
      over25: partita?.over ?? null,
      btts: partita?.btts ?? null,
      hot: partita?.hot ?? false,
    };
  });
  const csVals = giornate.map((g) => g.cs);
  const overVals = giornate.map((g) => g.over25).filter((v) => v != null);
  const bestCs = Math.max(...csVals);
  const bestMd = giornate.find((g) => g.cs === bestCs)?.md;
  const maxOver = overVals.length ? Math.max(...overVals) : null;
  const avgCs = csVals.reduce((a, b) => a + b, 0) / csVals.length;
  return {
    nat: raw.nat,
    girone: raw.girone,
    giornate,
    maxCs: bestCs,
    bestMdCs: bestMd,
    maxOver,
    avgCs,
  };
}

/** Tabella finale incrociata CS + Over 2.5 per tutte le squadre */
export const SQUADRA_SCHEDULE = CLEAN_SHEET_RAW.map(enrichGiornate);

/** Top partite Over 2.5 del torneo (deduplicate, ordinate) */
export const TOP_OVER_PARTITE = [...PARTITE_OVER25]
  .filter((p) => p.over >= 60)
  .sort((a, b) => b.over - a.over)
  .slice(0, 10);

export const GIRONI_LIST = "ABCDEFGHIJKL".split("");
