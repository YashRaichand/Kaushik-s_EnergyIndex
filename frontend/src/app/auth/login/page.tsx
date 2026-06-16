"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const API = "https://kaushik-s-energyindex.onrender.com/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ email:"", password:"" });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) { toast.error("Enter email and password"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.detail || "Invalid credentials"); return; }
      localStorage.setItem("edi_token", data.access_token);
      localStorage.setItem("edi_user", JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
    } catch {
      toast.error("Cannot reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#050816", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", fontFamily:"Inter,system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        .inp{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;color:#fff;font-size:14px;width:100%;outline:none;font-family:inherit}
        .inp:focus{border-color:#00D4FF}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:20, backdropFilter:"blur(20px)", padding:"36px 28px", width:"100%", maxWidth:400, boxShadow:"0 0 60px rgba(0,212,255,0.08)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#00D4FF,#7B61FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 14px" }}>⚡</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#fff", margin:0 }}>Welcome Back</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:5 }}>Energy Dignity Index · Kaushik Digital</p>
        </div>

        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Email Address</div>
          <input className="inp" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
            placeholder="you@example.com" onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
        </div>

        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Password</div>
          <div style={{ position:"relative" }}>
            <input className="inp" type={show?"text":"password"} value={form.password}
              onChange={e=>setForm(p=>({...p,password:e.target.value}))}
              placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              style={{ paddingRight:44 }} />
            <button type="button" onClick={()=>setShow(!show)}
              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:14 }}>
              {show ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div style={{ textAlign:"right", marginBottom:24 }}>
          <Link href="/auth/forgot-password" style={{ fontSize:12, color:"#00D4FF", textDecoration:"none" }}>Forgot password?</Link>
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width:"100%", background:"linear-gradient(135deg,#00D4FF,#7B61FF)", color:"#fff", border:"none", borderRadius:12, padding:"14px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:12 }}>
          {loading
            ? <><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />Signing in…</>
            : "Sign In →"}
        </button>

        <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)" }}>
          New to EDI?{" "}
          <Link href="/auth/register" style={{ color:"#00D4FF", fontWeight:600, textDecoration:"none" }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
