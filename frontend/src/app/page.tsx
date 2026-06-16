"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
      r: Math.random()*1.2+0.2, a: Math.random()*0.5+0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,212,255,${p.a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }} />;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background:"#050816", minHeight:"100vh", color:"#fff", fontFamily:"Inter,system-ui,sans-serif", overflowX:"hidden" }}>
      <Particles />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .btn-p{background:linear-gradient(135deg,#00D4FF,#7B61FF);color:#fff;border:none;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;transition:all .3s;text-decoration:none;display:inline-block}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 14px 44px rgba(0,212,255,.32)}
        .btn-g{background:transparent;color:#00D4FF;border:1.5px solid #00D4FF;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:all .3s;text-decoration:none;display:inline-block}
        .btn-g:hover{background:rgba(0,212,255,.08);transform:translateY(-2px)}
        .tag{background:rgba(123,97,255,.12);border:1px solid rgba(123,97,255,.25);border-radius:6px;padding:3px 10px;font-size:11px;color:#7B61FF;font-weight:700;text-transform:uppercase;letter-spacing:1px}
        .fcrd{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:24px;transition:all .3s}
        .fcrd:hover{border-color:rgba(0,212,255,.25);transform:translateY(-4px)}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        @keyframes globePulse{0%,100%{box-shadow:0 0 80px rgba(0,212,255,.2)}50%{box-shadow:0 0 140px rgba(0,212,255,.4)}}
        .float{animation:float 6s ease-in-out infinite}
        .fade-up{animation:fadeUp .8s ease both}
        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important}
          .hero-globe{display:none}
          .feat-grid{grid-template-columns:1fr!important}
          .nav-links{display:none!important}
          .nav-btns{display:none!important}
          .stats-grid{grid-template-columns:repeat(3,1fr)!important}
          .formula-weights{grid-template-columns:repeat(2,1fr)!important}
          h1{font-size:36px!important}
          .hero-section{padding:100px 20px 60px!important}
          .section-pad{padding:60px 20px!important}
          .cta-pad{padding:40px 24px!important}
          .footer-flex{flex-direction:column!important;gap:12px!important;text-align:center!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:64, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", borderBottom:"1px solid rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", background:"rgba(5,8,22,0.9)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#00D4FF,#7B61FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚡</div>
          <div>
            <div style={{ fontSize:14, fontWeight:800 }}>EDI Platform</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:"1.5px", textTransform:"uppercase" }}>by Kaushik Digital</div>
          </div>
        </div>
        <div className="nav-links" style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[["Dashboard","/dashboard"],["Simulator","/dashboard/simulator"]].map(([l,h])=>(
            <Link key={l} href={h} style={{ color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:14, fontWeight:500 }}>{l}</Link>
          ))}
        </div>
        <div className="nav-btns" style={{ display:"flex", gap:10 }}>
          <Link href="/auth/login" className="btn-g" style={{ padding:"8px 18px", fontSize:13 }}>Sign In</Link>
          <Link href="/auth/register" className="btn-p" style={{ padding:"8px 18px", fontSize:13 }}>Get Started</Link>
        </div>
        {/* Mobile menu button */}
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{ display:"none", background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer" }}
          className="mobile-menu-btn">☰</button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position:"fixed", top:64, left:0, right:0, zIndex:99, background:"rgba(5,8,22,0.98)", padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.1)", display:"flex", flexDirection:"column", gap:12 }}>
          <Link href="/dashboard" onClick={()=>setMenuOpen(false)} style={{ color:"#fff", textDecoration:"none", padding:"10px 0", fontSize:15 }}>Dashboard</Link>
          <Link href="/auth/login" onClick={()=>setMenuOpen(false)} style={{ color:"#00D4FF", textDecoration:"none", padding:"10px 0", fontSize:15 }}>Sign In</Link>
          <Link href="/auth/register" onClick={()=>setMenuOpen(false)} className="btn-p" style={{ textAlign:"center", marginTop:8 }}>Get Started</Link>
        </div>
      )}

      {/* HERO */}
      <section className="hero-section" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", padding:"100px 24px 60px", zIndex:1 }}>
        <div style={{ maxWidth:1200, width:"100%", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }} className="hero-grid fade-up">
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
              <span className="tag">AI-Powered</span>
              <span className="tag">UN SDG Aligned</span>
            </div>
            <h1 style={{ fontSize:52, fontWeight:900, lineHeight:1.05, letterSpacing:-2, marginBottom:20 }}>
              Electricity Is More Than Power.{" "}
              <span style={{ background:"linear-gradient(135deg,#00D4FF,#7B61FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                It Is Human Dignity.
              </span>
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,0.55)", lineHeight:1.7, marginBottom:32, maxWidth:480 }}>
              An AI platform that quantifies the true value of energy access — measuring human development, not just carbon credits.
            </p>
            <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:48 }}>
              <Link href="/auth/register" className="btn-p">Get Started Free →</Link>
              <Link href="/dashboard" className="btn-g">Explore Dashboard</Link>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }} className="stats-grid">
              {[["45K+","Villages Analyzed"],["₹2.3T","Economic Impact"],["96.1%","ML Accuracy"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{ fontSize:26, fontWeight:800, color:"#00D4FF" }}>{v}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Globe */}
          <div className="hero-globe float" style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ position:"relative", width:300, height:300 }}>
              <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle at 35% 35%,rgba(0,212,255,0.15),rgba(123,97,255,0.08),transparent 70%)", animation:"globePulse 4s ease-in-out infinite", border:"1px solid rgba(0,212,255,0.2)" }} />
              <svg viewBox="0 0 300 300" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.6 }}>
                {[50,80,110,140,170,200,230,260].map(y=>(
                  <ellipse key={y} cx="150" cy="150" rx={Math.sqrt(Math.max(0,135*135-(y-150)*(y-150)))} ry="5"
                    style={{ transform:`translateY(${y-150}px)`, transformBox:"fill-box" }}
                    fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="0.8" />
                ))}
                {[0,30,60,90,120,150].map(d=>(
                  <ellipse key={d} cx="150" cy="150" rx="5" ry="135" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="0.8" transform={`rotate(${d},150,150)`} />
                ))}
                {[[170,120],[200,145],[155,165],[185,185],[135,135],[210,125],[160,108],[195,160]].map(([cx,cy],i)=>(
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="3" fill="#00FF88" opacity="0.9" />
                    <circle cx={cx} cy={cy} r="7" fill="none" stroke="#00FF88" strokeWidth="1" opacity="0.3">
                      <animate attributeName="r" values="3;11;3" dur={`${2+i*0.3}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur={`${2+i*0.3}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* EDS FORMULA */}
      <section className="section-pad" style={{ padding:"80px 24px", background:"linear-gradient(180deg,transparent,rgba(0,212,255,0.03),transparent)", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:860, margin:"0 auto", textAlign:"center" }}>
          <span className="tag" style={{ marginBottom:16, display:"inline-block" }}>Novel Algorithm</span>
          <h2 style={{ fontSize:36, fontWeight:800, marginBottom:40, letterSpacing:-1 }}>The Energy Dignity Score</h2>
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:20, padding:"36px 32px", textAlign:"left" }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:2, marginBottom:14 }}>EDS Formula — Built by Kaushik Digital</div>
            <div style={{ fontFamily:"monospace", fontSize:15, fontWeight:600, color:"#00D4FF", marginBottom:28, lineHeight:1.7 }}>
              EDS = 0.25(Education) + 0.20(Healthcare) + 0.20(Economic)<br/>
              + 0.15(Women's Empowerment) + 0.10(Digital) + 0.10(Carbon)
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }} className="formula-weights">
              {[["25%","Education","#00D4FF"],["20%","Healthcare","#7B61FF"],["20%","Economic","#00FF88"],["15%","Women's Rights","#FFB547"],["10%","Digital","#FF6B9D"],["10%","Carbon","#64FFDA"]].map(([w,l,c])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:`${c}20`, border:`1px solid ${c}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:c, flexShrink:0 }}>{w}</div>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section-pad" style={{ padding:"80px 24px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <h2 style={{ fontSize:34, fontWeight:800, marginBottom:48, textAlign:"center", letterSpacing:-1 }}>
            Built for <span style={{ color:"#00D4FF" }}>Impact Investors</span>, Policymakers & Researchers
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }} className="feat-grid">
            {[
              { i:"🤖", t:"Village Impact Simulator",     d:"Enter 17 village parameters → get 5-year EDS trajectory and Claude AI policy recommendations.", tag:"AI Powered" },
              { i:"📊", t:"Policy Recommendation Engine", d:"SHAP explainable AI shows exactly which interventions deliver the highest dignity ROI.", tag:"Explainable AI" },
              { i:"🗺️", t:"India Heat Map",               d:"Interactive state-level EDS scores, investment priorities, and development gaps.", tag:"Geospatial" },
              { i:"🧠", t:"96.1% Accurate ML Ensemble",  d:"XGBoost + Random Forest + LightGBM trained on 10,000+ synthetic village records.", tag:"ML Ensemble" },
              { i:"📋", t:"PDF Report Generator",         d:"Professional Kaushik Digital-branded reports with EDS breakdown and policy memos.", tag:"Reports" },
              { i:"🏛️", t:"Role-Based Access Control",    d:"Custom dashboards for Admins, Researchers, Policy Makers, Investors, and Public.", tag:"RBAC" },
            ].map(f=>(
              <div key={f.t} className="fcrd">
                <div style={{ fontSize:32, marginBottom:14 }}>{f.i}</div>
                <span className="tag" style={{ marginBottom:10, display:"inline-block" }}>{f.tag}</span>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{f.t}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"60px 24px", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:620, margin:"0 auto", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:24, padding:"50px 32px" }} className="cta-pad">
          <div style={{ fontSize:44 }}>⚡</div>
          <h2 style={{ fontSize:34, fontWeight:800, margin:"16px 0 14px", letterSpacing:-1 }}>
            Start Measuring <span style={{ color:"#00D4FF" }}>Dignity</span> Today
          </h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:15, marginBottom:32 }}>
            Join researchers, policymakers, and investors using EDI to quantify the true human value of energy access.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/auth/register" className="btn-p">Create Free Account</Link>
            <Link href="/dashboard" className="btn-g">Try Dashboard</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.07)", padding:"24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, position:"relative", zIndex:1 }} className="footer-flex">
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>
          © 2025 Energy Dignity Index · <span style={{ color:"#00D4FF", fontWeight:600 }}>Built by Kaushik Digital</span>
        </div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>Measuring Human Progress Through Energy Access</div>
      </footer>
    </div>
  );
}
