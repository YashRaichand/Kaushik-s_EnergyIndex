"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsAPI } from "@/lib/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Activity, Users, FileText, Zap } from "lucide-react";

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs" style={{ border:"1px solid rgba(0,212,255,0.2)", minWidth:130 }}>
      <div className="font-bold mb-1.5" style={{ color:"#00D4FF" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color:p.color }}>{p.name}</span>
          <span className="font-bold">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const USAGE = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i+1}`,
  predictions: Math.round(3200 + Math.random() * 2000 + i * 70),
  users: Math.round(120 + Math.random() * 80 + i * 3.5),
}));

const ROLE_DATA = [
  { name:"Researchers",   value:38, color:"#00D4FF" },
  { name:"Policy Makers", value:24, color:"#7B61FF" },
  { name:"Investors",     value:19, color:"#00FF88" },
  { name:"Public",        value:14, color:"#FFB547" },
  { name:"Admins",        value:5,  color:"#FF4757" },
];

export default function AnalyticsPage() {
  const { data: kpiData } = useQuery({ queryKey:["dashboard-kpis"], queryFn:()=>analyticsAPI.dashboard() });
  const kpis = kpiData?.data?.kpis;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          ["Total Predictions", kpis?.total_predictions?.toLocaleString("en-IN") || "1,28,450", Activity, "#00D4FF", "+8.2K today"],
          ["Active Users",      "4,892",  Users,    "#7B61FF", "+12%"],
          ["Reports Generated", "23,100", FileText, "#00FF88", "+890"],
          ["Avg EDS Score",     kpis?.average_eds?.toFixed(1) || "67.4", Zap, "#FFB547", "+3.2 pts"],
        ].map(([label, value, Icon, color, delta]: any) => (
          <div key={label} className="glass-card-glow p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${color}18` }}>
                <Icon size={18} color={color} />
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background:"rgba(0,255,136,0.1)", color:"#00FF88", border:"1px solid rgba(0,255,136,0.2)" }}>
                ↑ {delta}
              </span>
            </div>
            <div className="text-3xl font-black" style={{ color }}>{value}</div>
            <div className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Usage trend */}
        <div className="col-span-2 glass-card p-6">
          <div className="font-bold mb-0.5">Platform Usage — 30 Days</div>
          <div className="text-xs mb-5" style={{ color:"rgba(255,255,255,0.4)" }}>Daily predictions and active users</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={USAGE}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:9 }} interval={4} />
              <YAxis yAxisId="left"  tick={{ fill:"rgba(255,255,255,0.35)", fontSize:9 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill:"rgba(255,255,255,0.35)", fontSize:9 }} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ color:"rgba(255,255,255,0.5)", fontSize:12 }} />
              <Line yAxisId="left"  type="monotone" dataKey="predictions" stroke="#00D4FF" strokeWidth={2} dot={false} name="Predictions" />
              <Line yAxisId="right" type="monotone" dataKey="users"       stroke="#00FF88" strokeWidth={2} dot={false} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Role distribution */}
        <div className="glass-card p-6">
          <div className="font-bold mb-5">Users by Role</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={ROLE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" nameKey="name">
                {ROLE_DATA.map((r, i) => <Cell key={i} fill={r.color} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {ROLE_DATA.map(r => (
              <div key={r.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background:r.color }} />
                  <span className="text-xs" style={{ color:"rgba(255,255,255,0.6)" }}>{r.name}</span>
                </div>
                <span className="text-xs font-bold" style={{ color:r.color }}>{r.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EDS by state */}
      <div className="glass-card p-6">
        <div className="font-bold mb-0.5">EDS Score by State — Top 12</div>
        <div className="text-xs mb-5" style={{ color:"rgba(255,255,255,0.4)" }}>Current average Energy Dignity Score</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={[
            { state:"Kerala", eds:88 }, { state:"TN", eds:81 }, { state:"Karnataka", eds:76 },
            { state:"Maharashtra", eds:74 }, { state:"Gujarat", eds:73 }, { state:"Punjab", eds:71 },
            { state:"Telangana", eds:68 }, { state:"AP", eds:65 }, { state:"Rajasthan", eds:61 },
            { state:"MP", eds:59 }, { state:"Bihar", eds:41 }, { state:"Jharkhand", eds:39 },
          ]}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="state" tick={{ fill:"rgba(255,255,255,0.4)", fontSize:10 }} />
            <YAxis domain={[0,100]} tick={{ fill:"rgba(255,255,255,0.4)", fontSize:10 }} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="eds" name="EDS Score" radius={4}>
              {[88,81,76,74,73,71,68,65,61,59,41,39].map((v, i) => (
                <Cell key={i} fill={v>=75?"#00FF88":v>=60?"#00D4FF":v>=45?"#FFB547":"#FF4757"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Model performance */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name:"XGBoost",        acc:94.2, r2:0.941, mae:2.3, status:"Active" },
          { name:"Random Forest",  acc:91.8, r2:0.918, mae:3.1, status:"Active" },
          { name:"LightGBM",       acc:93.6, r2:0.934, mae:2.6, status:"Active" },
          { name:"Ensemble",       acc:96.1, r2:0.961, mae:1.9, status:"Primary" },
        ].map(m => (
          <div key={m.name} className={m.status==="Primary" ? "glass-card-glow p-5" : "glass-card p-5"}>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-bold">{m.name}</div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background:m.status==="Primary"?"rgba(0,255,136,0.1)":"rgba(0,212,255,0.1)",
                             color:m.status==="Primary"?"#00FF88":"#00D4FF",
                             border:`1px solid ${m.status==="Primary"?"rgba(0,255,136,0.3)":"rgba(0,212,255,0.3)"}` }}>
                {m.status}
              </span>
            </div>
            {[["Accuracy",`${m.acc}%`,"#00D4FF"],["R² Score",m.r2.toFixed(3),"#00FF88"],["MAE",m.mae,"#FFB547"]].map(([l,v,c])=>(
              <div key={l as string} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color:"rgba(255,255,255,0.4)" }}>{l}</span>
                  <span className="font-bold" style={{ color:c as string }}>{v}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
