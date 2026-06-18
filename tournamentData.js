/** Calendario gironi Mondiale 2026 — condiviso tra tab e logica quote. */

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

/** [matchday, home, away] */
export const FIXTURES = {
  A: [[1,"Messico","Sudafrica"],[1,"Corea del Sud","Cechia"],[2,"Cechia","Sudafrica"],[2,"Messico","Corea del Sud"],[3,"Cechia","Messico"],[3,"Sudafrica","Corea del Sud"]],
  B: [[1,"Canada","Bosnia"],[1,"Qatar","Svizzera"],[2,"Svizzera","Bosnia"],[2,"Canada","Qatar"],[3,"Svizzera","Canada"],[3,"Bosnia","Qatar"]],
  C: [[1,"Brasile","Marocco"],[1,"Haiti","Scozia"],[2,"Scozia","Marocco"],[2,"Brasile","Haiti"],[3,"Scozia","Brasile"],[3,"Marocco","Haiti"]],
  D: [[1,"USA","Paraguay"],[1,"Australia","Turchia"],[2,"USA","Australia"],[2,"Turchia","Paraguay"],[3,"Turchia","USA"],[3,"Paraguay","Australia"]],
  E: [[1,"Germania","Curaçao"],[1,"Costa d'Avorio","Ecuador"],[2,"Germania","Costa d'Avorio"],[2,"Ecuador","Curaçao"],[3,"Ecuador","Germania"],[3,"Curaçao","Costa d'Avorio"]],
  F: [[1,"Olanda","Giappone"],[1,"Svezia","Tunisia"],[2,"Olanda","Svezia"],[2,"Tunisia","Giappone"],[3,"Giappone","Svezia"],[3,"Tunisia","Olanda"]],
  G: [[1,"Belgio","Egitto"],[1,"Iran","Nuova Zelanda"],[2,"Belgio","Iran"],[2,"Nuova Zelanda","Egitto"],[3,"Egitto","Iran"],[3,"Nuova Zelanda","Belgio"]],
  H: [[1,"Spagna","Capo Verde"],[1,"Arabia Saudita","Uruguay"],[2,"Spagna","Arabia Saudita"],[2,"Uruguay","Capo Verde"],[3,"Capo Verde","Arabia Saudita"],[3,"Uruguay","Spagna"]],
  I: [[1,"Francia","Senegal"],[1,"Iraq","Norvegia"],[2,"Francia","Iraq"],[2,"Norvegia","Senegal"],[3,"Norvegia","Francia"],[3,"Senegal","Iraq"]],
  J: [[1,"Argentina","Algeria"],[1,"Austria","Giordania"],[2,"Argentina","Austria"],[2,"Giordania","Algeria"],[3,"Algeria","Austria"],[3,"Giordania","Argentina"]],
  K: [[1,"Portogallo","Congo DR"],[1,"Uzbekistan","Colombia"],[2,"Portogallo","Uzbekistan"],[2,"Colombia","Congo DR"],[3,"Colombia","Portogallo"],[3,"Congo DR","Uzbekistan"]],
  L: [[1,"Inghilterra","Croazia"],[1,"Ghana","Panama"],[2,"Inghilterra","Ghana"],[2,"Panama","Croazia"],[3,"Panama","Inghilterra"],[3,"Croazia","Ghana"]],
};

export const ABBR = {
  Messico: "MEX", "Corea del Sud": "KOR", Cechia: "CZE", Sudafrica: "RSA",
  Svizzera: "SUI", Canada: "CAN", Bosnia: "BIH", Qatar: "QAT",
  Brasile: "BRA", Marocco: "MAR", Scozia: "SCO", Haiti: "HAI",
  USA: "USA", Turchia: "TUR", Paraguay: "PAR", Australia: "AUS",
  Germania: "GER", Ecuador: "ECU", "Costa d'Avorio": "CIV", "Curaçao": "CUW",
  Olanda: "NED", Giappone: "JPN", Svezia: "SWE", Tunisia: "TUN",
  Belgio: "BEL", Egitto: "EGY", Iran: "IRN", "Nuova Zelanda": "NZL",
  Spagna: "ESP", Uruguay: "URU", "Capo Verde": "CPV", "Arabia Saudita": "KSA",
  Francia: "FRA", Senegal: "SEN", Norvegia: "NOR", Iraq: "IRQ",
  Argentina: "ARG", Austria: "AUT", Algeria: "ALG", Giordania: "JOR",
  Portogallo: "POR", Colombia: "COL", "Congo DR": "COD", Uzbekistan: "UZB",
  Inghilterra: "ENG", Croazia: "CRO", Ghana: "GHA", Panama: "PAN",
};

export const MD_DATES = {
  A: ["11 giu", "18 giu", "24 giu"], B: ["12-13 giu", "18 giu", "24 giu"], C: ["13 giu", "19 giu", "24 giu"],
  D: ["12-13 giu", "19 giu", "25 giu"], E: ["14 giu", "20 giu", "25 giu"], F: ["14 giu", "20 giu", "25 giu"],
  G: ["15 giu", "21 giu", "26 giu"], H: ["15 giu", "21 giu", "26 giu"], I: ["16 giu", "22 giu", "26 giu"],
  J: ["16 giu", "22 giu", "27 giu"], K: ["17 giu", "23 giu", "27 giu"], L: ["17 giu", "23 giu", "27 giu"],
};
