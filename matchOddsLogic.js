import groupOddsData from "./groupMatchOdds.json";
import { GROUP_WINNER_ODDS } from "./bookmakerOdds.js";

/** Forza squadra 0–100 (tabellone / knockout) da quote vincente girone. */
export const TEAM_STRENGTH = Object.fromEntries(
  Object.values(GROUP_WINNER_ODDS).flatMap((g) =>
    Object.entries(g).map(([team, odd]) => [team, strengthFromWinnerOdd(odd)])
  )
);

function strengthFromWinnerOdd(odd) {
  return Math.min(99, Math.max(40, Math.round(100 - (odd - 1) * 12)));
}

/**
 * Soglie sulla quota vittoria della squadra (decimale).
 * Verde = favorita · Giallo = partita aperta · Rosso = sfavorita.
 */
export const WIN_ODD_GREEN_MAX = 1.55;
export const WIN_ODD_YELLOW_MAX = 2.85;

export function tierFromWinOdd(winOdd) {
  if (winOdd == null || winOdd < 1.01) return 1;
  if (winOdd <= WIN_ODD_GREEN_MAX) return 0;
  if (winOdd <= WIN_ODD_YELLOW_MAX) return 1;
  return 2;
}

/** Valore 0–100 per pallini/ordinamento (compatibile con diffColor: alto = difficile). */
function strengthFromTeamWinOdd(winOdd) {
  const tier = tierFromWinOdd(winOdd);
  if (tier === 0) return 48;
  if (tier === 1) return 68;
  return 88;
}

export function diffColorFromWinOdd(winOdd) {
  return diffColor(strengthFromTeamWinOdd(winOdd));
}

export function diffColor(str) {
  if (str >= 79) return "#ef4444";
  if (str >= 61) return "#f5a524";
  return "#22c55e";
}

export function diffTier(str) {
  if (str == null) return -1;
  if (str >= 79) return 2;
  if (str >= 61) return 1;
  return 0;
}

function estimate1x2(home, away, group) {
  const odds = GROUP_WINNER_ODDS[group] || {};
  const sh = 1 / Math.max(odds[home] || 12, 1.01);
  const sa = 1 / Math.max(odds[away] || 12, 1.01);
  const gap = Math.abs(sh - sa) / Math.max(sh, sa);
  const drawP = Math.max(0.14, 0.32 - gap * 0.45);
  const rem = 1 - drawP;
  const ph = (sh / (sh + sa)) * rem;
  const pa = rem - ph;
  const margin = 1.05;
  return {
    "1": Math.round((1 / ph) * margin * 100) / 100,
    X: Math.round((1 / drawP) * margin * 100) / 100,
    "2": Math.round((1 / pa) * margin * 100) / 100,
    estimated: true,
  };
}

function fixtureKey(group, home, away) {
  return `${group}|${home}|${away}`;
}

function buildOddsIndex() {
  const map = new Map();
  for (const m of groupOddsData.matches || []) {
    let odds = m.odds;
    if (!odds) odds = estimate1x2(m.home, m.away, m.group);
    map.set(fixtureKey(m.group, m.home, m.away), { ...odds, eventId: m.eventId });
  }
  return map;
}

const ODDS_INDEX = buildOddsIndex();

export function getFixtureOdds(group, home, away) {
  return ODDS_INDEX.get(fixtureKey(group, home, away)) || estimate1x2(home, away, group);
}

/** Celle G1/G2/G3 con quote 1X2 e difficoltà (str) dalla quota vittoria della squadra. */
export function getMatchCells(team, group, fixtures, abbr) {
  const fx = fixtures[group] || [];
  return [1, 2, 3].map((md) => {
    const match = fx.find((f) => f[0] === md && (f[1] === team || f[2] === team));
    if (!match) {
      return { md, opp: null, abbr: "?", str: 0, win: null, draw: null, lose: null };
    }
    const home = match[1];
    const away = match[2];
    const opp = home === team ? away : home;
    const isHome = home === team;
    const raw = getFixtureOdds(group, home, away);
    const win = isHome ? raw["1"] : raw["2"];
    const lose = isHome ? raw["2"] : raw["1"];
    const draw = raw.X;
    const str = strengthFromTeamWinOdd(win);
    return {
      md,
      opp,
      abbr: abbr[opp] || "?",
      str,
      win,
      draw,
      lose,
      isHome,
      estimated: !!raw.estimated,
    };
  });
}

export function getTeamGroupMatches(team, group, fixtures) {
  const fx = fixtures[group] || [];
  return fx
    .filter(([, home, away]) => home === team || away === team)
    .map(([md, home, away]) => {
      const isHome = home === team;
      const opp = isHome ? away : home;
      const raw = getFixtureOdds(group, home, away);
      const win = isHome ? raw["1"] : raw["2"];
      return {
        md,
        opp,
        isHome,
        home,
        away,
        win,
        draw: raw.X,
        lose: isHome ? raw["2"] : raw["1"],
        str: strengthFromTeamWinOdd(win),
        estimated: !!raw.estimated,
        eventId: raw.eventId,
      };
    })
    .sort((a, b) => a.md - b.md);
}

export function formatOdd(v) {
  if (v == null) return "—";
  return Number(v).toFixed(2);
}

export const ODDS_META = {
  source: groupOddsData.source,
  fetchedAt: groupOddsData.fetchedAt,
};
