import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, Legend,
} from "recharts";

const API = "/api";
const COLORS = ["#FFD700","#00D4FF","#FF6B35","#A855F7","#10B981","#F43F5E","#3B82F6","#F59E0B","#06B6D4","#8B5CF6"];
const fmt = (n) => n == null ? "—" : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n);

// ─── API helper ───────────────────────────────────────────────────────
async function apiFetch(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${API}/${path}${qs ? "?" + qs : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Skeleton ─────────────────────────────────────────────────────────
const Sk = ({ h = 18, w = "100%" }) => (
  <div style={{ height: h, width: w, background: "#ffffff0f", borderRadius: 5, animation: "pulse 1.4s ease-in-out infinite" }} />
);

// ─── Tooltip ──────────────────────────────────────────────────────────
const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a0b18", border: "1px solid #FFD700", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontFamily: "inherit" }}>
      {label && <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#ccc" }}>{p.name}: <b>{fmt(p.value)}</b></div>
      ))}
    </div>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, loading }) => (
  <div style={{ background: "linear-gradient(135deg,#0e0f22,#121328)", border: "1px solid #1e2040", borderRadius: 12, padding: "16px 12px", textAlign: "center", flex: "1 1 140px" }}>
    <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
    {loading ? <Sk h={24} w="60%" /> : (
      <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: 1 }}>{value ?? "—"}</div>
    )}
    <div style={{ fontSize: 11, color: "#555", marginTop: 4, letterSpacing: .5 }}>{label}</div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────
export default function App() {
  const [islands, setIslands]     = useState([]);
  const [metrics, setMetrics]     = useState({});
  const [selected, setSelected]   = useState(null);
  const [trend, setTrend]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [trendLoad, setTrendLoad] = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [tab, setTab]             = useState("ranking");
  const [updated, setUpdated]     = useState(null);

  // Fetch island list + top-10 metrics
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiFetch("islands", { limit: 20 });
      const list = data.islands || data.data || data || [];
      setIslands(list);
      setUpdated(new Date());

      const codes = list.slice(0, 10).map(i => i.code).filter(Boolean);
      const results = await Promise.allSettled(
        codes.map(code => apiFetch(`islands/${code}/metrics`, { interval: "day", limit: 1 }))
      );
      const m = {};
      results.forEach((r, i) => { if (r.status === "fulfilled") m[codes[i]] = r.value; });
      setMetrics(m);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch 7-day trend for selected island
  const fetchTrend = useCallback(async (code) => {
    setTrendLoad(true);
    try {
      const end   = new Date().toISOString().slice(0, 10);
      const start = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const data  = await apiFetch(`islands/${code}/metrics`, { interval: "day", startDate: start, endDate: end });
      const rows  = data.metrics || data.data || [];
      setTrend(rows.map(r => ({
        date:     (r.date || r.timestamp || "").slice(5, 10),
        dau:      r.dau ?? r.dailyActiveUsers ?? 0,
        duration: Math.round((r.averagePlayDuration ?? 0) / 60),
        sessions: r.sessions ?? 0,
      })));
    } catch { setTrend([]); }
    finally   { setTrendLoad(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (selected?.code) fetchTrend(selected.code); }, [selected, fetchTrend]);

  // Derived chart data
  const rankData = islands.slice(0, 10).map(isl => {
    const m = metrics[isl.code];
    const r = m?.metrics?.[0] || m?.data?.[0] || {};
    return {
      name:     (isl.title || isl.code || "").slice(0, 16),
      code:     isl.code,
      dau:      r.dau ?? r.dailyActiveUsers ?? 0,
      duration: Math.round((r.averagePlayDuration ?? 0) / 60),
    };
  });
  const valid      = rankData.filter(d => d.dau > 0);
  const totalDAU   = valid.reduce((s, d) => s + d.dau, 0);
  const avgDur     = valid.length ? Math.round(valid.reduce((s, d) => s + d.duration, 0) / valid.length) : 0;
  const pieData    = valid.slice(0, 6).map((d, i) => ({ name: d.name, value: d.dau, fill: COLORS[i] }));
  const filtered   = islands.filter(i => (i.title || i.code || "").toLowerCase().includes(search.toLowerCase()));

  // ── Responsive helper (mobile < 600px) ──
  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

  return (
    <div style={{ minHeight: "100vh", background: "#06070f", color: "#e8e8f0", fontFamily: "'Rajdhani','Barlow Condensed',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06070f; -webkit-text-size-adjust: 100%; }
        @keyframes pulse   { 0%,100%{opacity:.35} 50%{opacity:.9} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 8px #FFD70033} 50%{box-shadow:0 0 22px #FFD70077} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#0d0d1a} ::-webkit-scrollbar-thumb{background:#FFD70055;border-radius:3px}
        .card    { background:linear-gradient(135deg,#0e0f22,#121328); border:1px solid #1e2040; border-radius:12px; padding:16px; }
        .tag     { display:inline-block; background:#FFD70022; color:#FFD700; border-radius:4px; padding:2px 8px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; }
        .tab     { padding:8px 16px; border-radius:6px; border:none; cursor:pointer; font-family:inherit; font-weight:700; font-size:13px; letter-spacing:.4px; transition:all .2s; white-space:nowrap; }
        .tab-on  { background:#FFD700; color:#06070f; }
        .tab-off { background:transparent; color:#777; border:1px solid #222; }
        .tab-off:hover { border-color:#FFD70066; color:#FFD700; }
        .irow    { padding:10px 12px; border-radius:8px; cursor:pointer; transition:background .15s; display:flex; align-items:center; gap:10px; border:1px solid transparent; }
        .irow:hover { background:#FFD70010; border-color:#FFD70033; }
        .irow-sel{ background:#FFD70015; border-color:#FFD70066 !important; animation:glow 2s ease-in-out infinite; }
        input:focus { border-color:#FFD70066 !important; outline:none; }
        @media(max-width:600px){
          .main-grid   { grid-template-columns:1fr !important; }
          .stats-grid  { flex-wrap:wrap; }
          .tab-scroll  { overflow-x:auto; padding-bottom:4px; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{ background: "linear-gradient(90deg,#06070f,#0c0d25 50%,#06070f)", borderBottom: "1px solid #1e2040", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: "#FFD700", textShadow: "0 0 18px #FFD70066" }}>⚡ FORTNITE</div>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: 2, textTransform: "uppercase", display: isMobile ? "none" : "block" }}>Island Analytics</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {updated && <span style={{ fontSize: 10, color: "#333" }}>{updated.toLocaleTimeString("ja-JP")}</span>}
          <span className="tag">Live</span>
          <button onClick={fetchAll} disabled={loading} style={{ background: "#1e2040", color: "#aaa", border: "1px solid #2a2d50", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 12, opacity: loading ? .5 : 1 }}>
            {loading ? "⟳" : "↻"}
          </button>
        </div>
      </header>

      <main style={{ padding: "16px" }}>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "#2a0a0a", border: "1px solid #F43F5E66", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 16, animation: "slideIn .3s ease" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>⚠️</div>
            <div style={{ color: "#F43F5E", fontWeight: 700 }}>{error}</div>
            <button onClick={fetchAll} style={{ background: "#FFD700", color: "#06070f", border: "none", borderRadius: 6, padding: "9px 22px", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 12 }}>再試行</button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="stats-grid" style={{ display: "flex", gap: 12, marginBottom: 16, animation: "slideIn .4s ease" }}>
          <StatCard icon="🏝️" label="島の数"         value={islands.length}    color="#00D4FF" loading={loading} />
          <StatCard icon="👥" label="総DAU"          value={fmt(totalDAU)}     color="#FFD700" loading={loading} />
          <StatCard icon="⏱️" label="平均プレイ時間"  value={`${avgDur}分`}     color="#A855F7" loading={loading} />
          <StatCard icon="🏆" label="1位"            value={valid[0]?.name?.slice(0,12) || "—"} color="#10B981" loading={loading} />
        </div>

        {/* ── Tabs ── */}
        <div className="tab-scroll" style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["ranking","🏆 ランキング"],["duration","⏱️ 時間分布"],["pie","🥧 シェア"],["explore","🔍 島を探す"]].map(([t, l]) => (
            <button key={t} className={`tab ${tab === t ? "tab-on" : "tab-off"}`} onClick={() => setTab(t)}>{l}</button>
          ))}
        </div>

        {/* ── Grid ── */}
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "start" }}>

          {/* Left chart */}
          <div className="card" style={{ minHeight: 360, animation: "slideIn .3s ease" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(7)].map((_, i) => <Sk key={i} h={36} />)}
              </div>
            ) : tab === "ranking" ? (
              <>
                <p style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>日間アクティブユーザー（上位10島）</p>
                {valid.length === 0
                  ? <div style={{ textAlign: "center", color: "#444", padding: "50px 0" }}>DAUデータがありません</div>
                  : <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={valid} layout="vertical" margin={{ left: 0, right: 36 }}>
                        <XAxis type="number" tickFormatter={fmt} stroke="#222" tick={{ fill: "#555", fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={130} tick={{ fill: "#999", fontSize: 11 }} />
                        <Tooltip content={<CTip />} />
                        <Bar dataKey="dau" name="DAU" radius={[0, 4, 4, 0]}>
                          {valid.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                }
              </>
            ) : tab === "duration" ? (
              <>
                <p style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>プレイ時間(分) vs DAU — 右上が人気で長時間</p>
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 0 }}>
                    <CartesianGrid stroke="#1a1a2e" />
                    <XAxis dataKey="dau" name="DAU" tickFormatter={fmt} stroke="#222" tick={{ fill: "#555", fontSize: 11 }} label={{ value: "DAU", position: "insideBottom", offset: -6, fill: "#444", fontSize: 11 }} />
                    <YAxis dataKey="duration" name="分" stroke="#222" tick={{ fill: "#555", fontSize: 11 }} label={{ value: "分", angle: -90, position: "insideLeft", fill: "#444", fontSize: 11 }} />
                    <ZAxis range={[60, 260]} />
                    <Tooltip content={<CTip />} cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={valid} fillOpacity={0.85}>
                      {valid.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </>
            ) : tab === "pie" ? (
              <>
                <p style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>DAUシェア（上位6島）</p>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius="60%"
                      label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: "#333" }}>
                      {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <>
                <input
                  placeholder="🔍 島名 / コードで検索..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", background: "#0d0e1f", border: "1px solid #1e2040", borderRadius: 8, padding: "10px 13px", color: "#e8e8f0", fontSize: 14, fontFamily: "inherit", marginBottom: 10 }}
                />
                <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                  {filtered.slice(0, 40).map((isl, i) => (
                    <div key={isl.code} className={`irow ${selected?.code === isl.code ? "irow-sel" : ""}`} onClick={() => setSelected(isl)}>
                      <div style={{ width: 22, height: 22, borderRadius: 5, background: COLORS[i % COLORS.length] + "22", border: `1px solid ${COLORS[i % COLORS.length]}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: COLORS[i % COLORS.length], flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isl.title || isl.code}</div>
                        <div style={{ fontSize: 10, color: "#3a3a5c", letterSpacing: .5, fontFamily: "monospace" }}>{isl.code}</div>
                      </div>
                      {selected?.code === isl.code && <span style={{ color: "#FFD700", flexShrink: 0 }}>▶</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Island detail */}
            {selected ? (
              <>
                <div className="card" style={{ animation: "slideIn .3s ease" }}>
                  <span className="tag">Selected</span>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#FFD700", margin: "10px 0 4px", lineHeight: 1.3 }}>{selected.title || selected.code}</div>
                  <div style={{ fontSize: 10, color: "#333", letterSpacing: 1, marginBottom: 10, fontFamily: "monospace" }}>{selected.code}</div>
                  {selected.description && (
                    <div style={{ fontSize: 12, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>{selected.description.slice(0, 140)}...</div>
                  )}
                  {selected.tags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {selected.tags.slice(0, 6).map(t => (
                        <span key={t} style={{ background: "#1a1a2e", color: "#888", border: "1px solid #252540", borderRadius: 4, padding: "2px 7px", fontSize: 10 }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7-day DAU trend */}
                <div className="card">
                  <p style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>📈 7日間 DAUトレンド</p>
                  {trendLoad ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}><Sk h={14} /><Sk h={120} /></div>
                  ) : trend.length === 0 ? (
                    <div style={{ color: "#333", fontSize: 12, textAlign: "center", padding: "16px 0" }}>データなし</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={130}>
                      <LineChart data={trend}>
                        <CartesianGrid stroke="#1a1a2e" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 10 }} />
                        <YAxis tickFormatter={fmt} tick={{ fill: "#444", fontSize: 10 }} width={30} />
                        <Tooltip content={<CTip />} />
                        <Line type="monotone" dataKey="dau" name="DAU" stroke="#FFD700" strokeWidth={2} dot={{ fill: "#FFD700", r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Sessions (if available) */}
                {trend.length > 0 && trend.some(t => t.sessions > 0) && (
                  <div className="card">
                    <p style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>🎮 セッション数</p>
                    <ResponsiveContainer width="100%" height={110}>
                      <BarChart data={trend}>
                        <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 10 }} />
                        <YAxis tickFormatter={fmt} tick={{ fill: "#444", fontSize: 10 }} width={30} />
                        <Tooltip content={<CTip />} />
                        <Bar dataKey="sessions" name="Sessions" fill="#A855F7" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="card" style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ fontSize: 40 }}>🏝️</div>
                <div style={{ fontSize: 13, color: "#333" }}>「島を探す」で選択</div>
              </div>
            )}

            {/* DAU mini bar */}
            {!loading && valid.length > 0 && (
              <div className="card">
                <p style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>🏅 DAU 上位5</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {valid.slice(0, 5).map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 12, fontSize: 10, color: "#444", flexShrink: 0, textAlign: "right" }}>{i + 1}</div>
                      <div style={{ flex: 1, height: 7, background: "#1a1a2e", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(d.dau / (valid[0]?.dau || 1)) * 100}%`, background: COLORS[i], borderRadius: 4, transition: "width 1s ease" }} />
                      </div>
                      <div style={{ fontSize: 11, color: COLORS[i], width: 40, textAlign: "right", fontWeight: 700, flexShrink: 0 }}>{fmt(d.dau)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
