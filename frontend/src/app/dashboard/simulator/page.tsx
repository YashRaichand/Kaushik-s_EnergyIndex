"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { predictionsAPI } from "@/lib/api";
import type { PredictionResult, SimulateInput } from "@/types";
import { edsColor, priorityColor, priorityBadge } from "@/types";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import toast from "react-hot-toast";
import { Zap, Loader2, Download, RefreshCw } from "lucide-react";

const DEFAULTS: SimulateInput = {
  village_name: "My Village", state: "Uttar Pradesh",
  population: 2500, households: 600, electricity_access_pct: 35,
  school_count: 3, hospital_count: 1, income_level: 45000,
  internet_connectivity: 0.18, renewable_energy_pct: 20,
  grid_reliability: 0.5, night_light_intensity: 0.3,
  literacy_rate: 58, female_employment_rate: 32,
  carbon_emissions: 800, agricultural_productivity: 0.55,
  mobile_penetration: 0.45, road_connectivity: 0.6, water_access: 0.55,
};

const FIELDS = [
  ["Village Name",        "village_name",            "text",   null,  null,     0.01 ],
  ["State",               "state",                   "text",   null,  null,     0.01 ],
  ["Population",          "population",              "number", 200,   100000,   1    ],
  ["Households",          "households",              "number", 50,    20000,    1    ],
  ["Electricity Access %","electricity_access_pct",  "number", 0,     100,      1    ],
  ["School Count",        "school_count",            "number", 0,     30,       1    ],
  ["Hospital Count",      "hospital_count",          "number", 0,     20,       1    ],
  ["Avg Income (₹/yr)",   "income_level",            "number", 10000, 1000000,  1000 ],
  ["Literacy Rate %",     "literacy_rate",           "number", 10,    100,      1    ],
  ["Female Employment %", "female_employment_rate",  "number", 5,     90,       1    ],
  ["Renewable Energy %",  "renewable_energy_pct",    "number", 0,     100,      1    ],
  ["Road Connectivity",   "road_connectivity",       "number", 0,     1,        0.05 ],
  ["Water Access",        "water_access",            "number", 0,     1,        0.05 ],
  ["Internet Access",     "internet_connectivity",   "number", 0,     1,        0.05 ],
  ["Mobile Penetration",  "mobile_penetration",      "number", 0,     1,        0.05 ],
  ["Carbon Emissions(t)", "carbon_emissions",        "number", 0,     20000,    10   ],
] as const;

// ─── Score Circle ──────────────────────────────────────────────
function ScoreCircle({ value, label, color, size = 100 }: { value: number; label: string; color: string; size?: number }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeDasharray={circ} strokeDashoffset={circ - (circ * value / 100)}
            strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: "stroke-dashoffset 1.2s ease", filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span className="font-black text-sm" style={{ color }}>{value.toFixed(0)}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>/100</span>
        </div>
      </div>
      <span className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
    </div>
  );
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs" style={{ border: "1px solid rgba(0,212,255,0.2)", minWidth: 140 }}>
      <div className="font-bold mb-1.5" style={{ color: "#00D4FF" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold">{Number(p.value).toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export default function SimulatorPage() {
  const [form, setForm] = useState<SimulateInput>(DEFAULTS);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const mutation = useMutation({
    mutationFn: (data: SimulateInput) => predictionsAPI.simulate(data).then(r => r.data),
    onSuccess: (data) => {
      setResult(data);
      toast.success("EDS Analysis Complete!");
    },
    onError: () => toast.error("Analysis failed — check connection"),
  });

  const update = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const radarData = result ? [
    { subject: "Education", A: result.components.education },
    { subject: "Healthcare", A: result.components.healthcare },
    { subject: "Economic",  A: result.components.economic },
    { subject: "Women",     A: result.components.women },
    { subject: "Digital",   A: result.components.digital },
    { subject: "Carbon",    A: result.components.carbon },
  ] : [];

  return (
    <div className="grid grid-cols-5 gap-6" style={{ alignItems: "start" }}>
      {/* ── INPUT PANEL ────────────────────────────────────── */}
      <div className="col-span-2 space-y-4">
        <div className="glass-card-glow p-6">
          <div className="font-bold text-base mb-0.5">Village Parameters</div>
          <div className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>17 features · EDS formula + ML ensemble</div>

          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(([label, key, type]) => (
              <div key={key as string}>
                <label className="section-label">{label as string}</label>
                <input
                  type={type as string}
                  value={(form as any)[key as string]}
                  onChange={e => update(key as string, type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="btn-primary w-full mt-5 text-sm"
          >
            {mutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Running ML Pipeline…</>
            ) : (
              <><Zap size={16} /> Predict Energy Dignity Score</>
            )}
          </button>

          {result && (
            <button onClick={() => { setResult(null); setForm(DEFAULTS); }}
              className="btn-ghost w-full mt-2 text-sm gap-2">
              <RefreshCw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── RESULTS ─────────────────────────────────────────── */}
      <div className="col-span-3 space-y-5">
        {!result && !mutation.isPending && (
          <div className="glass-card p-16 text-center">
            <div className="text-6xl mb-4">🔬</div>
            <div className="font-bold text-lg mb-2">Ready to Analyze</div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Enter village parameters and click Predict to run AI-powered EDS analysis with 5-year development trajectory.
            </p>
          </div>
        )}

        {mutation.isPending && (
          <div className="glass-card p-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-t-transparent animate-spin"
                 style={{ borderColor: "rgba(0,212,255,0.2)", borderTopColor: "#00D4FF" }} />
            <div className="font-bold mb-1">Running ML Ensemble</div>
            <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>XGBoost · Random Forest · LightGBM · AI Policy Engine</div>
          </div>
        )}

        {result && (
          <div className="space-y-5 animate-fade-up">
            {/* ── Score Banner ─────────────────────────────── */}
            <div className="glass-card-glow p-6" style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.07),rgba(123,97,255,0.07))" }}>
              <div className="flex justify-between items-start flex-wrap gap-6">
                <div>
                  <div className="section-label">Energy Dignity Score</div>
                  <div className="text-7xl font-black leading-none mt-1" style={{ color: edsColor(result.scores.eds) }}>
                    {result.scores.eds.toFixed(1)}
                  </div>
                  <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>out of 100</div>
                  {result.policy?.priority && (
                    <span className={`${priorityBadge(result.policy.priority)} mt-3 inline-block`}>
                      {result.policy.priority} Priority
                    </span>
                  )}
                </div>
                <div className="flex gap-5 flex-wrap">
                  <ScoreCircle value={result.components.education} label="Education" color="#00D4FF" />
                  <ScoreCircle value={result.components.healthcare} label="Healthcare" color="#7B61FF" />
                  <ScoreCircle value={result.components.economic} label="Economic" color="#00FF88" />
                  <ScoreCircle value={result.components.women} label="Women" color="#FFB547" />
                </div>
              </div>

              {result.policy?.dignity_insight && (
                <div className="mt-4 p-4 rounded-xl text-sm italic leading-relaxed"
                     style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)", color: "#00FF88" }}>
                  💡 "{result.policy.dignity_insight}"
                </div>
              )}

              {/* Score grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  ["Investment Priority", `${result.scores.investment_priority.toFixed(0)}/100`, "#FFB547"],
                  ["Expected ROI",        `${result.scores.expected_roi.toFixed(1)}x`,           "#00FF88"],
                  ["Confidence Level",    `${result.scores.confidence.toFixed(1)}%`,              "#00D4FF"],
                ].map(([l, v, c]) => (
                  <div key={l} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="text-xl font-black" style={{ color: c as string }}>{v}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Trajectory ──────────────────────────────── */}
            <div className="glass-card p-6">
              <div className="font-bold mb-0.5">5-Year Development Trajectory</div>
              <div className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Projected impact after full electrification</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={result.trajectory}>
                  <defs>
                    {[["g1","#00D4FF"],["g2","#7B61FF"],["g3","#00FF88"]].map(([id,c])=>(
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={c} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={c} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill:"rgba(255,255,255,0.4)", fontSize:11 }} />
                  <YAxis domain={[0,100]} tick={{ fill:"rgba(255,255,255,0.4)", fontSize:11 }} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ color:"rgba(255,255,255,0.5)", fontSize:12 }} />
                  <Area type="monotone" dataKey="EDS"       stroke="#00D4FF" fill="url(#g1)" strokeWidth={2} name="EDS" />
                  <Area type="monotone" dataKey="Economic"  stroke="#7B61FF" fill="url(#g2)" strokeWidth={2} name="Economic" />
                  <Area type="monotone" dataKey="Education" stroke="#00FF88" fill="url(#g3)" strokeWidth={2} strokeDasharray="4 2" name="Education" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* ── SHAP ──────────────────────────────────── */}
              <div className="glass-card p-6">
                <div className="font-bold mb-0.5">SHAP Feature Importance</div>
                <div className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Explainable AI — which factors drive this EDS</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[...(result.shap_values || [])].sort((a,b)=>Math.abs(b.value)-Math.abs(a.value)).slice(0,7)}
                    layout="vertical">
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill:"rgba(255,255,255,0.4)", fontSize:9 }} tickFormatter={v=>v.toFixed(2)} />
                    <YAxis type="category" dataKey="feature" tick={{ fill:"rgba(255,255,255,0.45)", fontSize:9 }} width={110} />
                    <Tooltip content={<Tip />} />
                    <Bar dataKey="value" fill="#00D4FF" radius={3} name="SHAP" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ── Radar ─────────────────────────────────── */}
              <div className="glass-card p-6">
                <div className="font-bold mb-0.5">EDS Radar</div>
                <div className="text-xs mb-2" style={{ color:"rgba(255,255,255,0.4)" }}>Component breakdown</div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill:"rgba(255,255,255,0.5)", fontSize:10 }} />
                    <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill:"rgba(255,255,255,0.3)", fontSize:8 }} />
                    <Radar dataKey="A" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.15} dot={{ fill:"#00D4FF", r:3 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Policy Recommendations ────────────────── */}
            {result.policy?.recommendations && (
              <div className="glass-card p-6">
                <div className="font-bold mb-1">AI Policy Recommendations</div>
                <div className="text-xs mb-5" style={{ color:"rgba(255,255,255,0.4)" }}>Generated by Claude AI · Kaushik Digital EDS Engine</div>
                <div className="space-y-3">
                  {result.policy.recommendations.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{
                      background:"rgba(255,255,255,0.03)", borderLeft:`3px solid ${["#00D4FF","#7B61FF","#00FF88"][i%3]}`
                    }}>
                      <div className="font-semibold text-sm mb-1">{r.action}</div>
                      <div className="text-xs flex flex-wrap gap-x-4 gap-y-1" style={{ color:"rgba(255,255,255,0.5)" }}>
                        <span>📈 {r.impact}</span>
                        <span>⏱ {r.timeline}</span>
                        <span>💰 ₹{r.cost_crore}Cr</span>
                      </div>
                    </div>
                  ))}
                </div>
                {result.policy.policy_message && (
                  <div className="mt-4 p-4 rounded-xl text-sm font-semibold leading-relaxed"
                       style={{ background:"rgba(123,97,255,0.08)", border:"1px solid rgba(123,97,255,0.2)", color:"#B8AAFF" }}>
                    🏛️ "{result.policy.policy_message}"
                  </div>
                )}
              </div>
            )}

            {/* ── Investment ───────────────────────────────── */}
            {result.policy?.investment && (
              <div className="glass-card p-6">
                <div className="font-bold mb-4">Investment Analysis</div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ["Recommended Investment", `₹${result.policy.investment.amount_crore}Cr`, "#00D4FF"],
                    ["Projected ROI",           result.policy.investment.roi,                  "#00FF88"],
                    ["Payback Period",          `${result.policy.investment.payback_years} yrs`,"#FFB547"],
                  ].map(([l, v, c]) => (
                    <div key={l} className="text-center p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${c}20` }}>
                      <div className="text-2xl font-black" style={{ color:c as string }}>{v}</div>
                      <div className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.45)" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
