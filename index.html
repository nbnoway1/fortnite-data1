import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// ── Config ────────────────────────────────────────────────────────────
const MY_ISLANDS = [
  { code: "3808-8348-4233", color: "#FFD700", short: "MAP1" },
  { code: "5240-9604-1946", color: "#00D4FF", short: "MAP2" },
  { code: "0126-6244-2163", color: "#FF6B35", short: "MAP3" },
  { code: "3890-4970-8669", color: "#A855F7", short: "MAP4" },
];
const POLL_INTERVAL = 60000; // 60秒ごとに更新
const MAX_RT_POINTS = 30;    // リアルタイムグラフに保持するデータ点数

const fmt   = (n) => n == null ? "—" : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(Math.round(n));
const fmtMin= (s) => s == null ? "—" : `${Math.floor(s/60)}分${s%60}秒`;
const now   = () => new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// ── API fetch ─────────────────────────────────────────────────────────
async function apiFetch(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `/api/${path}${qs ? "?" + qs : ""}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);
  return r.json();
}

// ── Sub-components ────────────────────────────────────────────────────
const Sk = ({ h = 20, w = "100%" }) => (
  <div style={{ height: h, width: w, background: "#ffffff08", borderRadius: 5, animation: "pulse 1.4s ease-in-out infinite" }} />
);

const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#080910", border: "1px solid #2a2d50", borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "inherit" }}>
      {label && <div style={{ color: "#888", marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {fmt(p.value)}</div>
      ))}
    </div>
  );
};

const Pulse = ({ active }) => (
  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: active ? "#10B981" : "#444", boxShadow: active ? "0 0 6px #10B981" : "none", animation: active ? "blink 1s ease-in-out infinite" : "none" }} />
);

// ── Main ──────────────────────────────────────────────────────────────
export default function App() {
  const [meta,    setMeta]    = useState({});   // { code: { title, description } }
  const [latest,  setLatest]  = useState({});   // { code: { dau, sessions, playDuration, favorites } }
  const [history, setHistory] = useState([]);   // 7-day daily history for all islands
  const [rtData,  setRtData]  = useState([]);   // rolling realtime points [{ time, MAP1, MAP2, ... }]
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState("realtime");
  const [countdown, setCd]    = useState(60);
  const timerRef = useRef(null);
  const cdRef    = useRef(null);

  // ── Fetch metadata once ──────────────────────────────────────────
  const fetchMeta = useCallback(async () => {
    const results = await Promise.allSettled(
      MY_ISLANDS.map(i => apiFetch(`islands/${i.code}`))
    );
    const m = {};
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        const d = r.value;
        m[MY_ISLANDS[i].code] = {
          title: d.title || d.name || MY_ISLANDS[i].short,
          description: d.description || "",
          tags: d.tags || [],
        };
      } else {
        m[MY_ISLANDS[i].code] = { title: MY_ISLANDS[i].short, description: "", tags: [] };
      }
    });
    setMeta(m);
  }, []);

  // ── Fetch latest metrics (1-hour interval = most recent snapshot) ─
  const fetchLatest = useCallback(async () => {
    setPolling(true);
    try {
      const results = await Promise.allSettled(
        MY_ISLANDS.map(i =>
          apiFetch(`islands/${i.code}/metrics`, { interval: "hour", limit: 1 })
        )
      );
      const l = {};
      results.forEach((r, i) => {
        const code = MY_ISLANDS[i].code;
        if (r.status === "fulfilled") {
          const rows = r.value.metrics || r.value.data || [];
          const d = rows[0] || {};
          l[code] = {
            dau:          d.dau          ?? d.dailyActiveUsers     ?? null,
            sessions:     d.sessions     ?? d.totalSessions        ?? null,
            playDuration: d.averagePlayDuration ?? d.play_duration ?? null,
            totalMinutes: d.totalMinutesPlayed  ?? d.total_minutes ?? null,
            favorites:    d.favorites    ?? d.playerFavorites      ?? null,
          };
        } else {
          l[code] = {};
        }
      });
      setLatest(l);

      // Append a realtime point
      const point = { time: now() };
      MY_ISLANDS.forEach(isl => {
        point[isl.short] = l[isl.code]?.sessions ?? 0;
        point[`${isl.short}_dau`] = l[isl.code]?.dau ?? 0;
      });
      setRtData(prev => [...prev.slice(-MAX_RT_POINTS + 1), point]);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setPolling(false);
    }
  }, []);

  // ── Fetch 7-day daily history ──────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    const end   = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const results = await Promise.allSettled(
      MY_ISLANDS.map(i =>
        apiFetch(`islands/${i.code}/metrics`, { interval: "day", startDate: start, endDate: end })
      )
    );
    // Build unified [ { date, MAP1, MAP2, MAP3, MAP4 } ]
    const byDate = {};
    results.forEach((r, idx) => {
      if (r.status !== "fulfilled") return;
      const rows = r.value.metrics || r.value.data || [];
      rows.forEach(row => {
        const date = (row.date || row.timestamp || "").slice(5, 10);
        if (!byDate[date]) byDate[date] = { date };
        byDate[date][MY_ISLANDS[idx].short]              = row.dau ?? row.dailyActiveUsers ?? 0;
        byDate[date][`${MY_ISLANDS[idx].short}_sessions`] = row.sessions ?? 0;
        byDate[date][`${MY_ISLANDS[idx].short}_dur`]      = Math.round((row.averagePlayDuration ?? 0) / 60);
      });
    });
    setHistory(Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)));
  }, []);

  // ── Initial load ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchMeta(), fetchLatest(), fetchHistory()]);
      setLoading(false);
    })();
  }, [fetchMeta, fetchLatest, fetchHistory]);

  // ── Auto-poll every 60s ────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      fetchLatest();
      setCd(60);
    }, POLL_INTERVAL);

    cdRef.current = setInterval(() => {
      setCd(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(cdRef.current);
    };
  }, [fetchLatest]);

  // ── Derived totals ─────────────────────────────────────────────────
  const totalDAU      = MY_ISLANDS.reduce((s, i) => s + (latest[i.code]?.dau      ?? 0), 0);
  const totalSessions = MY_ISLANDS.reduce((s, i) => s + (latest[i.code]?.sessions ?? 0), 0);
  const avgDuration   = (() => {
    const vals = MY_ISLANDS.map(i => latest[i.code]?.playDuration).filter(v => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  // Radar data: normalize each metric per island
  const radarData = ["dau","sessions","totalMinutes"].map(key => {
    const row = { metric: { dau:"DAU", sessions:"セッション", totalMinutes:"総プレイ時間" }[key] };
    const vals = MY_ISLANDS.map(i => latest[i.code]?.[key] ?? 0);
    const max  = Math.max(...vals, 1);
    MY_ISLANDS.forEach((isl, idx) => { row[isl.short] = Math.round((vals[idx] / max) * 100); });
    return row;
  });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div style={{ minHeight: "100vh", background: "#05060e", color: "#e0e0f0", fontFamily: "'Rajdhani','Barlow Condensed',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#05060e}
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:.85}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes slideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0b18}::-webkit-scrollbar-thumb{background:#FFD70044;border-radius:3px}
        .card{background:linear-gradient(135deg,#0c0d1e,#10112a);border:1px solid #1a1c38;border-radius:12px;padding:16px}
        .tab{padding:7px 15px;border-radius:6px;border:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:12px;letter-spacing:.4px;transition:all .2s;white-space:nowrap}
        .ton{background:#FFD700;color:#05060e}
        .toff{background:transparent;color:#666;border:1px solid #1a1c38}
        .toff:hover{border-color:#FFD70055;color:#FFD700}
        .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase}
        @media(max-width:640px){.grid2{grid-template-columns:1fr!important}.tabs{overflow-x:auto;padding-bottom:3px}}
      `}</style>

      {/* ── Header ── */}
      <header style={{ background:"linear-gradient(90deg,#05060e,#0b0d22 50%,#05060e)", borderBottom:"1px solid #1a1c38", padding:"12px 16px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100, backdropFilter:"blur(12px)" }}>
        <div style={{ fontSize:20, fontWeight:700, letterSpacing:2, color:"#FFD700", textShadow:"0 0 16px #FFD70055" }}>⚡ MY ISLANDS</div>
        <div style={{ fontSize:10, color:"#333", letterSpacing:3, textTransform:"uppercase" }}>Realtime Analytics</div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
          <Pulse active={!loading && !polling} />
          <span style={{ fontSize:11, color:"#555" }}>次回更新 {countdown}s</span>
          <button onClick={()=>{fetchLatest();fetchHistory();setCd(60);}} style={{ background:"#1a1c38", color:"#888", border:"1px solid #252745", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit", fontSize:12, opacity: polling?0.5:1 }}>
            {polling ? "⟳ 取得中" : "↻ 今すぐ更新"}
          </button>
        </div>
      </header>

      <main style={{ padding:"14px 14px 40px" }}>

        {/* ── Error ── */}
        {error && (
          <div style={{ background:"#1e0808", border:"1px solid #F43F5E55", borderRadius:10, padding:"14px 18px", marginBottom:14, fontSize:13, color:"#F43F5E" }}>
            ⚠️ {error} — <span style={{ color:"#888" }}>APIサーバー経由で再試行してください</span>
          </div>
        )}

        {/* ── Island name cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
          {MY_ISLANDS.map(isl => {
            const m  = meta[isl.code];
            const lv = latest[isl.code];
            return (
              <div key={isl.code} className="card" style={{ borderColor: isl.color + "44", animation:"slideIn .4s ease" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:isl.color, flexShrink:0, boxShadow:`0 0 6px ${isl.color}` }} />
                  <div style={{ fontSize:10, color:isl.color, fontWeight:700, letterSpacing:1 }}>{isl.short}</div>
                </div>
                {loading ? <Sk h={16} w="80%" /> : (
                  <div style={{ fontSize:13, fontWeight:700, lineHeight:1.3, marginBottom:6, color:"#ddd" }}>
                    {m?.title || isl.code}
                  </div>
                )}
                <div style={{ fontSize:10, color:"#333", fontFamily:"monospace" }}>{isl.code}</div>
                {!loading && lv && (
                  <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:isl.color, fontWeight:700 }}>DAU {fmt(lv.dau)}</span>
                    <span style={{ fontSize:12, color:"#555" }}>／</span>
                    <span style={{ fontSize:12, color:"#aaa" }}>{fmt(lv.sessions)} sessions</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Summary stats ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
          {[
            { label:"合計 DAU",        value: fmt(totalDAU),             icon:"👥", color:"#FFD700" },
            { label:"合計セッション数", value: fmt(totalSessions),        icon:"🎮", color:"#00D4FF" },
            { label:"平均プレイ時間",   value: fmtMin(Math.round(avgDuration)), icon:"⏱️", color:"#A855F7" },
            { label:"監視中の島",       value: `${MY_ISLANDS.length} 島`, icon:"🏝️", color:"#10B981" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ textAlign:"center", padding:"14px 10px" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              {loading ? <Sk h={22} w="60%" /> : (
                <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
              )}
              <div style={{ fontSize:11, color:"#444", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="tabs" style={{ display:"flex", gap:6, marginBottom:12 }}>
          {[
            ["realtime","⚡ リアルタイム"],
            ["daily",   "📅 7日間DAU"],
            ["sessions","🎮 セッション推移"],
            ["duration","⏱️ プレイ時間"],
            ["radar",   "🕸️ 総合比較"],
          ].map(([t, l]) => (
            <button key={t} className={`tab ${tab===t?"ton":"toff"}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>

        {/* ── Chart Area ── */}
        <div className="card" style={{ minHeight:360, animation:"slideIn .3s ease", marginBottom:14 }}>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[...Array(8)].map((_,i)=><Sk key={i} h={32} />)}
            </div>
          ) : tab === "realtime" ? (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <Pulse active={!polling} />
                <span style={{ fontSize:13, color:"#666" }}>セッション数 — 60秒ごとに自動更新 ({rtData.length} ポイント取得済み)</span>
              </div>
              {rtData.length === 0 ? (
                <div style={{ textAlign:"center", color:"#333", padding:"60px 0", fontSize:14 }}>データ取得中...</div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={rtData} margin={{ top:5, right:20, bottom:5, left:0 }}>
                    <defs>
                      {MY_ISLANDS.map(isl => (
                        <linearGradient key={isl.code} id={`grad_${isl.short}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={isl.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={isl.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="#12132a" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill:"#444", fontSize:10 }} interval="preserveStartEnd" />
                    <YAxis tickFormatter={fmt} tick={{ fill:"#444", fontSize:10 }} width={32} />
                    <Tooltip content={<CTip />} />
                    <Legend />
                    {MY_ISLANDS.map(isl => (
                      <Area key={isl.code} type="monotone" dataKey={isl.short} name={meta[isl.code]?.title?.slice(0,12) || isl.short}
                        stroke={isl.color} fill={`url(#grad_${isl.short})`} strokeWidth={2} dot={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </>
          ) : tab === "daily" ? (
            <>
              <div style={{ fontSize:12, color:"#555", marginBottom:14 }}>日間アクティブユーザー数（過去7日間）</div>
              {history.length === 0 ? (
                <div style={{ textAlign:"center", color:"#333", padding:"60px 0", fontSize:14 }}>データなし</div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={history} margin={{ top:5, right:20, bottom:5, left:0 }}>
                    <CartesianGrid stroke="#12132a" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill:"#444", fontSize:10 }} />
                    <YAxis tickFormatter={fmt} tick={{ fill:"#444", fontSize:10 }} width={36} />
                    <Tooltip content={<CTip />} />
                    <Legend />
                    {MY_ISLANDS.map(isl => (
                      <Bar key={isl.code} dataKey={isl.short} name={meta[isl.code]?.title?.slice(0,12) || isl.short}
                        fill={isl.color} radius={[3,3,0,0]} stackId="a" />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          ) : tab === "sessions" ? (
            <>
              <div style={{ fontSize:12, color:"#555", marginBottom:14 }}>セッション数（過去7日間）</div>
              {history.length === 0 ? (
                <div style={{ textAlign:"center", color:"#333", padding:"60px 0" }}>データなし</div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={history} margin={{ top:5, right:20, bottom:5, left:0 }}>
                    <CartesianGrid stroke="#12132a" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill:"#444", fontSize:10 }} />
                    <YAxis tickFormatter={fmt} tick={{ fill:"#444", fontSize:10 }} width={36} />
                    <Tooltip content={<CTip />} />
                    <Legend />
                    {MY_ISLANDS.map(isl => (
                      <Line key={isl.code} type="monotone" dataKey={`${isl.short}_sessions`}
                        name={meta[isl.code]?.title?.slice(0,12) || isl.short}
                        stroke={isl.color} strokeWidth={2} dot={{ r:3, fill:isl.color }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          ) : tab === "duration" ? (
            <>
              <div style={{ fontSize:12, color:"#555", marginBottom:14 }}>平均プレイ時間（分）— 過去7日間</div>
              {history.length === 0 ? (
                <div style={{ textAlign:"center", color:"#333", padding:"60px 0" }}>データなし</div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={history} margin={{ top:5, right:20, bottom:5, left:0 }}>
                    <CartesianGrid stroke="#12132a" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill:"#444", fontSize:10 }} />
                    <YAxis tick={{ fill:"#444", fontSize:10 }} width={28} unit="分" />
                    <Tooltip content={<CTip />} />
                    <Legend />
                    {MY_ISLANDS.map(isl => (
                      <Line key={isl.code} type="monotone" dataKey={`${isl.short}_dur`}
                        name={meta[isl.code]?.title?.slice(0,12) || isl.short}
                        stroke={isl.color} strokeWidth={2} dot={{ r:3, fill:isl.color }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize:12, color:"#555", marginBottom:14 }}>各メトリクスの相対比較（100 = 4島中の最大値）</div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} margin={{ top:10, right:30, bottom:10, left:30 }}>
                  <PolarGrid stroke="#1a1c38" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill:"#666", fontSize:12 }} />
                  <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fill:"#333", fontSize:9 }} />
                  {MY_ISLANDS.map(isl => (
                    <Radar key={isl.code} name={meta[isl.code]?.title?.slice(0,12) || isl.short}
                      dataKey={isl.short} stroke={isl.color} fill={isl.color} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                  <Legend />
                  <Tooltip content={<CTip />} />
                </RadarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* ── Per-island detail table ── */}
        <div className="card">
          <div style={{ fontSize:12, color:"#555", marginBottom:12 }}>📊 最新スナップショット（直近1時間）</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #1a1c38" }}>
                  {["島名","コード","DAU","セッション数","平均プレイ時間","総プレイ時間(分)"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", textAlign:"left", color:"#555", fontWeight:600, fontSize:11, letterSpacing:.5, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MY_ISLANDS.map((isl, i) => {
                  const lv = latest[isl.code] || {};
                  const m  = meta[isl.code] || {};
                  return (
                    <tr key={isl.code} style={{ borderBottom:"1px solid #0e0f22" }}>
                      <td style={{ padding:"10px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:isl.color, boxShadow:`0 0 5px ${isl.color}`, flexShrink:0 }} />
                          <span style={{ fontWeight:600, color:"#ccc" }}>{loading ? "—" : (m.title || isl.short)}</span>
                        </div>
                      </td>
                      <td style={{ padding:"10px 12px", fontFamily:"monospace", fontSize:11, color:"#3a3a5c" }}>{isl.code}</td>
                      <td style={{ padding:"10px 12px", color:isl.color, fontWeight:700 }}>{loading ? "—" : fmt(lv.dau)}</td>
                      <td style={{ padding:"10px 12px", color:"#aaa" }}>{loading ? "—" : fmt(lv.sessions)}</td>
                      <td style={{ padding:"10px 12px", color:"#aaa" }}>{loading ? "—" : fmtMin(lv.playDuration)}</td>
                      <td style={{ padding:"10px 12px", color:"#aaa" }}>{loading ? "—" : fmt(lv.totalMinutes)}</td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr style={{ borderTop:"2px solid #FFD70033", background:"#FFD7000a" }}>
                  <td colSpan={2} style={{ padding:"10px 12px", color:"#FFD700", fontWeight:700, fontSize:12 }}>合計 / 平均</td>
                  <td style={{ padding:"10px 12px", color:"#FFD700", fontWeight:700 }}>{fmt(totalDAU)}</td>
                  <td style={{ padding:"10px 12px", color:"#FFD700", fontWeight:700 }}>{fmt(totalSessions)}</td>
                  <td style={{ padding:"10px 12px", color:"#FFD700", fontWeight:700 }}>{fmtMin(Math.round(avgDuration))}</td>
                  <td style={{ padding:"10px 12px", color:"#555" }}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
