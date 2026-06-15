"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { villagesAPI } from "@/lib/api";
import { edsColor, priorityBadge } from "@/types";
import Link from "next/link";
import { Search, Plus, Download, Filter } from "lucide-react";

const MOCK = [
  { id:1, name:"Rampur Khas",  state:"UP",          population:2840, electricity_access_pct:42, eds_score:71, priority:"High",     roi:"3.2x" },
  { id:2, name:"Sundarpada",   state:"Odisha",      population:1620, electricity_access_pct:24, eds_score:48, priority:"Critical", roi:"4.8x" },
  { id:3, name:"Navapur",      state:"Maharashtra", population:3200, electricity_access_pct:88, eds_score:83, priority:"Medium",   roi:"1.9x" },
  { id:4, name:"Chhatarpur",   state:"MP",          population:1980, electricity_access_pct:55, eds_score:55, priority:"High",     roi:"3.7x" },
  { id:5, name:"Bhimtal",      state:"Uttarakhand", population:4100, electricity_access_pct:76, eds_score:76, priority:"Medium",   roi:"2.3x" },
  { id:6, name:"Koraput",      state:"Odisha",      population:1340, electricity_access_pct:18, eds_score:39, priority:"Critical", roi:"5.6x" },
  { id:7, name:"Jaganpur",     state:"Bihar",       population:2260, electricity_access_pct:31, eds_score:44, priority:"Critical", roi:"4.2x" },
  { id:8, name:"Vadnagar",     state:"Gujarat",     population:5100, electricity_access_pct:94, eds_score:88, priority:"Low",      roi:"1.4x" },
  { id:9, name:"Kalahandi",    state:"Odisha",      population:1890, electricity_access_pct:29, eds_score:43, priority:"Critical", roi:"5.1x" },
  { id:10,name:"Bundi",        state:"Rajasthan",   population:2540, electricity_access_pct:61, eds_score:62, priority:"High",     roi:"2.9x" },
];

export default function VillagesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = MOCK.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.state.toLowerCase().includes(search.toLowerCase())
  ).filter(v => filter === "all" || v.priority.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.4)" }} />
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search villages, states…"
              className="input-field pl-9 w-72" />
          </div>
          <select value={filter} onChange={e=>setFilter(e.target.value)}
            className="input-field w-40" style={{ background:"#0a0f1e" }}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-sm gap-2 px-4 py-2.5"><Download size={14}/> Export CSV</button>
          <button className="btn-primary text-sm gap-2 px-4 py-2.5"><Plus size={14}/> Add Village</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ["Total Villages", MOCK.length, "#00D4FF"],
          ["Critical Priority", MOCK.filter(v=>v.priority==="Critical").length, "#FF4757"],
          ["High Priority",     MOCK.filter(v=>v.priority==="High").length,     "#FFB547"],
          ["Avg EDS",           (MOCK.reduce((s,v)=>s+v.eds_score,0)/MOCK.length).toFixed(1), "#00FF88"],
        ].map(([l,v,c])=>(
          <div key={l as string} className="glass-card p-4">
            <div className="text-2xl font-black" style={{color:c as string}}>{v}</div>
            <div className="text-xs mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="edi-table w-full">
          <thead>
            <tr>
              {["Village","State","Population","Elec. Access","EDS Score","Priority","Proj. ROI","Actions"].map(h=>(
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(v=>(
              <tr key={v.id}>
                <td className="font-semibold">{v.name}</td>
                <td style={{color:"rgba(255,255,255,0.5)"}}>{v.state}</td>
                <td>{v.population.toLocaleString("en-IN")}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-12">
                      <div className="progress-fill" style={{width:`${v.electricity_access_pct}%`,background:"#7B61FF"}}/>
                    </div>
                    <span className="text-xs" style={{color:"rgba(255,255,255,0.6)"}}>{v.electricity_access_pct}%</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-14">
                      <div className="progress-fill" style={{width:`${v.eds_score}%`,background:edsColor(v.eds_score)}}/>
                    </div>
                    <span className="font-bold text-xs" style={{color:edsColor(v.eds_score)}}>{v.eds_score}</span>
                  </div>
                </td>
                <td><span className={priorityBadge(v.priority)}>{v.priority}</span></td>
                <td className="font-bold" style={{color:"#00FF88"}}>{v.roi}</td>
                <td>
                  <div className="flex gap-2">
                    <Link href="/dashboard/simulator"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{background:"rgba(0,212,255,0.1)",color:"#00D4FF",border:"1px solid rgba(0,212,255,0.2)"}}>
                      Analyze
                    </Link>
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{background:"rgba(123,97,255,0.1)",color:"#7B61FF",border:"1px solid rgba(123,97,255,0.2)"}}>
                      Report
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{color:"rgba(255,255,255,0.4)"}}>
            No villages found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
