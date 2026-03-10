export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api\/proxy\/?/, "").replace(/^\/api\//, "");
  const query = url.search;
  const target = `https://api.fortnite.com/ecosystem/v1/${path}${query}`;

  try {
    const r = await fetch(target, {
      headers: { "Accept": "application/json", "User-Agent": "FortniteIslandDashboard/1.0" },
    });
    if (!r.ok) return res.status(r.status).json({ error: `Upstream ${r.status}`, target });
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message, target });
  }
}
