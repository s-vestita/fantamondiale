import eliminateData from "./squadre_eliminate.json" with { type: "json" };
import { NAT_TO_TEAM } from "./fantamondialeLogic.js";

export const SQUADRE_ELIMINATE = eliminateData.squadre;

export const ELIMINATE_NATS = new Set(SQUADRE_ELIMINATE.map((s) => s.nat));

export function isNatEliminata(nat) {
  return ELIMINATE_NATS.has(nat);
}

export function isPlayerEliminato(p) {
  return p?.nazione != null && ELIMINATE_NATS.has(p.nazione);
}

export function filterByEliminazione(players, mode) {
  if (mode === "vivo") return players.filter((p) => !isPlayerEliminato(p));
  if (mode === "out") return players.filter((p) => isPlayerEliminato(p));
  return players;
}

export function teamNameEliminata(nat) {
  return SQUADRE_ELIMINATE.find((s) => s.nat === nat)?.nome || NAT_TO_TEAM[nat] || nat;
}
