import { NavLink } from "react-router-dom";
import { Home, Users, Wallet, Upload } from "lucide-react";
import { useLang } from "../context/LangContext";

type Props = { onImport: () => void };

export default function MobileNav({ onImport }: Props) {
  const { t } = useLang();

  const tabs = [
    { to: "/dashboard", label: t("home"),     icon: Home },
    { to: "/agents",    label: "AI Team",      icon: Users },
    { to: "/invoices",  label: t("invoices"),  icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden"
      style={{ background: "#0a1828", borderTop: "1px solid rgba(255,255,255,0.08)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative"
          style={({ isActive }) => ({ color: isActive ? "#10b981" : "#3d5a78" })}>
          {({ isActive }) => (
            <>
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
              {isActive && <span className="absolute bottom-0 rounded-full" style={{ width: 32, height: 2, background: "#10b981" }} />}
            </>
          )}
        </NavLink>
      ))}
      <button onClick={onImport}
        className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
        style={{ color: "#06b6d4" }}>
        <Upload size={20} />
        <span className="text-xs font-medium">Import</span>
      </button>
    </nav>
  );
}
