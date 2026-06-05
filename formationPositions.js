// Sigle posizione (stile Fantaclub / probabili Fantamaster): POR, DD, DC, DS, E, CDC, CC, TRQ, ALA, ATT

/** @type {Record<string, string[]>} */
export const SLOT_POSITIONS = {
  "4-3-3": ["POR", "DD", "DC", "DC", "DS", "CC", "CC", "CC", "ALA", "ATT", "ALA"],
  "4-2-3-1": ["POR", "DD", "DC", "DC", "DS", "CDC", "CDC", "ALA", "TRQ", "ALA", "ATT"],
  "4-4-2": ["POR", "DD", "DC", "DC", "DS", "E", "CC", "CC", "E", "ATT", "ATT"],
  "4-1-4-1": ["POR", "DD", "DC", "DC", "DS", "CDC", "ALA", "CC", "CC", "ALA", "ATT"],
  "4-3-1-2": ["POR", "DD", "DC", "DC", "DS", "CC", "CC", "CC", "TRQ", "ATT", "ATT"],
  "3-4-3": ["POR", "DC", "DC", "DC", "E", "CC", "CC", "E", "ALA", "ATT", "ALA"],
  "3-4-2-1": ["POR", "DC", "DC", "DC", "E", "CC", "CC", "E", "TRQ", "TRQ", "ATT"],
  "3-5-2": ["POR", "DC", "DC", "DC", "E", "CC", "CDC", "CC", "E", "ATT", "ATT"],
  "3-5-1-1": ["POR", "DC", "DC", "DC", "E", "CC", "CDC", "CC", "E", "TRQ", "ATT"],
  "5-4-1": ["POR", "DD", "DC", "DC", "DC", "DS", "CC", "CC", "CC", "CC", "ATT"],
  "5-3-2": ["POR", "DD", "DC", "DC", "DC", "DS", "CC", "CC", "CC", "ATT", "ATT"],
  "4-5-1": ["POR", "DD", "DC", "DC", "DS", "E", "CC", "CDC", "CC", "E", "ATT"],
  "3-4-1-2": ["POR", "DC", "DC", "DC", "E", "CC", "CC", "E", "TRQ", "ATT", "ATT"],
};

const RUOLO_FALLBACK = {
  portieri: "POR",
  difensori: "DC",
  centrocampisti: "CC",
  attaccanti: "ATT",
};

export function normalizeModule(raw) {
  return String(raw || "").replace(/\s/g, "").trim();
}

export function positionsForModule(module, slotCount) {
  const mod = normalizeModule(module);
  const base = SLOT_POSITIONS[mod];
  if (!base) return genericPositions(slotCount);
  if (slotCount === base.length) return base;
  if (slotCount < base.length) return base.slice(0, slotCount);
  const extra = slotCount - base.length;
  const out = [...base];
  const insertAt = Math.max(1, out.length - 3);
  for (let i = 0; i < extra; i++) out.splice(insertAt, 0, "CC");
  return out;
}

function genericPositions(slotCount) {
  const out = ["POR"];
  while (out.length < slotCount) {
    const i = out.length;
    if (i <= 4) out.push(i === 4 ? "DS" : i === 1 ? "DD" : "DC");
    else if (i >= slotCount - 2) out.push("ATT");
    else if (i === 5) out.push("CDC");
    else out.push("CC");
  }
  return out.slice(0, slotCount);
}

export function fallbackPosizione(ruolo) {
  return RUOLO_FALLBACK[ruolo] || "—";
}

/** Sigla slot → ruolo fanta P / D / C / A */
export const POS_TO_ROLE_LETTER = {
  POR: "P",
  DD: "D",
  DC: "D",
  DS: "D",
  E: "C",
  CDC: "C",
  CC: "C",
  TRQ: "C",
  ALA: "A",
  ATT: "A",
};

export const ROLE_LETTER_TO_ROSA = {
  P: "portieri",
  D: "difensori",
  C: "centrocampisti",
  A: "attaccanti",
};

export const ROSA_TO_ROLE_LETTER = {
  portieri: "P",
  difensori: "D",
  centrocampisti: "C",
  attaccanti: "A",
};

export function slotRoleLetter(pos) {
  return POS_TO_ROLE_LETTER[pos] || "C";
}

export function slotRosaRuolo(pos) {
  return ROLE_LETTER_TO_ROSA[slotRoleLetter(pos)] || "centrocampisti";
}
