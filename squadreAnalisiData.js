import { NAT_TO_TEAM } from "./fantamondialeLogic.js";
import { getProbabileModulo } from "./squadreProbabili.js";

const TEAM_TO_NAT = Object.fromEntries(Object.entries(NAT_TO_TEAM).map(([n, t]) => [t, n]));

export const GROUPS = {
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

export const TEAMS = Object.entries(GROUPS).flatMap(([girone, names]) =>
  names.map((name) => ({
    nat: TEAM_TO_NAT[name],
    name,
    girone,
  }))
).sort((a, b) => a.name.localeCompare(b.name, "it"));

export function gironeForNat(nat) {
  return TEAMS.find((t) => t.nat === nat)?.girone || "—";
}

export function teamNameForNat(nat) {
  return NAT_TO_TEAM[nat] || nat;
}

export function emptySquadraStore(nat) {
  return {
    nat,
    modulo: getProbabileModulo(nat),
    titolari: Array(11).fill(null),
    note: "",
    noteAmichevoli: "",
  };
}

/** Righe slot per disposizione in campo (indici 0–10) */
export const PITCH_LINES = {
  "4-3-3": [[0], [1, 2, 3, 4], [5, 6, 7], [8, 9, 10]],
  "4-2-3-1": [[0], [1, 2, 3, 4], [5, 6], [7, 8, 9], [10]],
  "4-4-2": [[0], [1, 2, 3, 4], [5, 6, 7, 8], [9, 10]],
  "4-1-4-1": [[0], [1, 2, 3, 4], [5], [6, 7, 8, 9], [10]],
  "4-3-1-2": [[0], [1, 2, 3, 4], [5, 6, 7], [8], [9, 10]],
  "3-4-3": [[0], [1, 2, 3], [4, 5, 6, 7], [8, 9, 10]],
  "3-4-2-1": [[0], [1, 2, 3], [4, 5, 6, 7], [8, 9], [10]],
  "3-5-2": [[0], [1, 2, 3], [4, 5, 6, 7, 8], [9, 10]],
  "3-5-1-1": [[0], [1, 2, 3], [4, 5, 6, 7, 8], [9], [10]],
  "5-4-1": [[0], [1, 2, 3, 4, 5], [6, 7, 8, 9], [10]],
  "5-3-2": [[0], [1, 2, 3, 4, 5], [6, 7, 8], [9, 10]],
  "4-5-1": [[0], [1, 2, 3, 4], [5, 6, 7, 8, 9], [10]],
  "3-4-1-2": [[0], [1, 2, 3], [4, 5, 6, 7], [8], [9, 10]],
};

export function pitchLinesFor(modulo) {
  return PITCH_LINES[modulo] || PITCH_LINES["4-3-3"];
}
