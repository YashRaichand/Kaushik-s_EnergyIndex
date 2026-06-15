"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { reportsAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { FileText, Download, Loader2, CheckCircle, Clock } from "lucide-react";

const REPORT_TYPES = [
  { value:"full_analysis",   label:"Full EDS Analysis",    desc:"Complete village analysis with all components" },
  { value:"executive_summary", label:"Executive Summary",  desc:"2-page brief for leadership" },
  { value:"investment_memo", label:"Investment Memo",       desc:"ROI-focused report for investors" },
  { value:"policy_brief",    label:"Policy Brief",          desc:"Recommendations for policymakers" },
];

const RECENT = [
  { name:"EDS Full Analysis — UP",     date:"Dec 15, 2025", type:"PDF",  status:"ready" },
  { name:"Investment Memo — Koraput",  date:"Dec 12, 2025", type:"PDF",  status:"ready" },
  { name:"Policy Brief Q4 2025",       date:"Nov 28, 2025", type:"PDF",  status:"ready" },
  { name:"National EDS Benchmark",     date:"Nov 20, 2025", type:"CSV",  status:"ready" },
  { name:"Bihar District Analysis",    date:"Nov 10, 2025", type:"PDF",  status:"ready" },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("full_analysis");
  const [region, setRegion] = useState("all_india");
  const [period, setPeriod] = useState("last_12_months");
  const [sections, setSections] = useState({
    eds_methodology: true, ml_results: true, investment: true,
    policy: true, shap: true, heatmap: true,
  });

  const generate = useMutation({
    mutationFn: () => reportsAPI.generate({ report_type: reportType, prediction_id: 1 }).then(r => r.data),
    onSuccess: () => toast.success("Report generated!"),
    onError:   () => toast.error("Generation failed — please try again"),
  });

  const toggleSection = (key: string) =>
    setSections(p => ({ ...p, [key]: !p[key as keyof typeof p] }));

  return (
    <div className="grid grid-cols-5 gap-6" style={{ alignItems:"start" }}>
      {/* ── Config Panel ─────────────────────────────────────── */}
      <div className="col-span-2 space-y-4">
        <div className="glass-card-glow p-6">
          <div className="font-bold mb-1">Generate Report</div>
          <div className="text-xs mb-5" style={{ color:"rgba(255,255,255,0.4)" }}>Professional PDF with Kaushik Digital branding</div>

          {/* Report type */}
          <div className="mb-4">
            <label className="section-label">Report Type</label>
            <div className="space-y-2 mt-1">
              {REPORT_TYPES.map(t => (
                <button key={t.value} onClick={() => setReportType(t.value)}
                  className="w-full text-left p-3 rounded-xl transition-all duration-200"
                  style={{
                    background: reportType === t.value ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${reportType === t.value ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}>
                  <div className="text-sm font-semibold" style={{ color: reportType === t.value ? "#00D4FF" : "#fff" }}>{t.label}</div>
                  <div className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Region & Period */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="section-label">Region</label>
              <select value={region} onChange={e=>setRegion(e.target.value)}
                className="input-field text-sm" style={{ background:"#0a0f1e" }}>
                <option value="all_india">All India</option>
                <option value="state">State Level</option>
                <option value="district">District</option>
                <option value="village">Village</option>
              </select>
            </div>
            <div>
              <label className="section-label">Period</label>
              <select value={period} onChange={e=>setPeriod(e.target.value)}
                className="input-field text-sm" style={{ background:"#0a0f1e" }}>
                <option value="last_12_months">Last 12 months</option>
                <option value="last_3_years">Last 3 years</option>
                <option value="5_year_projection">5-year projection</option>
              </select>
            </div>
          </div>

          {/* Sections */}
          <div className="mb-5">
            <label className="section-label">Include Sections</label>
            <div className="space-y-2 mt-2">
              {[
                ["eds_methodology", "EDS Formula & Methodology"],
                ["ml_results",      "ML Model Results"],
                ["investment",      "Investment Analysis"],
                ["policy",          "Policy Recommendations"],
                ["shap",            "SHAP Explainability"],
                ["heatmap",         "India Heat Map"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer py-1">
                  <input type="checkbox"
                    checked={sections[key as keyof typeof sections]}
                    onChange={() => toggleSection(key)}
                    style={{ accentColor:"#00D4FF", width:14, height:14 }} />
                  <span className="text-sm" style={{ color:"rgba(255,255,255,0.7)" }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => generate.mutate()} disabled={generate.isPending} className="btn-primary text-sm">
              {generate.isPending ? <><Loader2 size={14} className="animate-spin"/>Generating…</> : <><FileText size={14}/>PDF Report</>}
            </button>
            <button className="btn-ghost text-sm gap-2">
              <Download size={14} /> CSV Data
            </button>
          </div>
        </div>

        {/* Recent */}
        <div className="glass-card p-5">
          <div className="font-bold mb-4">Recent Reports</div>
          <div className="space-y-0">
            {RECENT.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-3"
                   style={{ borderBottom: i < RECENT.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color:"rgba(255,255,255,0.4)" }}>
                    {r.status === "ready"
                      ? <CheckCircle size={11} color="#00FF88" />
                      : <Clock size={11} color="#FFB547" />}
                    {r.date} · {r.type}
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ background:"rgba(0,212,255,0.08)", color:"#00D4FF", border:"1px solid rgba(0,212,255,0.15)" }}>
                  ↓
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Report Preview ───────────────────────────────────── */}
      <div className="col-span-3 glass-card overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="font-bold">Report Preview</div>
          <div className="flex items-center gap-2 text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>
            <div className="w-6 h-6 rounded flex items-center justify-center text-sm"
                 style={{ background:"linear-gradient(135deg,#00D4FF,#7B61FF)" }}>⚡</div>
            Kaushik Digital · EDI Platform
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl p-7 space-y-5" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
            {/* Report header */}
            <div className="flex items-start justify-between pb-5" style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color:"#00D4FF" }}>
                  Energy Dignity Index Platform
                </div>
                <div className="text-2xl font-black leading-tight">
                  {REPORT_TYPES.find(t=>t.value===reportType)?.label || "Full EDS Analysis"}
                </div>
                <div className="text-sm mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
                  Prepared by Kaushik Digital · {new Date().toLocaleDateString("en-IN", { month:"long", day:"numeric", year:"numeric" })}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background:"linear-gradient(135deg,#00D4FF,#7B61FF)" }}>⚡</div>
            </div>

            {/* Executive Summary */}
            <div>
              <div className="text-sm font-bold mb-2" style={{ color:"#00D4FF" }}>Executive Summary</div>
              <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,0.6)" }}>
                This report presents the Energy Dignity Score (EDS) analysis powered by Kaushik Digital's novel mathematical framework. The analysis quantifies human development outcomes — education, healthcare, economic growth, women's empowerment, and digital inclusion — as direct measurable outputs of rural electrification across India.
              </p>
            </div>

            {/* KPI summary */}
            <div className="grid grid-cols-3 gap-3">
              {[["Avg EDS","67.4/100","#00D4FF"],["High Impact Zones","12,840","#00FF88"],["Avg ROI Potential","2.8x","#FFB547"]].map(([l,v,c])=>(
                <div key={l} className="text-center p-4 rounded-xl" style={{ background:"rgba(0,212,255,0.05)", border:"1px solid rgba(0,212,255,0.1)" }}>
                  <div className="text-xl font-black" style={{ color:c }}>{v}</div>
                  <div className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>{l}</div>
                </div>
              ))}
            </div>

            {/* EDS Formula */}
            <div>
              <div className="text-sm font-bold mb-2" style={{ color:"#00D4FF" }}>Novel EDS Framework</div>
              <div className="p-4 rounded-xl text-sm font-mono leading-relaxed"
                   style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(0,212,255,0.15)", color:"#00D4FF" }}>
                EDS = 0.25(Education) + 0.20(Healthcare) + 0.20(Economic)<br/>
                {"     "}+ 0.15(Women's Empowerment) + 0.10(Digital) + 0.10(Carbon)
              </div>
            </div>

            {/* Key finding */}
            <div className="p-4 rounded-xl text-sm italic leading-relaxed"
                 style={{ background:"rgba(0,255,136,0.05)", border:"1px solid rgba(0,255,136,0.15)", color:"#00FF88" }}>
              💡 "Investing ₹1 Crore in the 500 lowest-EDS villages yields 4.2x higher dignity ROI than equivalent spending on carbon offsets alone."
            </div>

            {/* Footer */}
            <div className="pt-4 text-center text-xs" style={{ borderTop:"1px solid rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.3)" }}>
              Energy Dignity Index Platform · Built by <strong style={{ color:"rgba(255,255,255,0.5)" }}>Kaushik Digital</strong> · Measuring Human Progress Through Energy Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
