export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);

  // ── /api/debug : 診断エンドポイント ──────────────────────────────
  if (url.pathname === "/api/debug" || url.pathname === "/api/proxy" && !req.query.path) {
    const testUrl = "https://api.fortnite.com/ecosystem/v1/islands/3808-8348-4233";
    let testResult = null;
    try {
      const r = await fetch(testUrl, { headers: { "Accept": "application/json" } });
      const text = await r.text();
      testResult = { status: r.status, ok: r.ok, body: text.slice(0, 500) };
    } catch (e) {
      testResult = { error: e.message };
    }
    return res.status(200).json({
      message: "Fortnite Dashboard Proxy - Debug",
      url: req.url,
      query: req.query,
      testFetch: testResult,
    });
  }

  // ── 通常プロキシ ──────────────────────────────────────────────────
  // Vercel rewrite: /api/:path* → /api/proxy?path=:path*
  const path    = req.query?.path || "";
  const forward = new URLSearchParams();
  for (const [k, v] of url.searchParams.entries()) {
    if (k !== "path") forward.append(k, v);
  }
  const qs     = forward.toString();
  const target = `https://api.fortnite.com/ecosystem/v1/${path}${qs ? "?" + qs : ""}`;

  console.log(`[PROXY] → ${target}`);

  try {
    const r    = await fetch(target, { headers: { "Accept": "application/json" } });
    const text = await r.text();

    if (!r.ok) {
      return res.status(r.status).json({ error: `Upstream ${r.status}`, target, body: text.slice(0, 300) });
    }

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message, target });
  }
}
