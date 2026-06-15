"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI, villagesAPI } from "@/lib/api";
import { edsColor, priorityBadge, type StateRanking } from "@/types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Legend
} from "recharts";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Zap, Leaf, DollarSign, Globe } from "lucide-react";

// ─── KPI Card ─────────────────────────────────────────────────
function KPICard({ label, value, unit, icon: Icon, color, delta }: any) {
  return (
    <div className="glass-card-glow p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={20} color={color} />
        </div>
        {delta && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }}>
            ↑ {delta}
          </span>
        )}
      </div>
      <div className="kpi-value mt-1" style={{ color }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{unit}</div>
      <div className="section-label mt-2">{label}</div>
    </div>
  );
}

// ─── Radar ────────────────────────────────────────────────────
const RADAR_DATA = [
  { subject: "Education",   A: 72 },
  { subject: "Healthcare",  A: 61 },
  { subject: "Economic",    A: 65 },
  { subject: "Women",       A: 54 },
  { subject: "Digital",     A: 48 },
  { subject: "Carbon",      A: 59 },
];

// ─── Tooltip ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs" style={{ border: "1px solid rgba(0,212,255,0.2)", minWidth: 140 }}>
      <div className="font-bold mb-2" style={{ color: "#00D4FF" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-white">{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── TABS ─────────────────────────────────────────────────────
const TABS = ["Overview", "Regions", "Insights"];

export default function DashboardPage() {
  const [tab, setTab] = useState("Overview");

  const { data: kpiData } = useQuery({ queryKey: ["dashboard-kpis"], queryFn: () => analyticsAPI.dashboard() });
  const { data: trendData } = useQuery({ queryKey: ["eds-trend"], queryFn: () => analyticsAPI.edsTrend() });
  const { data: stateData } = useQuery({ queryKey: ["state-rankings"], queryFn: () => analyticsAPI.stateRankings() });

  const kpis = kpiData?.data?.kpis;
  const trend = trendData?.data?.trend || [];
  const states: StateRanking[] = stateData?.data?.states || [];

  const MOCK_VILLAGES = [
    { name: "Rampur Khas",  state: "UP",          pop: 2840, eds: 71,  priority: "High",     roi: "3.2x" },
    { name: "Sundarpada",   state: "Odisha",      pop: 1620, eds: 48,  priority: "Critical", roi: "4.8x" },
    { name: "Navapur",      state: "Maharashtra", pop: 3200, eds: 83,  priority: "Medium",   roi: "1.9x" },
    { name: "Chhatarpur",   state: "MP",          pop: 1980, eds: 55,  priority: "High",     roi: "3.7x" },
    { name: "Koraput",      state: "Odisha",      pop: 1340, eds: 39,  priority: "Critical", roi: "5.6x" },
    { name: "Jaganpur",     state: "Bihar",       pop: 2260, eds: 44,  priority: "Critical", roi: "4.2x" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 stagger">
        <KPICard label="Villages Analyzed" value={kpis ? (kpis.total_villages / 1000).toFixed(0) + "K+" : "45K+"} icon={Globe} color="#00D4FF" delta="+1.2K" />
        <KPICard label="Average EDS Score" value={kpis?.average_eds?.toFixed(1) || "67.4"} unit="/100" icon={Zap} color="#00FF88" delta="+3.2 pts" />
        <KPICard label="Carbon Saved" value="2.8M" unit="tCO₂" icon={Leaf} color="#7B61FF" delta="+12%" />
        <KPICard label="Economic Impact" value="₹2.3T" icon={DollarSign} color="#FFB547" delta="+₹340B" />
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              color: tab === t ? "#00D4FF" : "rgba(255,255,255,0.45)",
              borderBottom: tab === t ? "2px solid #00D4FF" : "2px solid transparent",
              marginBottom: -1,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────── */}
      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-5">
            {/* Trend Chart */}
            <div className="col-span-3 glass-card p-6">
              <div className="font-bold mb-1">National EDS Trend</div>
              <div className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>5-year Energy Dignity Score trajectory</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trend.length ? trend : [
                  { year: "2020", EDS: 48, Economic: 35, Education: 42 },
                  { year: "2021", EDS: 54, Economic: 41, Education: 47 },
                  { year: "2022", EDS: 59, Economic: 50, Education: 55 },
                  { year: "2023", EDS: 64, Economic: 59, Education: 61 },
                  { year: "2024", EDS: 67, Economic: 63, Education: 66 },
                  { year: "2025E", EDS: 73, Economic: 70, Education: 72 },
                ]}>
                  <defs>
                    {[["eG","#00D4FF"],["econG","#7B61FF"],["eduG","#00FF88"]].map(([id,c])=>(
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={c} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={c} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <YAxis domain={[0,100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="EDS"      stroke="#00D4FF" fill="url(#eG)"    strokeWidth={2} name="EDS" />
                  <Area type="monotone" dataKey="Economic" stroke="#7B61FF" fill="url(#econG)" strokeWidth={2} name="Economic" />
                  <Area type="monotone" dataKey="Education"stroke="#00FF88" fill="url(#eduG)" strokeWidth={2} strokeDasharray="4 2" name="Education" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="col-span-2 glass-card p-6">
              <div className="font-bold mb-1">EDS Components</div>
              <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>National average</div>
              <ResponsiveContainer width="100%" height={230}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} />
                  <Radar dataKey="A" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.12} dot={{ fill: "#00D4FF", r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Village Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 pb-0 flex justify-between items-center">
              <div>
                <div className="font-bold">Priority Investment Villages</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Ranked by ROI × Dignity Impact</div>
              </div>
              <Link href="/dashboard/villages" className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#00D4FF" }}>
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="edi-table">
                <thead>
                  <tr>
                    {["Village","State","Population","EDS Score","Priority","ROI","Action"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_VILLAGES.map(v => (
                    <tr key={v.name}>
                      <td className="font-semibold">{v.name}</td>
                      <td style={{ color: "rgba(255,255,255,0.5)" }}>{v.state}</td>
                      <td>{v.pop.toLocaleString("en-IN")}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar w-16">
                            <div className="progress-fill" style={{ width: `${v.eds}%`, background: edsColor(v.eds) }} />
                          </div>
                          <span className="font-bold text-xs" style={{ color: edsColor(v.eds) }}>{v.eds}</span>
                        </div>
                      </td>
                      <td><span className={priorityBadge(v.priority)}>{v.priority}</span></td>
                      <td className="font-bold" style={{ color: "#00FF88" }}>{v.roi}</td>
                      <td>
                        <Link href="/dashboard/simulator"
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}>
                          Analyze →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── REGIONS ──────────────────────────────────────────── */}
      {tab === "Regions" && (
        <div className="glass-card p-6">
          <div className="font-bold mb-1">State Rankings by EDS</div>
          <div className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Top 10 states sorted by Energy Dignity Score</div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={(states.length ? states : [
                { state: "Kerala", eds: 88.1 }, { state: "Tamil Nadu", eds: 81.3 },
                { state: "Karnataka", eds: 76.2 }, { state: "Maharashtra", eds: 73.9 },
                { state: "Gujarat", eds: 72.5 }, { state: "Punjab", eds: 71.1 },
                { state: "Telangana", eds: 68.4 }, { state: "AP", eds: 64.7 },
                { state: "Rajasthan", eds: 61.2 }, { state: "MP", eds: 58.9 },
              ]).slice(0, 10)}
              layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[0,100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
              <YAxis type="category" dataKey="state" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="eds" fill="#00D4FF" radius={4} name="EDS Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── INSIGHTS ─────────────────────────────────────────── */}
      {tab === "Insights" && (
        <div className="grid grid-cols-2 gap-5">
          {[
            { icon: "💡", title: "Highest ROI Opportunity", body: "Investing ₹1 Crore in Koraput Village yields 5.6x higher Energy Dignity Impact than national average investments.", type: "opportunity", color: "#00D4FF" },
            { icon: "⚠️", title: "Critical Gap: Bihar & Jharkhand", body: "17 villages in Eastern India have EDS below 45, requiring urgent grid connectivity and healthcare infrastructure.", type: "warning", color: "#FFB547" },
            { icon: "📈", title: "Women's Empowerment Multiplier", body: "Villages with female employment above 50% show 2.3x faster EDS improvement after electrification.", type: "insight", color: "#7B61FF" },
            { icon: "🌱", title: "Renewable Dividend", body: "Solar microgrids increase the carbon benefit component by 40% compared to grid extension across 78% of villages.", type: "insight", color: "#00FF88" },
          ].map(item => (
            <div key={item.title} className="glass-card p-6" style={{ borderColor: `${item.color}25` }}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-bold mb-2 text-base">{item.title}</div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
