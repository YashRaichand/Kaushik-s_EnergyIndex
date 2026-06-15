"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const ROLES = [
  { value:"researcher",    label:"Researcher",    desc:"Academic or NGO researcher" },
  { value:"policy_maker",  label:"Policy Maker",  desc:"Government official or planner" },
  { value:"investor",      label:"Investor",       desc:"Impact investor or fund" },
  { value:"public_viewer", label:"Public Viewer",  desc:"Curious citizen / journalist" },
];

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"researcher", organization:"" });

  const register = useMutation({
    mutationFn: () => authAPI.register(form).then(r => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      toast.success(`Welcome to EDI, ${data.user.name}!`);
      router.push("/dashboard");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Registration failed"),
  });

  return (
    <div style={{ minHeight:"100vh", background:"#050816", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", top:"15%", right:"8%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(123,97,255,0.06),transparent 70%)", pointerEvents:"none" }} />

      <div className="glass-card-glow p-10 w-full max-w-lg animate-fade-up" style={{ margin:"20px" }}>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
               style={{ background:"linear-gradient(135deg,#00D4FF,#7B61FF)" }}>⚡</div>
          <h1 className="text-2xl font-black mb-1">Join EDI Platform</h1>
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.45)" }}>Built by Kaushik Digital · Measuring Human Progress</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label">Full Name</label>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                placeholder="Dr. Priya Sharma" className="input-field" />
            </div>
            <div>
              <label className="section-label">Organization</label>
              <input value={form.organization} onChange={e=>setForm(p=>({...p,organization:e.target.value}))}
                placeholder="IIT Delhi / Govt. of India" className="input-field" />
            </div>
          </div>

          <div>
            <label className="section-label">Email Address</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
              placeholder="you@example.com" className="input-field" />
          </div>

          <div>
            <label className="section-label">Password</label>
            <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}
              placeholder="At least 8 characters" className="input-field" />
          </div>

          <div>
            <label className="section-label">Your Role</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={()=>setForm(p=>({...p,role:r.value}))}
                  className="p-3 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: form.role===r.value ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${form.role===r.value ? "rgba(0,212,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                  }}>
                  <div className="text-sm font-semibold" style={{ color: form.role===r.value ? "#00D4FF" : "#fff" }}>{r.label}</div>
                  <div className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={()=>register.mutate()} disabled={register.isPending || !form.name || !form.email || !form.password}
            className="btn-primary w-full text-sm mt-2">
            {register.isPending ? <><Loader2 size={16} className="animate-spin"/>Creating account…</> : <>Create Account →</>}
          </button>
        </div>

        <p className="text-center text-xs mt-5" style={{ color:"rgba(255,255,255,0.4)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color:"#00D4FF", fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
