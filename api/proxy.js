export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Extract path after /api/
  const url = new URL(req.url, `https://${req.headers.host}`);
  const fullPath = url.pathname.replace(/^\/api\/proxy\/?/, "").replace(/^\/api\//, "");
  const query = url.search;
  const target = `https://api.fortnite.com/ecosystem/v1/${fullPath}${query}`;

  try {
    const upstream = await fetch(target, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "FortniteIslandDashboard/1.0",
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}`, url: target });
    }

    const data = await upstream.json();
    // Cache for 60 seconds on Vercel edge
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message, url: target });
  }
}
