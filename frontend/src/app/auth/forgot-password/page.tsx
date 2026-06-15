"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const reset = useMutation({
    mutationFn: () => api.post("/auth/forgot-password", { email }),
    onSuccess: () => { setSent(true); toast.success("Reset link sent!"); },
    onError: () => toast.error("Email not found"),
  });

  return (
    <div style={{ minHeight:"100vh", background:"#050816", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ position:"absolute", top:"20%", right:"10%", width:400, height:400, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(123,97,255,0.07),transparent 70%)", pointerEvents:"none" }} />
      <div className="glass-card-glow p-10 w-full max-w-md animate-fade-up" style={{ margin:"0 20px" }}>
        <Link href="/auth/login" className="flex items-center gap-2 text-sm mb-6" style={{ color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                   style={{ background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.2)" }}>
                <Mail size={24} color="#00D4FF" />
              </div>
              <h1 className="text-2xl font-black mb-1">Reset Password</h1>
              <p className="text-sm" style={{ color:"rgba(255,255,255,0.45)" }}>
                Enter your email and we'll send a reset link
              </p>
            </div>
            <div className="mb-4">
              <label className="section-label">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com" className="input-field"
                onKeyDown={e=>e.key==="Enter"&&email&&reset.mutate()} />
            </div>
            <button onClick={()=>reset.mutate()} disabled={reset.isPending||!email}
              className="btn-primary w-full text-sm">
              {reset.isPending ? <><Loader2 size={14} className="animate-spin"/>Sending…</> : "Send Reset Link →"}
            </button>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-black mb-2">Check Your Email</h2>
            <p className="text-sm mb-6" style={{ color:"rgba(255,255,255,0.5)" }}>
              We sent a reset link to <strong style={{ color:"#00D4FF" }}>{email}</strong>
            </p>
            <Link href="/auth/login"><button className="btn-primary text-sm">Back to Login</button></Link>
          </div>
        )}
        <p className="text-center text-xs mt-5" style={{ color:"rgba(255,255,255,0.3)" }}>
          Built by <strong style={{ color:"#00D4FF" }}>Kaushik Digital</strong>
        </p>
      </div>
    </div>
  );
}
