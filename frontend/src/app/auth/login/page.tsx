"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Zap, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const login = useMutation({
    mutationFn: () => authAPI.login(form).then(r => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Invalid credentials"),
  });

  return (
    <div style={{ minHeight:"100vh", background:"#050816", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      {/* Background */}
      <div style={{ position:"absolute", top:"20%", left:"10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,255,0.06),transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"10%", right:"5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(123,97,255,0.06),transparent 70%)", pointerEvents:"none" }} />

      <div className="glass-card-glow p-10 w-full max-w-md animate-fade-up" style={{ margin:"0 20px" }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
               style={{ background:"linear-gradient(135deg,#00D4FF,#7B61FF)" }}>⚡</div>
          <h1 className="text-2xl font-black mb-1">Welcome Back</h1>
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.45)" }}>Energy Dignity Index · Built by Kaushik Digital</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="section-label">Email Address</label>
            <input type="email" value={form.email} placeholder="researcher@example.com"
              onChange={e => setForm(p=>({...p,email:e.target.value}))}
              onKeyDown={e => e.key==="Enter" && login.mutate()}
              className="input-field" />
          </div>
          <div>
            <label className="section-label">Password</label>
            <div className="relative">
              <input type={show?"text":"password"} value={form.password} placeholder="••••••••"
                onChange={e => setForm(p=>({...p,password:e.target.value}))}
                onKeyDown={e => e.key==="Enter" && login.mutate()}
                className="input-field pr-10" />
              <button type="button" onClick={()=>setShow(!show)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)" }}>
                {show ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs" style={{ color:"#00D4FF" }}>Forgot password?</Link>
          </div>

          <button onClick={() => login.mutate()} disabled={login.isPending || !form.email || !form.password}
            className="btn-primary w-full text-sm">
            {login.isPending ? <><Loader2 size={16} className="animate-spin"/>Signing in…</> : <>Sign In →</>}
          </button>

          <div className="relative my-4">
            <div style={{ height:1, background:"rgba(255,255,255,0.08)" }} />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs"
                  style={{ background:"#050816", color:"rgba(255,255,255,0.3)" }}>or</span>
          </div>

          {/* Demo login */}
          <button onClick={() => { setForm({ email:"demo@kaushikdigital.com", password:"demo123" }); }}
            className="btn-ghost w-full text-sm">
            Use Demo Account
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color:"rgba(255,255,255,0.4)" }}>
          New to EDI?{" "}
          <Link href="/auth/register" style={{ color:"#00D4FF", fontWeight:600 }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
