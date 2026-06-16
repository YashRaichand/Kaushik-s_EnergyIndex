"use client";
import { useState } from "react";
import { edsColor } from "@/types";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const STATES = [
  { id:"KL", name:"Kerala",       x:162, y:222, r:12, eds:88, villages:1247 },
  { id:"TN", name:"Tamil Nadu",   x:177, y:215, r:13, eds:81, villages:2134 },
  { id:"KA", name:"Karnataka",    x:163, y:198, r:14, eds:76, villages:2890 },
  { id:"MH", name:"Maharashtra",  x:155, y:170, r:17, eds:74, villages:3421 },
  { id:"GJ", name:"Gujarat",      x:130, y:155, r:15, eds:73, villages:1876 },
  { id:"PB", name:"Punjab",       x:160, y:100, r:11, eds:71, villages:987  },
  { id:"TS", name:"Telangana",    x:178, y:178, r:12, eds:68, villages:1654 },
  { id:"AP", name:"AP",           x:188, y:188, r:14, eds:65, villages:2341 },
  { id:"RJ", name:"Rajasthan",    x:140, y:128, r:17, eds:61, villages:3987 },
  { id:"MP", name:"MP",           x:172, y:148, r:17, eds:59, villages:4532 },
  { id:"WB", name:"West Bengal",  x:234, y:140, r:12, eds:53, villages:2765 },
  { id:"OD", name:"Odisha",       x:218, y:158, r:13, eds:54, villages:3102 },
  { id:"UP", name:"UP",           x:185, y:120, r:18, eds:48, villages:6234 },
  { id:"JH", name:"Jharkhand",    x:218, y:142, r:11, eds:39, villages:2198 },
  { id:"BR", name:"Bihar",        x:223, y:125, r:14, eds:41, villages:4123 },
  { id:"UK", name:"Uttarakhand",  x:170, y:108, r:10, eds:62, villages:543  },
  { id:"HR", name:"Haryana",      x:167, y:110, r:10, eds:74, villages:769  },
];

export default function MapPage() {
  const [selected, setSelected] = useState<typeof STATES[0] | null>(null);
  const [hovered, setHovered]   = useState<string | null>(null);

  const radarData = selected ? [
    { subject:"Education",  A: selected.eds * 0.92 },
    { subject:"Healthcare", A: selected.eds * 0.80 },
    { subject:"Economic",   A: selected.eds * 1.00 },
    { subject:"Women",      A: selected.eds * 0.72 },
    { subject:"Digital",    A: selected.eds * 0.65 },
    { subject:"Carbon",     A: selected.eds * 0.75 },
  ] : [];

  return (
    <div className="grid grid-cols-5 gap-6" style={{ alignItems:"start" }}>
      {/* ── Map ───────────────────────────────────────────────── */}
      <div className="col-span-3 glass-card p-6">
        <div className="font-bold mb-0.5">India Energy Dignity Map</div>
        <div className="text-xs mb-5" style={{ color:"rgba(255,255,255,0.4)" }}>Click a state bubble to view EDS breakdown</div>

        <svg viewBox="100 75 200 175" style={{ width:"100%", height:380 }}>
          {/* India silhouette */}
          <path d="M150,80 L175,82 L200,85 L225,90 L242,102 L247,116 L241,130 L252,147 L249,168 L241,183 L226,197 L205,218 L190,232 L175,236 L163,228 L154,214 L146,199 L138,184 L130,169 L127,153 L130,140 L124,126 L130,110 L138,95 Z"
            fill="rgba(0,212,255,0.03)" stroke="rgba(0,212,255,0.12)" strokeWidth="1" />

          {/* State bubbles */}
          {STATES.map(s => {
            const isHov = hovered === s.id;
            const isSel = selected?.id === s.id;
            return (
              <g key={s.id}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(isSel ? null : s)}
                style={{ cursor:"pointer" }}>
                {/* Pulse ring for critical states */}
                {s.eds < 50 && (
                  <circle cx={s.x} cy={s.y} r={s.r + 4} fill="none" stroke="#FF4757" strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values={`${s.r+2};${s.r+8};${s.r+2}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Selection ring */}
                {isSel && (
                  <circle cx={s.x} cy={s.y} r={s.r + 5} fill="none"
                    stroke={edsColor(s.eds)} strokeWidth="2" strokeDasharray="4 2" opacity="0.8">
                    <animateTransform attributeName="transform" type="rotate"
                      values={`0 ${s.x} ${s.y};360 ${s.x} ${s.y}`} dur="4s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Main bubble */}
                <circle cx={s.x} cy={s.y} r={s.r}
                  fill={edsColor(s.eds)}
                  opacity={isHov || isSel ? 0.92 : 0.58}
                  style={{
                    filter: isHov || isSel ? `drop-shadow(0 0 10px ${edsColor(s.eds)})` : "none",
                    transition:"all 0.2s"
                  }} />
                {/* Label */}
                <text x={s.x} y={s.y + 1} textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize:6, fill:"#fff", fontWeight:700, pointerEvents:"none", userSelect:"none" }}>
                  {s.id}
                </text>
                {/* Tooltip on hover */}
                {isHov && !isSel && (
                  <g>
                    <rect x={s.x + s.r + 2} y={s.y - 16} width={78} height={32} rx="4"
                      fill="#0d1117" stroke={edsColor(s.eds)} strokeWidth="0.8" opacity="0.97" />
                    <text x={s.x + s.r + 7} y={s.y - 6} style={{ fontSize:8, fill:"#fff", fontWeight:700 }}>{s.name}</text>
                    <text x={s.x + s.r + 7} y={s.y + 5} style={{ fontSize:7, fill:edsColor(s.eds) }}>
                      EDS: {s.eds}/100 · {s.villages.toLocaleString()} villages
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex gap-5 justify-center mt-2 flex-wrap">
          {[["High (>75)","#00FF88"],["Good (60-75)","#00D4FF"],["Moderate (45-60)","#FFB547"],["Low (<45)","#FF4757"]].map(([l,c])=>(
            <div key={l} className="flex items-center gap-1.5 text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background:c }} />{l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail Panel ──────────────────────────────────────── */}
      <div className="col-span-2 space-y-4">
        {selected ? (
          <>
            <div className="glass-card-glow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xl font-black">{selected.name}</div>
                  <div className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
                    {selected.villages.toLocaleString()} villages analyzed
                  </div>
                </div>
                <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:18 }}>✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  ["EDS Score", `${selected.eds}/100`, edsColor(selected.eds)],
                  ["Priority",  selected.eds < 50 ? "Critical" : selected.eds < 65 ? "High" : "Medium",
                                selected.eds < 50 ? "#FF4757" : selected.eds < 65 ? "#FFB547" : "#00D4FF"],
                ].map(([l,v,c])=>(
                  <div key={l} className="text-center p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.04)" }}>
                    <div className="text-2xl font-black" style={{ color:c }}>{v}</div>
                    <div className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl text-sm" style={{ background:"rgba(0,212,255,0.05)", border:"1px solid rgba(0,212,255,0.12)", color:"rgba(255,255,255,0.7)" }}>
                💡 Estimated investment needed: <strong style={{ color:"#00FF88" }}>₹{Math.round((100-selected.eds)*0.8)}Cr</strong> for 3x dignity ROI
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="font-bold mb-4">Component Radar</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill:"rgba(255,255,255,0.5)", fontSize:10 }} />
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill:"rgba(255,255,255,0.3)", fontSize:8 }} />
                  <Radar dataKey="A" stroke={edsColor(selected.eds)} fill={edsColor(selected.eds)} fillOpacity={0.15}
                    dot={{ fill:edsColor(selected.eds), r:3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <>
            <div className="glass-card p-6 text-center" style={{ minHeight:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div className="text-4xl mb-3">🗺️</div>
              <div className="font-semibold mb-1">Select a State</div>
              <div className="text-sm" style={{ color:"rgba(255,255,255,0.4)" }}>Click any bubble on the map to view detailed EDS breakdown</div>
            </div>

            <div className="glass-card p-6">
              <div className="font-bold mb-4">National Summary</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["States Analyzed", "17", "#00D4FF"],
                  ["Critical States",  STATES.filter(s=>s.eds<50).length.toString(), "#FF4757"],
                  ["On Track",         STATES.filter(s=>s.eds>=70).length.toString(), "#00FF88"],
                  ["Avg EDS",          Math.round(STATES.reduce((s,v)=>s+v.eds,0)/STATES.length).toString(), "#FFB547"],
                ].map(([l,v,c])=>(
                  <div key={l} className="text-center p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${c}18` }}>
                    <div className="text-2xl font-black" style={{ color:c }}>{v}</div>
                    <div className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="font-bold mb-3 text-sm">States Needing Urgent Action</div>
              {STATES.filter(s=>s.eds<50).sort((a,b)=>a.eds-b.eds).map(s=>(
                <div key={s.id} className="flex items-center justify-between py-2" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>{s.villages.toLocaleString()} villages</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black" style={{ color:"#FF4757" }}>{s.eds}</div>
                    <div className="text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>/100</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
