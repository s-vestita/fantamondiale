const id = 15186710;
for (let p = 1; p <= 20; p++) {
  const r = await fetch(`https://api.sofascore.com/api/v1/event/${id}/odds/${p}/all`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const data = await r.json().catch(() => ({}));
  const m1x2 = data.markets?.find((m) => m.marketGroup === "1X2" && m.marketPeriod === "Full-time");
  if (m1x2) {
    const odds = Object.fromEntries(m1x2.choices.map((c) => [c.name, c.fractionalValue]));
    console.log(`provider ${p}: 1=${odds["1"]} X=${odds.X} 2=${odds["2"]} sourceId=${m1x2.sourceId}`);
  } else {
    console.log(`provider ${p}: ${data.error?.message || "no 1X2"}`);
  }
}
