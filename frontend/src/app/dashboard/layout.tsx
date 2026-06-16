"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Zap, Map, FileText, Building2,
  BarChart3, LogOut, ChevronLeft, ChevronRight,
  Shield, Menu, X
} from "lucide-react";

const NAV = [
  { href: "/dashboard",           label: "Overview",  icon: LayoutDashboard },
  { href: "/dashboard/simulator", label: "Simulator", icon: Zap },
  { href: "/dashboard/villages",  label: "Villages",  icon: Building2 },
  { href: "/dashboard/map",       label: "India Map", icon: Map },
  { href: "/dashboard/reports",   label: "Reports",   icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("edi_user");
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem("edi_token");
    localStorage.removeItem("edi_user");
    router.push("/");
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding:"16px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10, minHeight:64 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#00D4FF,#7B61FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>⚡</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>EDI Platform</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:"1.5px", textTransform:"uppercase" }}>Kaushik Digital</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"12px", display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10,
                background: active ? "rgba(0,212,255,0.12)" : "transparent",
                border: active ? "1px solid rgba(0,212,255,0.25)" : "1px solid transparent",
                color: active ? "#00D4FF" : "rgba(255,255,255,0.55)",
                textDecoration:"none", fontSize:14, fontWeight: active ? 600 : 400, transition:"all 0.2s" }}>
              <Icon size={18} style={{ flexShrink:0 }} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding:"12px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        {!collapsed && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7B61FF,#00D4FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>
              {(user?.name || "U")[0].toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name || "User"}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.role?.replace("_"," ") || "Public Viewer"}</div>
            </div>
          </div>
        )}
        <button onClick={logout} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"8px 12px", borderRadius:10, background:"none", border:"none", cursor:"pointer", color:"#FF4757", fontSize:13, fontWeight:600 }}>
          <LogOut size={16} />
          {!collapsed && "Logout"}
        </button>
        {/* Collapse button - desktop only */}
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%", padding:"6px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", color:"rgba(255,255,255,0.4)", marginTop:6 }}>
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>
    </>
  );

  const currentPage = NAV.find(n => pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href)));

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#050816", fontFamily:"Inter,system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:2px}
        .desktop-sidebar{display:flex!important}
        .mobile-header{display:none!important}
        .mobile-overlay{display:none}
        .bottom-nav{display:none!important}
        @media(max-width:768px){
          .desktop-sidebar{display:none!important}
          .mobile-header{display:flex!important}
          .main-content{margin-left:0!important;padding-bottom:80px!important}
          .bottom-nav{display:flex!important}
          .mobile-overlay{display:block}
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────── */}
      <aside className="desktop-sidebar" style={{
        width: collapsed ? 64 : 230,
        background:"rgba(5,8,22,0.97)",
        borderRight:"1px solid rgba(255,255,255,0.07)",
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, left:0, bottom:0, zIndex:50,
        transition:"width 0.3s ease",
      }}>
        <SidebarContent />
      </aside>

      {/* ── MOBILE HEADER ───────────────────────────────────── */}
      <header className="mobile-header" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:60,
        height:56, background:"rgba(5,8,22,0.97)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 16px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#00D4FF,#7B61FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
          <div style={{ fontSize:13, fontWeight:800, color:"#fff" }}>EDI Platform</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{currentPage?.label || "Dashboard"}</div>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px", cursor:"pointer", color:"#fff", display:"flex" }}>
            {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </header>

      {/* ── MOBILE SLIDE-IN MENU ─────────────────────────────── */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:70 }} />
          <aside style={{
            position:"fixed", top:0, left:0, bottom:0, width:220, zIndex:80,
            background:"rgba(5,8,22,0.99)", borderRight:"1px solid rgba(255,255,255,0.1)",
            display:"flex", flexDirection:"column",
          }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="main-content" style={{
        marginLeft: collapsed ? 64 : 230,
        flex:1, minHeight:"100vh",
        transition:"margin-left 0.3s ease",
      }}>
        {/* Desktop topbar */}
        <header style={{
          height:60, position:"sticky", top:0, zIndex:40,
          background:"rgba(5,8,22,0.9)", backdropFilter:"blur(20px)",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 24px",
        }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#fff" }}>{currentPage?.label || "Dashboard"}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Energy Dignity Index · Built by Kaushik Digital</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(0,255,136,0.08)", border:"1px solid rgba(0,255,136,0.2)", borderRadius:20, padding:"5px 12px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#00FF88", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:11, color:"#00FF88", fontWeight:600 }}>ML Active</span>
          </div>
        </header>

        <main style={{ padding:"24px", animation:"fadeUp 0.4s ease" }}>
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────────── */}
      <nav className="bottom-nav" style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:50,
        background:"rgba(5,8,22,0.98)", borderTop:"1px solid rgba(255,255,255,0.1)",
        display:"flex", alignItems:"center", justifyContent:"space-around",
        height:65, padding:"0 4px",
      }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 8px", borderRadius:10, textDecoration:"none",
                color: active ? "#00D4FF" : "rgba(255,255,255,0.4)",
                background: active ? "rgba(0,212,255,0.08)" : "transparent",
                flex:1, minWidth:0 }}>
              <Icon size={20} />
              <span style={{ fontSize:9, fontWeight: active ? 700 : 400, textAlign:"center" }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
