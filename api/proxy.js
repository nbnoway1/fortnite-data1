// Epic Games client credentials (public fortnitePCGameClient)
const EPIC_AUTH = "Basic ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ=";
const TOKEN_URL = "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token";

// In-memory token cache (lives for duration of serverless instance)
let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) {
    return cachedToken; // still valid
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": EPIC_AUTH,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Token fetch failed ${res.status}: ${txt}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000);
  console.log(`[TOKEN] obtained, expires in ${data.expires_in}s`);
  return cachedToken;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Extract path and query params from Vercel rewrite (?path=islands/xxxx)
  const url     = new URL(req.url, `https://${req.headers.host}`);
  const path    = req.query?.path || url.searchParams.get("path") || "";
  const forward = new URLSearchParams();
  for (const [k, v] of url.searchParams.entries()) {
    if (k !== "path") forward.append(k, v);
  }
  const qs     = forward.toString();
  const target = `https://api.fortnite.com/ecosystem/v1/${path}${qs ? "?" + qs : ""}`;

  console.log(`[PROXY] ${target}`);

  try {
    const token = await getAccessToken();

    const upstream = await fetch(target, {
      headers: {
        "Accept":        "application/json",
        "Authorization": `Bearer ${token}`,
        "User-Agent":    "FortniteIslandDashboard/1.0",
      },
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error(`[ERROR] ${upstream.status} ${target} — ${text}`);
      return res.status(upstream.status).json({
        error: `Upstream ${upstream.status}`,
        target,
        detail: text,
      });
    }

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json(data);

  } catch (e) {
    console.error(`[EXCEPTION] ${e.message}`);
    return res.status(500).json({ error: e.message, target });
  }
}
