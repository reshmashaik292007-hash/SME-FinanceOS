import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [mobile,   setMobile]   = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!mobile.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const ok = await login(mobile.trim(), password);
    setLoading(false);
    if (ok) navigate("/dashboard");
    else setError("Incorrect credentials. Please try again.");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #040d18 0%, #071020 60%, #071820 100%)" }}>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex items-center justify-center rounded-2xl"
          style={{ width: 44, height: 44, background: "rgba(16,185,129,0.13)", border: "1px solid rgba(16,185,129,0.28)" }}>
          <Activity size={22} color="#10b981" />
        </div>
        <div>
          <p className="font-bold text-lg leading-none" style={{ color: "#e8f0f8" }}>FinPilot</p>
          <p className="text-xs leading-none mt-0.5" style={{ color: "#3d5a78" }}>SME FinanceOS</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-3xl px-8 py-8"
        style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>

        <h1 className="font-bold text-2xl mb-1" style={{ color: "#e8f0f8", letterSpacing: "-0.02em" }}>Welcome back</h1>
        <p className="text-sm mb-7" style={{ color: "#7a9ab8" }}>Let's check how your business is doing today.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3d5a78" }}>Mobile Number / Email</label>
            <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile or email"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.09)", color: "#e8f0f8" }}
              autoComplete="username" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3d5a78" }}>Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11"
                style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.09)", color: "#e8f0f8" }}
                autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                {showPw ? <EyeOff size={15} color="#3d5a78" /> : <Eye size={15} color="#3d5a78" />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <button type="button" className="text-xs" style={{ color: "#3d5a78" }}>Forgot password?</button>
            </div>
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-60 mt-1"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
            {loading ? "Logging in…" : <><span>Log in</span><ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#3d5a78" }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold" style={{ color: "#10b981" }}>Create business account</Link>
        </p>
      </div>

      <p className="text-xs mt-8 text-center" style={{ color: "#1e3a52" }}>
        Your data is private and secure. We never share it.
      </p>
    </div>
  );
}
