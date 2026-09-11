import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AlertTriangle, TrendingUp, ChevronRight, Play, Wallet, Clock,
  ArrowUpRight, CheckCircle, ShieldAlert, MessageCircle, Sparkles, Upload, RotateCcw,
  Building2, RefreshCw, Unplug, PenLine,
} from "lucide-react";
import PulseHero from "../components/PulseHero";
import { useData } from "../context/DataContext";
import { useLang } from "../context/LangContext";
import { ImportHistory } from "../components/ImportModal";
import BankConnectModal from "../components/BankConnectModal";

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

type OutletCtx = { openImport: () => void };

export default function Dashboard() {
  const navigate = useNavigate();
  const ctx = useOutletContext<OutletCtx | undefined>();
  const { metrics, pulse, state, dispatch } = useData();
  const { user } = useAuth();
  const { t } = useLang();
  const [bankOpen, setBankOpen] = useState(false);

  const m = metrics;
  const conn = state.bankConnection;

  function handleReset() {
    if (window.confirm("Restore the original demo business data?")) {
      dispatch({ type: "RESET_TO_SEED" });
    }
  }

  function handleDisconnect() {
    if (window.confirm(`Stop using ${conn?.bankName} data?`)) {
      dispatch({ type: "DISCONNECT_BANK" });
    }
  }

  function fmtTime(iso: string) {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1200px] mx-auto">
      {/* Greeting row */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-bold text-xl md:text-2xl mb-0.5" style={{ color: "#e8f0f8", letterSpacing: "-0.02em" }}>
            Good morning, {user?.ownerName?.split(" ")[0]} 👋
          </h1>
          <p className="font-semibold text-base" style={{ color: "#e8f0f8" }}>{user?.businessName}</p>
          <p className="text-sm mt-0.5" style={{ color: "#7a9ab8" }}>Here's how your business is doing today.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ctx?.openImport && (
            <button onClick={ctx.openImport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
              <Upload size={14} /> {t("importBusiness")}
            </button>
          )}
          <button onClick={() => navigate("/agents", { state: { autoRun: true } })}
            className="hidden md:flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
            <Play size={14} fill="white" /> {t("checkWithAI")}
          </button>
        </div>
      </div>

      {/* Bank connection status badge */}
      {conn ? (
        <div className="mb-5 rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <div className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 40, height: 40, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <Building2 size={18} color="#10b981" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-sm" style={{ color: "#e8f0f8" }}>Bank Connected</p>
              <CheckCircle size={13} color="#10b981" />
            </div>
            <p className="text-xs" style={{ color: "#7a9ab8" }}>
              {conn.bankName} · {conn.accountMasked} · Last synced: {fmtTime(conn.connectedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => {}} className="p-2 rounded-xl hover:bg-white/5 transition-colors" title="Refresh">
              <RefreshCw size={14} color="#7a9ab8" />
            </button>
            <button onClick={handleDisconnect} className="p-2 rounded-xl hover:bg-white/5 transition-colors" title="Disconnect">
              <Unplug size={14} color="#7a9ab8" />
            </button>
          </div>
        </div>
      ) : (
        /* Add Financial Data section */
        <div className="mb-5 rounded-2xl p-5" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="font-semibold text-sm mb-1" style={{ color: "#e8f0f8" }}>Add Financial Data</p>
          <p className="text-xs mb-4" style={{ color: "#7a9ab8" }}>Three ways to bring your transactions into FinPilot.</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Building2, label: "Connect Bank", sub: "AA-style, read-only",        color: "#10b981", action: () => setBankOpen(true) },
              { icon: Upload,    label: "Import Excel", sub: "XLSX, XLS or CSV",            color: "#06b6d4", action: () => ctx?.openImport?.() },
              { icon: PenLine,   label: "Enter Manually", sub: "Add invoices & expenses",   color: "#a78bfa", action: () => navigate("/invoices") },
            ].map(({ icon: Icon, label, sub, color, action }) => (
              <button key={label} onClick={action}
                className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-center transition-all hover:scale-[1.03]"
                style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                <div className="flex items-center justify-center rounded-xl"
                  style={{ width: 36, height: 36, background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#e8f0f8" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#3d5a78" }}>{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FinPilot hero — live data */}
      <div className="mb-5">
        <PulseHero
          score={pulse.score}
          status={pulse.status}
          explanation={pulse.explanation}
          factors={pulse.factors}
          metrics={pulse.metrics}
        />
      </div>

      {/* 3 summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: t("cashInBank"),    value: fmt(m.bankBalance),       sub: "In your bank now",  icon: Wallet,      color: "#10b981" },
          { label: t("customersOwe"),  value: fmt(m.overdueTotal),      sub: "Overdue payments",  icon: Clock,       color: "#ef4444" },
          { label: t("upcomingCosts"), value: fmt(m.upcomingExpenses),  sub: "Upcoming bills",    icon: ArrowUpRight, color: "#f59e0b" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-4 md:p-5 fade-in" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 28, height: 28, background: `${c.color}15`, border: `1px solid ${c.color}20` }}>
                <c.icon size={13} color={c.color} />
              </div>
              <p className="text-xs" style={{ color: "#7a9ab8" }}>{c.label}</p>
            </div>
            <p className="number-font font-bold" style={{ fontSize: "clamp(18px, 4vw, 26px)", color: c.color === "#ef4444" ? "#ef4444" : "#e8f0f8", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* What needs attention */}
      <section className="mb-6">
        <h2 className="font-bold text-base mb-1" style={{ color: "#e8f0f8" }}>{t("attention")}</h2>
        <p className="text-sm mb-4" style={{ color: "#7a9ab8" }}>Your AI team spotted these.</p>
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl p-4 md:p-5 fade-in" style={{ background: "#0e1c2e", border: "1px solid rgba(239,68,68,0.15)" }}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center rounded-xl shrink-0 mt-0.5" style={{ width: 38, height: 38, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle size={17} color="#ef4444" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold" style={{ color: "#ef4444" }}>Needs attention</span>
                <p className="font-semibold mb-1 mt-0.5" style={{ color: "#e8f0f8" }}>Customer payments</p>
                <p className="text-sm" style={{ color: "#7a9ab8" }}>
                  {fmt(m.overdueTotal)} is overdue. {state.invoices.filter((i) => i.status === "OVERDUE").slice(0, 2).map((i) => i.customer).join(" and ")} need follow-up.
                </p>
              </div>
              <button onClick={() => navigate("/invoices")}
                className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl shrink-0"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                View <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-4 md:p-5 fade-in" style={{ background: "#0e1c2e", border: "1px solid rgba(245,158,11,0.12)", animationDelay: "0.08s" }}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center rounded-xl shrink-0 mt-0.5" style={{ width: 38, height: 38, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <AlertTriangle size={17} color="#f59e0b" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold" style={{ color: "#f59e0b" }}>Worth reviewing</span>
                <p className="font-semibold mb-1 mt-0.5" style={{ color: "#e8f0f8" }}>Spending</p>
                <p className="text-sm" style={{ color: "#7a9ab8" }}>Software spending went up {m.softwareTrendPct}%. One subscription may not be needed.</p>
              </div>
              <button onClick={() => navigate("/expenses")}
                className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl shrink-0"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                Review <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-4 md:p-5 fade-in" style={{ background: "#0e1c2e", border: "1px solid rgba(16,185,129,0.12)", animationDelay: "0.16s" }}>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center rounded-xl shrink-0 mt-0.5" style={{ width: 38, height: 38, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle size={17} color="#10b981" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold" style={{ color: "#10b981" }}>Looking good</span>
                <p className="font-semibold mb-1 mt-0.5" style={{ color: "#e8f0f8" }}>Profit</p>
                <p className="text-sm" style={{ color: "#7a9ab8" }}>Your business is profitable. Net profit: {fmt(m.netProfit)}</p>
              </div>
              <button onClick={() => navigate("/cash-flow")}
                className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl shrink-0"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)", color: "#10b981" }}>
                Details <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Finance Team */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-base" style={{ color: "#e8f0f8" }}>Your AI Finance Team</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}>Powered by AI</span>
        </div>
        <p className="text-sm mb-4" style={{ color: "#7a9ab8" }}>Four experts checked your business.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Cash Forecast",  sub: "Will you have enough money?",         icon: TrendingUp,   color: "#10b981" },
            { name: "Payment Helper", sub: "Who needs a payment reminder?",        icon: MessageCircle, color: "#06b6d4" },
            { name: "Money Watch",    sub: "Where might you be losing money?",     icon: ShieldAlert,  color: "#f59e0b" },
            { name: "AI Advisor",     sub: "What should you do first?",            icon: Sparkles,     color: "#a78bfa" },
          ].map((a) => (
            <div key={a.name} className="rounded-2xl p-4 flex flex-col gap-2.5" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-center rounded-xl self-start" style={{ width: 36, height: 36, background: `${a.color}12`, border: `1px solid ${a.color}22` }}>
                <a.icon size={16} color={a.color} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#e8f0f8" }}>{a.name}</p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: "#7a9ab8" }}>{a.sub}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block rounded-full" style={{ width: 5, height: 5, background: "#10b981" }} />
                <span className="text-xs" style={{ color: "#3d5a78" }}>Ready</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate("/agents", { state: { autoRun: true } })}
          className="w-full mt-4 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-semibold transition-all hover:scale-[1.01]"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 6px 24px rgba(16,185,129,0.3)" }}>
          <Play size={16} fill="white" /> {t("checkWithAI")}
        </button>
      </section>

      {/* Import history */}
      <ImportHistory />

      {/* Reset demo */}
      <div className="mt-6 flex justify-center">
        <button onClick={handleReset}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl transition-all hover:bg-white/5"
          style={{ color: "#3d5a78", border: "1px solid rgba(255,255,255,0.06)" }}>
          <RotateCcw size={12} /> Reset demo data
        </button>
      </div>

      {bankOpen && (
        <BankConnectModal
          onClose={() => setBankOpen(false)}
          onContinue={() => setBankOpen(false)}
        />
      )}
    </div>
  );
}
