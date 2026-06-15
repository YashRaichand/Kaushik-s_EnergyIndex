"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Particle Canvas ──────────────────────────────────────────
function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 90 }, () => ({
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
      for (let i = 0; i < pts.length; i++) for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 100) { ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.05*(1-d/100)})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }} />;
}

// ─── Globe ────────────────────────────────────────────────────
function Globe() {
  return (
    <div style={{ position:"relative", width:340, height:340, margin:"0 auto" }}>
      <div style={{
        position:"absolute", inset:0, borderRadius:"50%",
        background:"radial-gradient(circle at 35% 35%, rgba(0,212,255,0.15), rgba(123,97,255,0.08), transparent 70%)",
        boxShadow:"0 0 100px rgba(0,212,255,0.2), inset 0 0 70px rgba(123,97,255,0.1)",
        border:"1px solid rgba(0,212,255,0.18)",
        animation:"globePulse 4s ease-in-out infinite",
      }} />
      <svg viewBox="0 0 340 340" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.65 }}>
        {[50,90,130,170,210,250,290].map(y=>(
          <ellipse key={y} cx="170" cy="170" rx={Math.sqrt(Math.max(0,155*155-(y-170)*(y-170)))} ry="6"
            style={{ transform:`translateY(${y-170}px)`, transformBox:"fill-box" }}
            fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="0.8" />
        ))}
        {[0,30,60,90,120,150].map(d=>(
          <ellipse key={d} cx="170" cy="170" rx="6" ry="155"
            fill="none" stroke="rgba(0,212,255,0.10)" strokeWidth="0.8"
            transform={`rotate(${d},170,170)`} />
        ))}
        {[[195,140],[230,165],[175,185],[205,205],[150,155],[240,140],[180,125],[215,180],[160,205],[250,170],[200,225]].map(([cx,cy],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r="3.5" fill="#00FF88" opacity="0.9" />
            <circle cx={cx} cy={cy} r="8" fill="none" stroke="#00FF88" strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="3;12;3" dur={`${2+i*0.25}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur={`${2+i*0.25}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {/* Power lines */}
        {[[195,140,230,165],[230,165,215,180],[215,180,175,185],[175,185,205,205]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00D4FF" strokeWidth="0.8" opacity="0.4"
            strokeDasharray="4 3">
            <animate attributeName="stroke-dashoffset" values="0;-14" dur="1.5s" repeatCount="indefinite" />
          </line>
        ))}
        <circle cx="170" cy="170" r="158" fill="none" stroke="rgba(0,212,255,0.08)" strokeWidth="2" strokeDasharray="10 5">
          <animateTransform attributeName="transform" type="rotate" values="0 170 170;360 170 170" dur="40s" repeatCount="indefinite" />
        </circle>
      </svg>
      <style>{`@keyframes globePulse{0%,100%{box-shadow:0 0 100px rgba(0,212,255,0.2),inset 0 0 70px rgba(123,97,255,0.1)}50%{box-shadow:0 0 150px rgba(0,212,255,0.38),inset 0 0 90px rgba(123,97,255,0.22)}}`}</style>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background:"#050816", minHeight:"100vh", color:"#fff", fontFamily:"Inter,system-ui,sans-serif", overflow:"hidden" }}>
      <Particles />
      <style>{`
        .btn-p{background:linear-gradient(135deg,#00D4FF,#7B61FF);color:#fff;border:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;transition:all .3s;letter-spacing:.3px}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 14px 44px rgba(0,212,255,.32)}
        .btn-g{background:transparent;color:#00D4FF;border:1.5px solid #00D4FF;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:all .3s}
        .btn-g:hover{background:rgba(0,212,255,.08);transform:translateY(-2px)}
        .tag{background:rgba(123,97,255,.12);border:1px solid rgba(123,97,255,.25);border-radius:6px;padding:3px 10px;font-size:11px;color:#7B61FF;font-weight:700;text-transform:uppercase;letter-spacing:1px}
        .fcrd{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:28px;transition:all .3s;backdrop-filter:blur(20px)}
        .fcrd:hover{border-color:rgba(0,212,255,.25);transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.3)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .fade-up{animation:fadeUp .8s ease both}
        .float{animation:float 7s ease-in-out infinite}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:68, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", borderBottom:"1px solid rgba(255,255,255,0.07)", backdropFilter:"blur(20px)", background:"rgba(5,8,22,0.88)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#00D4FF,#7B61FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⚡</div>
          <div>
            <div style={{ fontSize:15, fontWeight:800 }}>EDI Platform</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:"1.5px", textTransform:"uppercase" }}>by Kaushik Digital</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:28, alignItems:"center" }}>
          {[["Dashboard","/dashboard"],["Simulator","/dashboard/simulator"],["Research","#"],["Docs","#"]].map(([l,h])=>(
            <Link key={l} href={h} style={{ color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:14, fontWeight:500, transition:"color .2s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#00D4FF")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.6)")}>{l}</Link>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/auth/login"><button className="btn-g" style={{ padding:"8px 20px", fontSize:13 }}>Sign In</button></Link>
          <Link href="/auth/register"><button className="btn-p" style={{ padding:"8px 20px", fontSize:13 }}>Get Started</button></Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", paddingTop:68 }}>
        <div style={{ position:"absolute", top:"15%", left:"3%", width:520, height:520, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,255,0.07),transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"8%", right:"3%", width:620, height:620, borderRadius:"50%", background:"radial-gradient(circle,rgba(123,97,255,0.07),transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", maxWidth:1200, width:"100%", padding:"0 40px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }} className="fade-up">
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
              <span className="tag">AI-Powered</span>
              <span className="tag">UN SDG Aligned</span>
              <span style={{ background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:100, padding:"7px 18px", fontSize:13, color:"#00D4FF", fontWeight:600, display:"inline-flex", alignItems:"center", gap:7 }}>⚡ Novel EDS Framework</span>
            </div>
            <h1 style={{ fontSize:58, fontWeight:900, lineHeight:1.05, letterSpacing:-2, marginBottom:24 }}>
              Electricity Is More Than Power.{" "}
              <span style={{ background:"linear-gradient(135deg,#00D4FF,#7B61FF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                It Is Human Dignity.
              </span>
            </h1>
            <p style={{ fontSize:18, color:"rgba(255,255,255,0.55)", lineHeight:1.7, marginBottom:36, maxWidth:500 }}>
              An AI platform that quantifies the true value of energy access — measuring human development, not just carbon credits.
            </p>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:52 }}>
              <Link href="/auth/register"><button className="btn-p">Get Started Free →</button></Link>
              <Link href="/dashboard"><button className="btn-g">Explore Dashboard</button></Link>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
              {[["45,000+","Villages Analyzed"],["₹2.3T","Economic Impact"],["96.1%","ML Accuracy"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{ fontSize:28, fontWeight:800, color:"#00D4FF" }}>{v}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="float"><Globe /></div>
        </div>
      </section>

      {/* EDS FORMULA */}
      <section style={{ padding:"100px 40px", background:"linear-gradient(180deg,transparent,rgba(0,212,255,0.03),transparent)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", textAlign:"center" }}>
          <span className="tag" style={{ marginBottom:16, display:"inline-block" }}>Novel Algorithm</span>
          <h2 style={{ fontSize:42, fontWeight:800, marginBottom:16, letterSpacing:-1 }}>The Energy Dignity Score</h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", marginBottom:56, maxWidth:560, margin:"0 auto 56px" }}>
            A weighted mathematical framework that values the first electricity connection as a measurable human development asset.
          </p>
          <div style={{ maxWidth:820, margin:"0 auto", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:20, backdropFilter:"blur(20px)", padding:"40px 48px", textAlign:"left" }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:2, marginBottom:16 }}>EDS Formula — Built by Kaushik Digital</div>
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:17, fontWeight:600, color:"#00D4FF", marginBottom:32, lineHeight:1.65 }}>
              EDS = 0.25(Education) + 0.20(Healthcare) + 0.20(Economic Growth)<br/>
              {"       "}+ 0.15(Women's Empowerment) + 0.10(Digital Inclusion)<br/>
              {"       "}+ 0.10(Carbon Benefit)
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[["25%","Education","#00D4FF"],["20%","Healthcare","#7B61FF"],["20%","Economic","#00FF88"],["15%","Women's Rights","#FFB547"],["10%","Digital","#FF6B9D"],["10%","Carbon","#64FFDA"]].map(([w,l,c])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:8, background:`${c}20`, border:`1px solid ${c}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:c }}>{w}</div>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"80px 40px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <h2 style={{ fontSize:38, fontWeight:800, marginBottom:56, textAlign:"center", letterSpacing:-1 }}>
            Built for <span style={{ color:"#00D4FF" }}>Impact Investors</span>, Policymakers & Researchers
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {[
              { i:"🤖", t:"Village Impact Simulator",      d:"Enter 17 village parameters → get 5-year EDS trajectory, investment ROI, and Claude AI policy recommendations.",   tag:"AI Powered" },
              { i:"📊", t:"Policy Recommendation Engine",  d:"SHAP explainable AI shows exactly which interventions deliver the highest dignity ROI per crore invested.",          tag:"Explainable AI" },
              { i:"🗺️", t:"India Heat Map",                d:"Interactive state-level visualization of EDS scores, investment priorities, and development gaps across India.",       tag:"Geospatial" },
              { i:"🧠", t:"96.1% Accurate ML Ensemble",   d:"XGBoost + Random Forest + LightGBM ensemble trained on 10,000+ synthetic village records with 17-feature input.",    tag:"ML Ensemble" },
              { i:"📋", t:"PDF Report Generator",          d:"Professional Kaushik Digital-branded reports with EDS breakdown, policy recommendations, and investment memos.",      tag:"Reports" },
              { i:"🏛️", t:"Role-Based Access Control",     d:"Custom dashboards for Admins, Researchers, Policy Makers, Investors, and Public Viewers — each with tailored workflows.", tag:"RBAC" },
            ].map(f=>(
              <div key={f.t} className="fcrd">
                <div style={{ fontSize:36, marginBottom:16 }}>{f.i}</div>
                <span className="tag" style={{ marginBottom:12, display:"inline-block" }}>{f.tag}</span>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10 }}>{f.t}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.65 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 40px", textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(0,212,255,0.2)", borderRadius:24, backdropFilter:"blur(20px)", padding:"60px 48px", boxShadow:"0 0 60px rgba(0,212,255,0.08)" }}>
          <div style={{ fontSize:48 }}>⚡</div>
          <h2 style={{ fontSize:38, fontWeight:800, margin:"20px 0 16px", letterSpacing:-1 }}>
            Start Measuring <span style={{ color:"#00D4FF" }}>Dignity</span> Today
          </h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:16, marginBottom:36 }}>
            Join researchers, policymakers, and investors using EDI to quantify the true human value of energy access.
          </p>
          <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
            <Link href="/auth/register"><button className="btn-p">Create Free Account</button></Link>
            <Link href="/dashboard"><button className="btn-g">Try Dashboard</button></Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.07)", padding:"28px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>
          © 2025 Energy Dignity Index Platform · <span style={{ color:"#00D4FF", fontWeight:600 }}>Built by Kaushik Digital</span>
        </div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>Measuring Human Progress Through Energy Access</div>
      </footer>
    </div>
  );
}
