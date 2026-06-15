"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, ROLE_LABELS, isAdmin } from "@/store/authStore";
import { useState } from "react";
import {
  LayoutDashboard, Zap, Map, FileText, Building2,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Shield, Users, Database
} from "lucide-react";

const NAV = [
  { href: "/dashboard",           label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/simulator", label: "Simulator",   icon: Zap },
  { href: "/dashboard/villages",  label: "Villages",    icon: Building2 },
  { href: "/dashboard/map",       label: "India Map",   icon: Map },
  { href: "/dashboard/reports",   label: "Reports",     icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics",   icon: BarChart3 },
];

const ADMIN_NAV = [
  { href: "/dashboard/admin",       label: "Admin Panel", icon: Shield },
  { href: "/dashboard/admin/users", label: "Users",       icon: Users },
  { href: "/dashboard/admin/models",label: "ML Models",   icon: Database },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => { clearAuth(); router.push("/"); };

  return (
    <div className="flex min-h-screen" style={{ background: "#050816" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          width: collapsed ? 68 : 240,
          background: "rgba(5,8,22,0.95)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          inset: "0 auto 0 0",
          zIndex: 50,
          transition: "width 0.3s ease",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)", minHeight: 64 }}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
               style={{ background: "linear-gradient(135deg,#00D4FF,#7B61FF)" }}>⚡</div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold leading-tight">EDI Platform</div>
              <div className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Kaushik Digital</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`nav-item ${active ? "active" : ""}`}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}

          {isAdmin(user?.role) && (
            <>
              <div className="mt-4 mb-1 px-3 text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                {!collapsed && "Admin"}
              </div>
              {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={`nav-item ${active ? "active" : ""}`}
                    title={collapsed ? label : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User + collapse */}
        <div className="p-3 border-t flex flex-col gap-2" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                   style={{ background: "linear-gradient(135deg,#7B61FF,#00D4FF)" }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{user?.name || "User"}</div>
                <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {ROLE_LABELS[user?.role || "public_viewer"]}
                </div>
              </div>
            </div>
          )}
          <button onClick={logout}
            className="nav-item w-full text-left gap-3"
            style={{ color: "#FF4757" }}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && "Logout"}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item w-full justify-center"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div style={{ marginLeft: collapsed ? 68 : 240, flex: 1, transition: "margin 0.3s ease" }}>
        {/* Topbar */}
        <header style={{
          height: 64, position: "sticky", top: 0, zIndex: 40,
          background: "rgba(5,8,22,0.85)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px"
        }}>
          <div>
            <div className="font-bold text-base">
              {NAV.find(n => pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label || "Dashboard"}
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              Energy Dignity Index · Built by Kaushik Digital
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                 style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)", color: "#00FF88" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              ML Active
            </div>
          </div>
        </header>

        <main className="p-7 animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
