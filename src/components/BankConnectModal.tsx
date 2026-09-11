import { useState, useRef, useEffect } from "react";
import {
  X, Building2, Shield, ArrowRight, Search, CheckCircle,
  Loader2, Phone, Lock, RefreshCw, AlertCircle,
} from "lucide-react";
import { useData } from "../context/DataContext";
import type { BankConnection } from "../context/DataContext";

// ── Bank list ──────────────────────────────────────────────────────────────
const ALL_BANKS = [
  { id: "sbi",     name: "State Bank of India",  short: "SBI",      color: "#1e3a8a" },
  { id: "hdfc",    name: "HDFC Bank",             short: "HDFC",     color: "#0066b2" },
  { id: "icici",   name: "ICICI Bank",            short: "ICICI",    color: "#f37f29" },
  { id: "axis",    name: "Axis Bank",             short: "AXIS",     color: "#97144d" },
  { id: "kotak",   name: "Kotak Mahindra Bank",   short: "KOTAK",    color: "#ed1b24" },
  { id: "pnb",     name: "Punjab National Bank",  short: "PNB",      color: "#004b87" },
  { id: "bob",     name: "Bank of Baroda",        short: "BOB",      color: "#f08000" },
  { id: "canara",  name: "Canara Bank",           short: "CANARA",   color: "#006b3c" },
  { id: "union",   name: "Union Bank of India",   short: "UNION",    color: "#2e3192" },
  { id: "indusind",name: "IndusInd Bank",         short: "INDUSIND", color: "#0078be" },
  { id: "idbi",    name: "IDBI Bank",             short: "IDBI",     color: "#b8292f" },
  { id: "yes",     name: "Yes Bank",              short: "YES",      color: "#1e4788" },
];

// Mock per-bank accounts discovered
const MOCK_ACCOUNTS: Record<string, { type: string; masked: string; balance: number }[]> = {
  sbi:      [{ type: "Current Account", masked: "4821", balance: 480000 }, { type: "Savings Account", masked: "7612", balance: 95000 }],
  hdfc:     [{ type: "Current Account", masked: "3340", balance: 620000 }],
  icici:    [{ type: "Current Account", masked: "9901", balance: 312000 }],
  axis:     [{ type: "Current Account", masked: "2255", balance: 540000 }],
  kotak:    [{ type: "Current Account", masked: "6677", balance: 290000 }],
  pnb:      [{ type: "Current Account", masked: "1122", balance: 415000 }],
  bob:      [{ type: "Current Account", masked: "8843", balance: 368000 }],
  canara:   [{ type: "Current Account", masked: "5530", balance: 498000 }],
  union:    [{ type: "Current Account", masked: "4490", balance: 275000 }],
  indusind: [{ type: "Current Account", masked: "7723", balance: 511000 }],
  idbi:     [{ type: "Current Account", masked: "3388", balance: 183000 }],
  yes:      [{ type: "Current Account", masked: "6614", balance: 446000 }],
};

type Step =
  | "select"
  | "mobile"
  | "otp"
  | "discovering"
  | "accounts"
  | "consent"
  | "importing"
  | "done";

type Props = {
  onClose: () => void;
  onContinue: () => void;
};

function BankLogo({ short, color }: { short: string; color: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg shrink-0 font-bold text-xs"
      style={{ width: 36, height: 36, background: `${color}22`, border: `1px solid ${color}44`, color }}>
      {short.slice(0, 3)}
    </div>
  );
}

const OTP_MOCK = "123456";
const RESEND_SEC = 30;

export default function BankConnectModal({ onClose, onContinue }: Props) {
  const { dispatch, pulse } = useData();
  const [prevScore, setPrevScore] = useState<number | null>(null);

  const [step,         setStep]        = useState<Step>("select");
  const [bankQuery,    setBankQuery]   = useState("");
  const [selBank,      setSelBank]     = useState<typeof ALL_BANKS[0] | null>(null);
  const [mobile,       setMobile]      = useState("");
  const [mobileErr,    setMobileErr]   = useState("");
  const [otp,          setOtp]         = useState<string[]>(Array(6).fill(""));
  const [otpErr,       setOtpErr]      = useState("");
  const [resendSec,    setResendSec]   = useState(RESEND_SEC);
  const [selAccounts,  setSelAccounts] = useState<string[]>([]);
  const [importProg,   setImportProg]  = useState(0);
  const [importSteps,  setImportSteps] = useState<string[]>([]);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // resend timer
  useEffect(() => {
    if (step !== "otp") return;
    if (resendSec <= 0) return;
    const id = setTimeout(() => setResendSec((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, resendSec]);

  const filteredBanks = ALL_BANKS.filter(
    (b) => b.name.toLowerCase().includes(bankQuery.toLowerCase()) || b.short.toLowerCase().includes(bankQuery.toLowerCase())
  );

  // ── Step handlers ──────────────────────────────────────────────────────────
  function handleBankContinue() {
    if (!selBank) return;
    setStep("mobile");
  }

  function handleSendOtp() {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length !== 10) { setMobileErr("Please enter a valid 10-digit mobile number."); return; }
    setMobileErr("");
    setResendSec(RESEND_SEC);
    setOtp(Array(6).fill(""));
    setStep("otp");
  }

  function handleOtpInput(i: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  async function handleVerifyOtp() {
    const entered = otp.join("");
    if (entered.length < 6) { setOtpErr("Please enter all 6 digits."); return; }
    if (entered !== OTP_MOCK) { setOtpErr("Incorrect OTP. Use the demo OTP: 123456"); return; }
    setOtpErr("");
    setStep("discovering");
    await new Promise((r) => setTimeout(r, 2200));
    // pre-select first account
    const accounts = MOCK_ACCOUNTS[selBank!.id] ?? MOCK_ACCOUNTS.sbi;
    setSelAccounts([accounts[0].masked]);
    setStep("accounts");
  }

  function toggleAccount(masked: string) {
    setSelAccounts((prev) =>
      prev.includes(masked) ? prev.filter((m) => m !== masked) : [...prev, masked]
    );
  }

  async function handleImport() {
    // Capture the score BEFORE dispatch so we can show the delta in the done screen
    setPrevScore(pulse.score);
    setStep("importing");
    const steps = [
      "Connecting securely",
      "Verifying account",
      "Fetching transactions",
      "Analysing your latest transactions",
      "Calculating your FinPilot score",
    ];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 900));
      setImportSteps((prev) => [...prev, steps[i]]);
      setImportProg(Math.round(((i + 1) / steps.length) * 100));
    }
    await new Promise((r) => setTimeout(r, 500));

    const accounts = MOCK_ACCOUNTS[selBank!.id] ?? MOCK_ACCOUNTS.sbi;
    const chosen = accounts.filter((a) => selAccounts.includes(a.masked));
    const primary = chosen[0] ?? accounts[0];

    const connection: BankConnection = {
      bankName:      selBank!.name,
      accountMasked: `••••${primary.masked}`,
      accountType:   primary.type,
      balance:       primary.balance,
      connectedAt:   new Date().toISOString(),
      txCount:       248,
      txVolume:      1842000,
    };
    // Dispatch reconciles invoices + expenses so derivePulse returns the new score
    dispatch({ type: "CONNECT_BANK", connection });
    // pulse.score in context will reflect the new score on the next render
    setStep("done");
  }

  // ── Layout shell ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.78)" }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: "#0e1c2e",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          maxHeight: "92vh",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl"
              style={{ width: 36, height: 36, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Building2 size={17} color="#10b981" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#e8f0f8" }}>Connect Bank Account</p>
              <p className="text-xs" style={{ color: "#7a9ab8" }}>
                {step === "select" ? "Select your bank" :
                 step === "mobile" ? "Verify mobile number" :
                 step === "otp" ? "Enter OTP" :
                 step === "discovering" ? "Discovering accounts" :
                 step === "accounts" ? "Select accounts" :
                 step === "consent" ? "Review consent" :
                 step === "importing" ? "Importing transactions" :
                 "Connected!"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/5 transition-colors">
            <X size={16} color="#7a9ab8" />
          </button>
        </div>

        {/* Security notice */}
        <div className="mx-6 mt-4 mb-0 px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
          <Shield size={13} color="#10b981" />
          <p className="text-xs" style={{ color: "#7a9ab8" }}>
            FinPilot <strong style={{ color: "#10b981" }}>never</strong> asks for your bank password, UPI PIN, or ATM PIN.
          </p>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP: select bank ────────────────────────────────────────── */}
          {step === "select" && (
            <div>
              <p className="font-semibold text-base mb-1" style={{ color: "#e8f0f8" }}>
                Securely bring your business transactions into FinPilot.
              </p>
              <p className="text-sm mb-4" style={{ color: "#7a9ab8" }}>
                We use Account Aggregator-style consent — read-only access, never your password.
              </p>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} color="#3d5a78" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input value={bankQuery} onChange={(e) => setBankQuery(e.target.value)}
                  placeholder="Search bank…"
                  className="w-full py-2.5 pl-9 pr-4 rounded-xl text-sm outline-none"
                  style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.09)", color: "#e8f0f8" }} />
              </div>

              <div className="flex flex-col gap-2 mb-5" style={{ maxHeight: 280, overflowY: "auto" }}>
                {filteredBanks.map((b) => (
                  <button key={b.id} onClick={() => setSelBank(b)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all hover:scale-[1.01]"
                    style={{
                      background: selBank?.id === b.id ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selBank?.id === b.id ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
                    }}>
                    <BankLogo short={b.short} color={b.color} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#e8f0f8" }}>{b.name}</p>
                    </div>
                    {selBank?.id === b.id && <CheckCircle size={16} color="#10b981" />}
                  </button>
                ))}
              </div>

              <button onClick={handleBankContinue} disabled={!selBank}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
                Continue <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* ── STEP: mobile ─────────────────────────────────────────────── */}
          {step === "mobile" && (
            <div>
              <p className="font-semibold text-base mb-1" style={{ color: "#e8f0f8" }}>
                Verify your mobile number
              </p>
              <p className="text-sm mb-1" style={{ color: "#7a9ab8" }}>
                Enter the mobile number registered with your {selBank?.name} account.
              </p>
              <p className="text-xs mb-5 px-3 py-2 rounded-xl"
                style={{ background: "rgba(6,182,212,0.07)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.15)" }}>
                We'll use this number to discover accounts linked to your bank.
              </p>

              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3d5a78" }}>Mobile Number</label>
              <div className="flex gap-0 mb-1">
                <span className="flex items-center px-4 rounded-l-xl text-sm font-medium shrink-0"
                  style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.09)", borderRight: "none", color: "#7a9ab8", minWidth: 52 }}>
                  +91
                </span>
                <input type="tel" value={mobile} onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setMobileErr(""); }}
                  placeholder="10-digit mobile number"
                  className="flex-1 px-4 py-3 rounded-r-xl text-sm outline-none"
                  style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.09)", borderLeft: "none", color: "#e8f0f8" }}
                  inputMode="numeric" autoComplete="tel" />
              </div>
              {mobileErr && <p className="text-xs mb-3 mt-1" style={{ color: "#ef4444" }}>{mobileErr}</p>}

              <button onClick={handleSendOtp}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] mt-4"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
                <Phone size={15} /> Send OTP
              </button>
            </div>
          )}

          {/* ── STEP: OTP ────────────────────────────────────────────────── */}
          {step === "otp" && (
            <div>
              <p className="font-semibold text-base mb-1" style={{ color: "#e8f0f8" }}>
                Verify your number
              </p>
              <p className="text-sm mb-1" style={{ color: "#7a9ab8" }}>
                We've sent a 6-digit OTP to <strong style={{ color: "#e8f0f8" }}>+91 {mobile.slice(0, 5)} {mobile.slice(5)}</strong>.
              </p>

              {/* Demo badge */}
              <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <AlertCircle size={13} color="#f59e0b" />
                <p className="text-xs" style={{ color: "#f59e0b" }}>
                  Demo mode — use OTP: <strong>123456</strong>
                </p>
              </div>

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center mb-3">
                {otp.map((v, i) => (
                  <input key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={v}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="text-center text-xl font-bold rounded-xl outline-none transition-all"
                    style={{
                      width: 48, height: 56,
                      background: v ? "rgba(16,185,129,0.1)" : "#132235",
                      border: `1.5px solid ${v ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.09)"}`,
                      color: "#e8f0f8",
                    }} />
                ))}
              </div>
              {otpErr && <p className="text-xs text-center mb-2" style={{ color: "#ef4444" }}>{otpErr}</p>}

              {/* Resend */}
              <div className="flex justify-center mb-5">
                {resendSec > 0 ? (
                  <p className="text-xs" style={{ color: "#3d5a78" }}>Resend in {resendSec}s</p>
                ) : (
                  <button onClick={() => { setResendSec(RESEND_SEC); setOtp(Array(6).fill("")); setOtpErr(""); }}
                    className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#06b6d4" }}>
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                )}
              </div>

              <button onClick={handleVerifyOtp}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
                <Lock size={15} /> Verify OTP
              </button>
            </div>
          )}

          {/* ── STEP: discovering ────────────────────────────────────────── */}
          {step === "discovering" && (
            <div className="flex flex-col items-center justify-center gap-5 text-center py-8">
              <div className="relative">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 76, height: 76, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Loader2 size={32} color="#10b981" className="animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-bold text-base mb-1" style={{ color: "#e8f0f8" }}>Finding your accounts…</p>
                <p className="text-sm" style={{ color: "#7a9ab8" }}>Looking for bank accounts linked to this mobile number.</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-full"
                    style={{ width: 7, height: 7, background: "#10b981", opacity: 0.5, animation: `pulse 1.2s ${i * 0.3}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: accounts ───────────────────────────────────────────── */}
          {step === "accounts" && (
            <div>
              <p className="font-semibold text-base mb-1" style={{ color: "#e8f0f8" }}>Accounts found</p>
              <p className="text-sm mb-4" style={{ color: "#7a9ab8" }}>
                Select the accounts you want to connect.
              </p>

              <div className="flex flex-col gap-3 mb-5">
                {(MOCK_ACCOUNTS[selBank!.id] ?? MOCK_ACCOUNTS.sbi).map((acc) => {
                  const checked = selAccounts.includes(acc.masked);
                  return (
                    <button key={acc.masked} onClick={() => toggleAccount(acc.masked)}
                      className="flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all"
                      style={{
                        background: checked ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${checked ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                      {/* checkbox */}
                      <div className="flex items-center justify-center rounded-md shrink-0"
                        style={{ width: 20, height: 20, background: checked ? "#10b981" : "transparent", border: `2px solid ${checked ? "#10b981" : "rgba(255,255,255,0.2)"}` }}>
                        {checked && <CheckCircle size={12} color="#fff" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "#e8f0f8" }}>
                          {selBank?.name} — {acc.type}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#7a9ab8" }}>
                          ••••{acc.masked}
                        </p>
                      </div>
                      <p className="text-sm font-bold number-font" style={{ color: "#10b981" }}>
                        ₹{(acc.balance / 100000).toFixed(2)}L
                      </p>
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setStep("consent")} disabled={selAccounts.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
                Continue <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* ── STEP: consent ────────────────────────────────────────────── */}
          {step === "consent" && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center rounded-xl"
                  style={{ width: 38, height: 38, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Shield size={18} color="#10b981" />
                </div>
                <div>
                  <p className="font-bold text-base" style={{ color: "#e8f0f8" }}>Your Consent</p>
                  <p className="text-xs" style={{ color: "#7a9ab8" }}>FinPilot is requesting access to your financial information.</p>
                </div>
              </div>

              {/* What's requested */}
              <div className="rounded-2xl p-4 mb-3" style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: "#3d5a78" }}>Requesting</p>
                {["Account balance", "Transaction history", "Transaction dates", "Transaction descriptions", "Credits and debits"].map((item) => (
                  <div key={item} className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} color="#10b981" />
                    <p className="text-sm" style={{ color: "#e8f0f8" }}>{item}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="rounded-2xl p-4 mb-4" style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.07)" }}>
                {[
                  { label: "Purpose", value: "Cash flow analysis, spending insights, FinPilot score" },
                  { label: "Data period", value: "Last 6 months" },
                  { label: "Frequency", value: "One-time access" },
                  { label: "Data user", value: "SME FinanceOS — FinPilot" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 mb-3 last:mb-0">
                    <p className="text-xs font-semibold w-24 shrink-0 mt-0.5" style={{ color: "#3d5a78" }}>{label}</p>
                    <p className="text-xs" style={{ color: "#7a9ab8" }}>{value}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs mb-5 px-1" style={{ color: "#3d5a78" }}>
                Your data will only be used for the purpose you approve. You can stop sharing access later.
              </p>

              <div className="flex flex-col gap-2">
                <button onClick={handleImport}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
                  <CheckCircle size={15} /> Allow & Continue
                </button>
                <button onClick={onClose}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
                  style={{ color: "#7a9ab8", border: "1px solid rgba(255,255,255,0.07)" }}>
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: importing ──────────────────────────────────────────── */}
          {step === "importing" && (
            <div className="py-4">
              <p className="font-bold text-base mb-1" style={{ color: "#e8f0f8" }}>Importing your transactions…</p>
              <p className="text-sm mb-5" style={{ color: "#7a9ab8" }}>This usually takes a few seconds.</p>

              <div className="w-full rounded-full overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.06)", height: 6 }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${importProg}%`, background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />
              </div>

              <div className="flex flex-col gap-3">
                {["Connecting securely", "Verifying account", "Fetching transactions", "Analysing your latest transactions", "Calculating your FinPilot score"].map((s, i) => {
                  const done  = importSteps.includes(s);
                  const active = importSteps.length === i;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: 22, height: 22, background: done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)" }}>
                        {done
                          ? <CheckCircle size={13} color="#10b981" />
                          : active
                          ? <Loader2 size={13} color="#06b6d4" className="animate-spin" />
                          : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />}
                      </div>
                      <p className="text-sm" style={{ color: done ? "#e8f0f8" : active ? "#06b6d4" : "#3d5a78" }}>{s}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP: done ───────────────────────────────────────────────── */}
          {step === "done" && (
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div className="flex items-center justify-center rounded-full"
                style={{ width: 76, height: 76, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 0 32px rgba(16,185,129,0.2)" }}>
                <CheckCircle size={36} color="#10b981" />
              </div>

              <div>
                <p className="font-bold text-xl mb-1" style={{ color: "#e8f0f8" }}>Bank connected!</p>
                <p className="text-sm" style={{ color: "#7a9ab8" }}>
                  248 transactions imported · ₹18.42L total volume
                </p>
              </div>

              <div className="w-full rounded-2xl p-4 text-left" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <p className="text-xs font-bold mb-2" style={{ color: "#10b981" }}>AI categorized your transactions</p>
                {[
                  { label: "Customer payments", count: 82,  color: "#10b981" },
                  { label: "Supplies",          count: 54,  color: "#06b6d4" },
                  { label: "Salaries",          count: 36,  color: "#a78bfa" },
                  { label: "Other",             count: 76,  color: "#7a9ab8" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />
                      <p className="text-xs" style={{ color: "#7a9ab8" }}>{c.label}</p>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: c.color }}>{c.count} txns</p>
                  </div>
                ))}
              </div>

              <div className="w-full rounded-2xl p-4" style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-bold mb-2" style={{ color: "#3d5a78" }}>Your FinPilot score has been updated</p>
                <div className="flex items-center justify-center gap-3">
                  {prevScore !== null && (
                    <>
                      <span className="text-2xl font-bold number-font" style={{ color: "#7a9ab8" }}>{prevScore}</span>
                      <ArrowRight size={16} color="#3d5a78" />
                    </>
                  )}
                  <span className="text-3xl font-bold number-font" style={{ color: "#10b981" }}>{pulse.score}</span>
                  <span className="text-sm" style={{ color: "#7a9ab8" }}>/ 100</span>
                </div>
                <p className="text-xs mt-1" style={{ color: "#3d5a78" }}>
                  Your financial health has been updated.
                </p>
              </div>

              <button onClick={onContinue}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
                View my financial health <ArrowRight size={15} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
