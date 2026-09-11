import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, FileSpreadsheet, PenLine, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import BankConnectModal from "../components/BankConnectModal";

export default function Onboarding() {
  const { user, setOnboarded } = useAuth();
  const navigate = useNavigate();
  const [bankModal, setBankModal] = useState(false);

  function goToDashboard() {
    setOnboarded();
    navigate("/dashboard");
  }

  const options = [
    {
      icon: Building2,
      color: "#10b981",
      badge: "Recommended",
      title: "Connect your bank",
      desc: "Automatically bring in your business transactions and balance.",
      btn: "Connect Bank",
      onClick: () => setBankModal(true),
    },
    {
      icon: FileSpreadsheet,
      color: "#06b6d4",
      badge: "XLSX • XLS • CSV",
      title: "Import your data",
      desc: "Upload your Excel or CSV file containing transactions, invoices or expenses.",
      btn: "Import Data",
      onClick: () => { setOnboarded(); navigate("/dashboard"); },
    },
    {
      icon: PenLine,
      color: "#a78bfa",
      badge: null,
      title: "Enter data manually",
      desc: "Add invoices and expenses yourself, one at a time.",
      btn: "Add Data",
      onClick: () => { setOnboarded(); navigate("/invoices"); },
    },
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: "linear-gradient(160deg, #040d18 0%, #071020 60%, #071820 100%)" }}>

        {/* Header */}
        <div className="text-center mb-8 max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center rounded-2xl"
              style={{ width: 44, height: 44, background: "rgba(16,185,129,0.13)", border: "1px solid rgba(16,185,129,0.28)" }}>
              <Sparkles size={20} color="#10b981" />
            </div>
          </div>
          <h1 className="font-bold text-2xl mb-2" style={{ color: "#e8f0f8", letterSpacing: "-0.02em" }}>
            Welcome to FinPilot 👋
          </h1>
          {user && (
            <div className="mb-3">
              <p className="font-semibold" style={{ color: "#e8f0f8" }}>{user.businessName}</p>
              <p className="text-sm" style={{ color: "#7a9ab8" }}>{user.ownerName}</p>
            </div>
          )}
          <p className="font-semibold text-base mb-1" style={{ color: "#e8f0f8" }}>
            Let's connect your financial information.
          </p>
          <p className="text-sm" style={{ color: "#7a9ab8" }}>
            You can start with whatever data you already have.
          </p>
        </div>

        {/* Options */}
        <div className="w-full max-w-md flex flex-col gap-3">
          {options.map((opt) => (
            <div key={opt.title} className="rounded-3xl p-5"
              style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center rounded-2xl shrink-0 mt-0.5"
                  style={{ width: 46, height: 46, background: `${opt.color}14`, border: `1px solid ${opt.color}22` }}>
                  <opt.icon size={22} color={opt.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: "#e8f0f8" }}>{opt.title}</p>
                    {opt.badge && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                        style={{ background: `${opt.color}14`, color: opt.color, border: `1px solid ${opt.color}22` }}>
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-3 leading-snug" style={{ color: "#7a9ab8" }}>{opt.desc}</p>
                  <button onClick={opt.onClick}
                    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                    style={{ background: `${opt.color}14`, border: `1px solid ${opt.color}28`, color: opt.color }}>
                    {opt.btn} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skip */}
        <button onClick={goToDashboard}
          className="mt-6 text-sm transition-all hover:opacity-70"
          style={{ color: "#3d5a78" }}>
          Skip for now — show me demo data
        </button>
      </div>

      {/* Bank modal */}
      {bankModal && (
        <BankConnectModal
          onClose={() => setBankModal(false)}
          onContinue={() => { setBankModal(false); goToDashboard(); }}
        />
      )}
    </>
  );
}
