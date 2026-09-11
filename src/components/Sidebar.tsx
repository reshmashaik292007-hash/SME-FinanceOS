import { NavLink } from "react-router-dom";
import { Home, Users, FileText, Receipt, TrendingUp, Activity, Upload, ChevronDown, LogOut } from "lucide-react";
import { useLang, LANG_LABELS, type Lang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";

type Props = { onImport: () => void };

export default function Sidebar({ onImport }: Props) {
  const { lang, setLang, t } = useLang();
  const { user, logout } = useAuth();

  const navItems = [
    { to: "/dashboard", label: t("home"),      icon: Home },
    { to: "/agents",    label: t("aiTeam"),    icon: Users },
    { to: "/invoices",  label: t("invoices"),  icon: FileText },
    { to: "/expenses",  label: t("expenses"),  icon: Receipt },
    { to: "/cash-flow", label: t("cashFlow"),  icon: TrendingUp },
  ];

  return (
    <aside className="flex flex-col h-full"
      style={{ width: 220, background: "#0a1828", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 34, height: 34, background: "rgba(16,185,129,0.13)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <Activity size={17} color="#10b981" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none" style={{ color: "#e8f0f8" }}>FinPilot</p>
            <p className="text-xs leading-none mt-0.5" style={{ color: "#3d5a78" }}>SME FinanceOS</p>
          </div>
        </div>
        <p className="text-xs mt-3 font-medium truncate" style={{ color: "#7a9ab8" }}>{user?.businessName}</p>
      </div>

      {/* Language selector */}
      <div className="px-3 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <label className="block text-xs font-semibold mb-1.5 px-1" style={{ color: "#3d5a78" }}>Language</label>
        <div className="relative">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
            className="w-full px-3 py-2 rounded-xl text-sm font-medium appearance-none outline-none pr-8 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#e8f0f8" }}>
            {(Object.entries(LANG_LABELS) as [Lang, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ChevronDown size={13} color="#3d5a78" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={({ isActive }) => ({
              color: isActive ? "#10b981" : "#7a9ab8",
              background: isActive ? "rgba(16,185,129,0.1)" : "transparent",
              border: isActive ? "1px solid rgba(16,185,129,0.18)" : "1px solid transparent",
            })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
        <button onClick={onImport}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left mt-1"
          style={{ color: "#06b6d4", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.12)" }}>
          <Upload size={16} />
          {t("importData")}
        </button>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-2">
        <button onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ color: "#3d5a78" }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* AI status */}
      <div className="px-4 pb-5">
        <div className="rounded-xl px-4 py-3 flex items-center gap-2.5"
          style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.14)" }}>
          <span className="inline-block rounded-full shrink-0" style={{ width: 7, height: 7, background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.5)" }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "#e8f0f8" }}>AI Team</p>
            <p className="text-xs" style={{ color: "#3d5a78" }}>Ready to help</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
