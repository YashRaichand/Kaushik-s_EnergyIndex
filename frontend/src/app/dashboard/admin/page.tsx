"use client";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Shield, Users, Database, Activity, FileText, Settings } from "lucide-react";

export default function AdminPage() {
  const { data: statsData } = useQuery({ queryKey:["admin-stats"], queryFn:()=>adminAPI.stats() });
  const { data: modelsData } = useQuery({ queryKey:["model-status"], queryFn:()=>adminAPI.modelStatus() });
  const stats = statsData?.data;
  const models = modelsData?.data?.models || [];

  const AUDIT_LOGS = [
    { action:"User registered",       user:"priya@iitd.ac.in",     time:"2 min ago",  type:"auth"    },
    { action:"Village simulation run", user:"investor@vc.com",      time:"5 min ago",  type:"ml"      },
    { action:"Report generated",       user:"policy@gov.in",        time:"12 min ago", type:"report"  },
    { action:"Model retrained",        user:"admin@kaushikdigital", time:"1 hr ago",   type:"admin"   },
    { action:"Village data uploaded",  user:"research@ngo.org",     time:"2 hr ago",   type:"data"    },
    { action:"User role changed",      user:"admin@kaushikdigital", time:"3 hr ago",   type:"admin"   },
  ];

  const typeColor = (t: string) =>
    ({ auth:"#00D4FF", ml:"#7B61FF", report:"#00FF88", admin:"#FFB547", data:"#FF6B9D" })[t] || "#fff";

  return (
    <div className="space-y-6">
      {/* Admin KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ["Total Users",    stats?.users       || "4,892",   Users,    "#00D4FF"],
          ["Villages in DB", stats?.villages    || "45,892",  Database, "#7B61FF"],
          ["Predictions",    stats?.predictions || "128,450", Activity, "#00FF88"],
          ["Reports",        stats?.reports     || "23,100",  FileText, "#FFB547"],
        ].map(([l,v,Icon,c]:any) => (
          <div key={l} className="glass-card-glow p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background:`${c}18` }}>
              <Icon size={18} color={c} />
            </div>
            <div className="text-3xl font-black" style={{ color:c }}>{typeof v === "number" ? v.toLocaleString("en-IN") : v}</div>
            <div className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ML Models */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={16} color="#00D4FF" />
            <div className="font-bold">ML Model Status</div>
          </div>
          <div className="space-y-3">
            {(models.length ? models : [
              { name:"XGBoost",       status:"active",  accuracy:94.2, r2:0.941, mae:2.3 },
              { name:"Random Forest", status:"active",  accuracy:91.8, r2:0.918, mae:3.1 },
              { name:"LightGBM",      status:"active",  accuracy:93.6, r2:0.934, mae:2.6 },
              { name:"Ensemble",      status:"primary", accuracy:96.1, r2:0.961, mae:1.9 },
            ]).map((m: any) => (
              <div key={m.name} className="flex items-center justify-between p-3 rounded-xl"
                   style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                    R²={m.r2} · MAE={m.mae} · Accuracy≈{m.accuracy}%
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: m.status==="primary"?"#00FF88":"#00D4FF" }} />
                  <span className="text-xs font-semibold capitalize"
                        style={{ color: m.status==="primary"?"#00FF88":"#00D4FF" }}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-ghost w-full mt-4 text-sm gap-2">
            <Settings size={14} /> Retrain Models
          </button>
        </div>

        {/* Audit Logs */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} color="#7B61FF" />
            <div className="font-bold">Audit Logs</div>
          </div>
          <div className="space-y-0">
            {AUDIT_LOGS.map((log, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5"
                   style={{ borderBottom: i < AUDIT_LOGS.length-1 ? "1px solid rgba(255,255,255,0.05)":"none" }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background:typeColor(log.type) }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{log.action}</div>
                  <div className="text-xs mt-0.5 truncate" style={{ color:"rgba(255,255,255,0.4)" }}>{log.user}</div>
                </div>
                <div className="text-xs flex-shrink-0" style={{ color:"rgba(255,255,255,0.3)" }}>{log.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <div className="font-bold mb-4">Admin Quick Actions</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            ["👥 Manage Users",    "#00D4FF"],
            ["🏘️ Upload Dataset",  "#7B61FF"],
            ["🤖 Retrain Models",  "#00FF88"],
            ["📊 Export Analytics","#FFB547"],
          ].map(([label, color]) => (
            <button key={label as string} className="p-4 rounded-xl text-left transition-all duration-200"
              style={{ background:`${color}10`, border:`1px solid ${color}20` }}
              onMouseEnter={e=>(e.currentTarget.style.background=`${color}18`)}
              onMouseLeave={e=>(e.currentTarget.style.background=`${color}10`)}>
              <div className="text-sm font-semibold" style={{ color:color as string }}>{label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
