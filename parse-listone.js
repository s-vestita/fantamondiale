const fs = require("fs");

const text = fs
  .readFileSync("listone_quotazioni.txt", "utf8")
  .trim()
  .replace(/^Listone:\s*/i, "");

const categories = [
  "PORTIERI",
  "DIFENSORI",
  "CENTROCAMPISTI",
  "ATTACCANTI",
  "ALLENATORI",
];

const categoryMap = {
  PORTIERI: "portieri",
  DIFENSORI: "difensori",
  CENTROCAMPISTI: "centrocampisti",
  ATTACCANTI: "attaccanti",
  ALLENATORI: "allenatori",
};

const result = {
  listone: {},
};

for (const cat of categories) {
  result.listone[categoryMap[cat]] = [];
}

const re = new RegExp(
  `\\b(${categories.join("|")})\\b|([A-Z][A-Z0-9'\\-.\\s]*?)\\s+([A-Z]{3})\\s+(\\d+)`,
  "g"
);

let currentCategory = null;
let match;

while ((match = re.exec(text)) !== null) {
  if (match[1]) {
    currentCategory = categoryMap[match[1]];
    continue;
  }

  if (!currentCategory) continue;

  const nome = match[2].trim();
  const nazione = match[3];
  const quotazione = parseInt(match[4], 10);

  result.listone[currentCategory].push({
    nome,
    nazione,
    quotazione,
  });
}

const outPath = "listone_quotazioni.json";
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");

const counts = Object.fromEntries(
  Object.entries(result.listone).map(([k, v]) => [k, v.length])
);
console.log("Creato", outPath);
console.log("Conteggi:", counts);
console.log("Totale:", Object.values(counts).reduce((a, b) => a + b, 0));
