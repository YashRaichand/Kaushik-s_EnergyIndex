"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const ROLES = [
  { value:"researcher",    label:"Researcher",    desc:"Academic or NGO researcher" },
  { value:"policy_maker",  label:"Policy Maker",  desc:"Government official or planner" },
  { value:"investor",      label:"Investor",       desc:"Impact investor or fund" },
  { value:"public_viewer", label:"Public Viewer",  desc:"Curious citizen / journalist" },
];

const API = "https://kaushik-s-energyindex.onrender.com/api/v1";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"researcher", organization:"" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all required fields"); return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "Registration failed"); return;
      }
      localStorage.setItem("edi_token", data.access_token);
      localStorage.setItem("edi_user", JSON.stringify(data.user));
      toast.success(`Welcome to EDI, ${data.user.name}! 🎉`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error("Cannot reach server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#050816", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", fontFamily:"Inter,system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        input{background:rgba(255,255,255,0.05)!important;border:1px solid rgba(255,255,255,0.12)!important;border-radius:10px!important;padding:12px 14px!important;color:#fff!important;font-size:14px!important;width:100%!important;outline:none!important;font-family:inherit!important}
        input:focus{border-color:#00D4FF!important}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:480px){.form-grid{grid-template-columns:1fr!important}}
      `}</style>

      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:20, backdropFilter:"blur(20px)", padding:"32px 28px", width:"100%", maxWidth:480, boxShadow:"0 0 60px rgba(0,212,255,0.08)" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#00D4FF,#7B61FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 14px" }}>⚡</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#fff", margin:0 }}>Join EDI Platform</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:5 }}>Built by Kaushik Digital</p>
        </div>

        {/* Name + Org */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }} className="form-grid">
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Full Name *</div>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Your Name" />
          </div>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Organization</div>
            <input value={form.organization} onChange={e=>setForm(p=>({...p,organization:e.target.value}))} placeholder="IIT Delhi" />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Email Address *</div>
          <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="you@example.com" />
        </div>

        {/* Password */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Password *</div>
          <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Min 6 characters"
            onKeyDown={e=>e.key==="Enter"&&handleRegister()} />
        </div>

        {/* Role */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Your Role</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {ROLES.map(r => (
              <button key={r.value} type="button" onClick={()=>setForm(p=>({...p,role:r.value}))}
                style={{ padding:"10px 12px", borderRadius:10, textAlign:"left", cursor:"pointer", transition:"all 0.2s", border:"none",
                  background: form.role===r.value ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.04)",
                  outline: form.role===r.value ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize:13, fontWeight:600, color: form.role===r.value ? "#00D4FF" : "#fff" }}>{r.label}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleRegister} disabled={loading}
          style={{ width:"100%", background:"linear-gradient(135deg,#00D4FF,#7B61FF)", color:"#fff", border:"none", borderRadius:12, padding:"14px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {loading
            ? <><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />Creating account…</>
            : "Create Account →"}
        </button>

        <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:18 }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color:"#00D4FF", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
