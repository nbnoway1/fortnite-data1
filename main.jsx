// api/[...path].js
// Vercel catch-all: /api/islands/xxxx → this file, req.query.path = ["islands","xxxx"]

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  // req.query.path is an array like ["islands", "3808-8348-4233"]
  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const apiPath  = segments.join("/");

  // Forward all query params except "path"
  const forward = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== "path") forward.append(k, v);
  }
  const qs     = forward.toString();
  const target = `https://api.fortnite.com/ecosystem/v1/${apiPath}${qs ? "?" + qs : ""}`;

  console.log(`[PROXY] ${target}`);

  try {
    const r    = await fetch(target, {
      headers: {
        "Accept":     "application/json",
        "User-Agent": "FortniteIslandDashboard/1.0",
      },
    });
    const text = await r.text();

    if (!r.ok) {
      return res.status(r.status).json({ error: `Upstream ${r.status}`, target, body: text.slice(0, 400) });
    }

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message, target });
  }
}
