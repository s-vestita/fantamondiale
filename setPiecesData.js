// Rigoristi, punizioni e angoli per nazionale.
// Solo giocatori presenti in listone.json (grafia esatta).
// Rigoristi: rigoristi.txt (Goal.com / fonti WC2026)
// Punizioni/angoli: Bulinews / Squawka (giu 2026)
// Rigenera: node scripts/gen-set-pieces.mjs

import listone from "./listone.json" with { type: "json" };

const LISTONE_KEYS = new Set();
for (const ruolo of Object.keys(listone)) {
  for (const p of listone[ruolo]) {
    LISTONE_KEYS.add(`${p.nazione}|${p.nome}`);
  }
}

function onlyListone(nat, names) {
  return names.filter((n) => LISTONE_KEYS.has(`${nat}|${n}`));
}

const SET_PIECES_RAW = {
  ALG: {
    rigoristi: [
      "MAHREZ",
      "BENTALEB",
      "AMOURA"
    ],
    punizioni: [
      "MAHREZ",
      "CHAIBI"
    ],
    angoli: [
      "CHAIBI",
      "MAHREZ"
    ]
  },
  ARA: {
    rigoristi: [
      "AL-DAWSARI S.",
      "AL-BURAIKAN",
      "AL-JUWAYR"
    ],
    punizioni: [
      "AL-DAWSARI S."
    ],
    angoli: [
      "AL-DAWSARI S."
    ]
  },
  ARG: {
    rigoristi: [
      "MESSI",
      "OTAMENDI",
      "ALVAREZ"
    ],
    punizioni: [
      "MESSI",
      "ALVAREZ",
      "DE PAUL"
    ],
    angoli: [
      "MESSI",
      "DE PAUL"
    ]
  },
  AUS: {
    rigoristi: [
      "HRUSTIC",
      "IRANKUNDA",
      "YENGI"
    ],
    punizioni: [
      "HRUSTIC",
      "IRANKUNDA"
    ],
    angoli: [
      "HRUSTIC",
      "BEHICH"
    ]
  },
  BEL: {
    rigoristi: [
      "DE BRUYNE",
      "LUKAKU",
      "TIELEMANS"
    ],
    punizioni: [
      "DE BRUYNE"
    ],
    angoli: [
      "DE BRUYNE",
      "TIELEMANS"
    ]
  },
  BOS: {
    rigoristi: [
      "DZEKO",
      "DEMIROVIC",
      "TABAKOVIC"
    ],
    punizioni: [
      "ALAJBEGOVIC",
      "DEDIC",
      "TAHIROVIC"
    ],
    angoli: [
      "ALAJBEGOVIC",
      "BAJRAKTAREVIC"
    ]
  },
  BRA: {
    rigoristi: [
      "NEYMAR",
      "RAPHINHA",
      "VINICIUS"
    ],
    punizioni: [
      "NEYMAR",
      "RAPHINHA"
    ],
    angoli: [
      "NEYMAR",
      "RAPHINHA",
      "GUIMARAES"
    ]
  },
  CAN: {
    rigoristi: [
      "DAVID",
      "PROMISE DAVID",
      "LARIN"
    ],
    punizioni: [
      "DAVIES",
      "EUSTAQUIO"
    ],
    angoli: [
      "CHOINIERE",
      "AHMED",
      "DAVIES"
    ]
  },
  CAP: {
    rigoristi: [
      "MENDES R.",
      "RODRIGUES",
      "LIVRAMENTO"
    ],
    punizioni: [
      "CABRAL"
    ],
    angoli: [
      "CABRAL",
      "MONTEIRO J."
    ]
  },
  CEC: {
    rigoristi: [
      "SCHICK",
      "SOUCEK",
      "CHORY"
    ],
    punizioni: [
      "COUFAL",
      "PROVOD",
      "SULC"
    ],
    angoli: [
      "COUFAL",
      "PROVOD",
      "SULC"
    ]
  },
  COL: {
    rigoristi: [
      "RODRIGUEZ JA.",
      "DIAZ LU.",
      "QUINTERO JF."
    ],
    punizioni: [
      "RODRIGUEZ JA."
    ],
    angoli: [
      "RODRIGUEZ JA."
    ]
  },
  CON: {
    rigoristi: [
      "WISSA",
      "KAKUTA",
      "BAKAMBU"
    ],
    punizioni: [
      "BONGONDA",
      "MASUAKU"
    ],
    angoli: [
      "BONGONDA",
      "MASUAKU"
    ]
  },
  COR: {
    rigoristi: [
      "SON",
      "HWANG H.",
      "LEE KI."
    ],
    punizioni: [
      "SON",
      "LEE KI."
    ],
    angoli: [
      "SON",
      "LEE KI.",
      "LEE JS."
    ]
  },
  COS: {
    rigoristi: [
      "KESSIE",
      "PEPE",
      "SANGARE"
    ],
    punizioni: [
      "DIALLO AM.",
      "KESSIE"
    ],
    angoli: [
      "DIALLO AM.",
      "DIOMANDE"
    ]
  },
  CRO: {
    rigoristi: [
      "MODRIC",
      "PERISIC",
      "KRAMARIC"
    ],
    punizioni: [
      "MODRIC",
      "PERISIC"
    ],
    angoli: [
      "MODRIC",
      "BATURINA",
      "PERISIC"
    ]
  },
  CUR: {
    rigoristi: [
      "BACUNA LE.",
      "BACUNA",
      "LOCADIA"
    ],
    punizioni: [
      "BACUNA LE.",
      "ANTONISSE"
    ],
    angoli: [
      "BACUNA LE.",
      "ANTONISSE",
      "BACUNA"
    ]
  },
  ECU: {
    rigoristi: [
      "VALENCIA EN.",
      "CAICEDO MO.",
      "PAEZ"
    ],
    punizioni: [
      "ESTUPINAN",
      "VALENCIA EN."
    ],
    angoli: [
      "CAICEDO MO.",
      "PLATA"
    ]
  },
  EGI: {
    rigoristi: [
      "SALAH",
      "MARMOUSH",
      "SABER"
    ],
    punizioni: [
      "SALAH",
      "MARMOUSH"
    ],
    angoli: [
      "SALAH",
      "MARMOUSH"
    ]
  },
  FRA: {
    rigoristi: [
      "MBAPPE",
      "DEMBELE",
      "HERNANDEZ TH."
    ],
    punizioni: [
      "OLISE",
      "CHERKI"
    ],
    angoli: [
      "OLISE"
    ]
  },
  GER: {
    rigoristi: [
      "HAVERTZ",
      "KIMMICH",
      "WIRTZ"
    ],
    punizioni: [
      "RAUM",
      "WIRTZ"
    ],
    angoli: [
      "RAUM",
      "WIRTZ",
      "KIMMICH"
    ]
  },
  GHA: {
    rigoristi: [
      "AYEW",
      "SEMENYO",
      "WILLIAMS"
    ],
    punizioni: [
      "AYEW"
    ],
    angoli: [
      "AYEW",
      "SULEMANA",
      "NUAMAH"
    ]
  },
  GIA: {
    rigoristi: [
      "UEDA",
      "KAMADA",
      "NAKAMURA"
    ],
    punizioni: [
      "KUBO",
      "ITO J."
    ],
    angoli: [
      "ITO J.",
      "DOAN"
    ]
  },
  GIO: {
    rigoristi: [
      "OLWAN",
      "AL TAMARI",
      "SHARARA"
    ],
    punizioni: [
      "AL TAMARI",
      "AL MARDI"
    ],
    angoli: [
      "AL TAMARI",
      "AL MARDI"
    ]
  },
  HAI: {
    rigoristi: [
      "NAZON",
      "PIERROT",
      "ISIDOR"
    ],
    punizioni: [
      "BELLEGARDE",
      "DEEDSON"
    ],
    angoli: [
      "BELLEGARDE",
      "DEEDSON"
    ]
  },
  ING: {
    rigoristi: [
      "KANE",
      "RASHFORD",
      "SAKA"
    ],
    punizioni: [
      "KANE",
      "JAMES"
    ],
    angoli: [
      "RICE"
    ]
  },
  IRN: {
    rigoristi: [
      "TAREMI",
      "HOSSEINZADEH",
      "JAHANBAKHSH"
    ],
    punizioni: [
      "GHODDOS"
    ],
    angoli: [
      "GHODDOS"
    ]
  },
  IRQ: {
    rigoristi: [
      "HUSSEIN A.",
      "AL-AMMARI",
      "ALI H."
    ],
    punizioni: [
      "AL-AMMARI",
      "JASIM"
    ],
    angoli: [
      "AL-AMMARI",
      "JASIM"
    ]
  },
  MAR: {
    rigoristi: [
      "DIAZ B.",
      "HAKIMI",
      "RAHIMI"
    ],
    punizioni: [
      "DIAZ B.",
      "HAKIMI"
    ],
    angoli: [
      "HAKIMI",
      "DIAZ B."
    ]
  },
  MES: {
    rigoristi: [
      "JIMENEZ",
      "PINEDA",
      "GIMENEZ"
    ],
    punizioni: [
      "JIMENEZ",
      "ALVAREZ ED.",
      "VEGA"
    ],
    angoli: [
      "GUTIERREZ",
      "VEGA",
      "ALVARADO"
    ]
  },
  NOR: {
    rigoristi: [
      "HAALAND",
      "SORLOTH",
      "ODEGAARD"
    ],
    punizioni: [
      "ODEGAARD",
      "RYERSON"
    ],
    angoli: [
      "ODEGAARD",
      "RYERSON"
    ]
  },
  NUO: {
    rigoristi: [
      "WOOD",
      "WAINE",
      "SINGH"
    ],
    punizioni: [
      "RANDALL",
      "SINGH"
    ],
    angoli: [
      "PAYNE",
      "RANDALL"
    ]
  },
  OLA: {
    rigoristi: [
      "DEPAY",
      "GAKPO",
      "MALEN"
    ],
    punizioni: [
      "DEPAY",
      "GAKPO"
    ],
    angoli: [
      "DEPAY",
      "GAKPO"
    ]
  },
  PAN: {
    rigoristi: [
      "WATERMAN CE.",
      "ERIC DAVIS",
      "DIAZ IS."
    ],
    punizioni: [
      "ERIC DAVIS"
    ],
    angoli: [
      "ERIC DAVIS",
      "CARRASQUILLA"
    ]
  },
  PAR: {
    rigoristi: [
      "ENCISO",
      "SANABRIA AN.",
      "ALMIRON"
    ],
    punizioni: [
      "GOMEZ DI.",
      "ENCISO",
      "ALMIRON"
    ],
    angoli: [
      "GOMEZ DI.",
      "ALMIRON"
    ]
  },
  POR: {
    rigoristi: [
      "RONALDO",
      "FERNANDES",
      "VITINHA"
    ],
    punizioni: [
      "RONALDO",
      "FERNANDES"
    ],
    angoli: [
      "FERNANDES",
      "SILVA BE.",
      "MENDES"
    ]
  },
  QAT: {
    rigoristi: [
      "AFIF",
      "AL-HAYDOS",
      "MUNTARI"
    ],
    punizioni: [
      "AFIF"
    ],
    angoli: [
      "AFIF",
      "KHOUKHI"
    ]
  },
  SCO: {
    rigoristi: [
      "MCTOMINAY",
      "MCGINN",
      "CHRISTIE"
    ],
    punizioni: [
      "MCGINN",
      "MCTOMINAY"
    ],
    angoli: [
      "MCGINN",
      "FERGUSON"
    ]
  },
  SEN: {
    rigoristi: [
      "MANE",
      "JACKSON",
      "SARR"
    ],
    punizioni: [
      "MANE"
    ],
    angoli: [
      "DIOUF",
      "CAMARA"
    ]
  },
  SPA: {
    rigoristi: [
      "OYARZABAL",
      "RODRI",
      "YAMAL"
    ],
    punizioni: [
      "YAMAL",
      "OYARZABAL",
      "GRIMALDO GARCIA"
    ],
    angoli: [
      "YAMAL",
      "OLMO",
      "GRIMALDO GARCIA"
    ]
  },
  STA: {
    rigoristi: [
      "PULISIC",
      "BALOGUN",
      "PEPI"
    ],
    punizioni: [
      "PULISIC"
    ],
    angoli: [
      "PULISIC",
      "TILLMAN"
    ]
  },
  SUD: {
    rigoristi: [
      "FOSTER",
      "MOKOENA",
      "APPOLLIS"
    ],
    punizioni: [
      "APPOLLIS",
      "MODIBA"
    ],
    angoli: [
      "APPOLLIS",
      "MODIBA",
      "MUDAU"
    ]
  },
  SVE: {
    rigoristi: [
      "GYOKERES",
      "ISAK",
      "SEMA"
    ],
    punizioni: [
      "AYARI",
      "ISAK"
    ],
    angoli: [
      "ELANGA",
      "SVENSSON",
      "AYARI"
    ]
  },
  SVI: {
    rigoristi: [
      "XHAKA",
      "EMBOLO",
      "NDOYE"
    ],
    punizioni: [
      "XHAKA",
      "VARGAS",
      "RIEDER"
    ],
    angoli: [
      "VARGAS",
      "RIEDER"
    ]
  },
  TUN: {
    rigoristi: [
      "GHARBI",
      "ABDI",
      "ACHOURI"
    ],
    punizioni: [
      "MEJBRI",
      "ABDI"
    ],
    angoli: [
      "MEJBRI",
      "ABDI"
    ]
  },
  TUR: {
    rigoristi: [
      "CALHANOGLU",
      "AKTURKOGLU",
      "YILDIZ"
    ],
    punizioni: [
      "CALHANOGLU",
      "GULER"
    ],
    angoli: [
      "CALHANOGLU",
      "GULER"
    ]
  },
  UNB: {
    rigoristi: [
      "ARNAUTOVIC",
      "SABITZER",
      "BAUMGARTNER"
    ],
    punizioni: [
      "SABITZER",
      "ALABA"
    ],
    angoli: [
      "SABITZER",
      "ALABA"
    ]
  },
  URU: {
    rigoristi: [
      "VALVERDE",
      "NUNEZ",
      "ZALAZAR"
    ],
    punizioni: [
      "VALVERDE"
    ],
    angoli: [
      "DE LA CRUZ",
      "VALVERDE"
    ]
  },
  UZB: {
    rigoristi: [
      "SHOMURODOV",
      "MOZGOVOY",
      "SERGEEV"
    ],
    punizioni: [
      "FAYZULLAYEV",
      "SHUKUROV"
    ],
    angoli: [
      "FAYZULLAYEV",
      "SHUKUROV"
    ]
  }
};

export const SET_PIECES = Object.fromEntries(
  Object.entries(SET_PIECES_RAW).map(([nat, data]) => [
    nat,
    {
      rigoristi: onlyListone(nat, data.rigoristi),
      punizioni: onlyListone(nat, data.punizioni),
      angoli: onlyListone(nat, data.angoli),
    },
  ])
);

const SET_PIECES_INDEX = new Map();

for (const [nat, data] of Object.entries(SET_PIECES)) {
  const touch = (key, list) => {
    list.forEach((nome, i) => {
      const k = `${nat}|${nome}`;
      if (!SET_PIECES_INDEX.has(k)) {
        SET_PIECES_INDEX.set(k, { rig: null, pun: null, ang: null });
      }
      SET_PIECES_INDEX.get(k)[key] = i + 1;
    });
  };
  touch("rig", data.rigoristi);
  touch("pun", data.punizioni);
  touch("ang", data.angoli);
}

export function getPlayerSetPieces(nat, nome) {
  return SET_PIECES_INDEX.get(`${nat}|${nome}`) || null;
}
