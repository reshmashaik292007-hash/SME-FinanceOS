import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type FormKey = "businessName" | "ownerName" | "mobile" | "email" | "password" | "confirm";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState<Record<FormKey, string>>({
    businessName: "", ownerName: "", mobile: "", email: "", password: "", confirm: "",
  });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: FormKey) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { businessName, ownerName, mobile, email, password, confirm } = form;
    if (!businessName.trim() || !ownerName.trim() || !mobile.trim() || !password) {
      setError("Please fill in all required fields."); return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address."); return;
    }
    if (mobile.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number."); return;
    }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const ok = await register({
      businessName: businessName.trim(),
      ownerName:    ownerName.trim(),
      mobile:       mobile.trim(),
      email:        email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (ok) navigate("/onboarding"); else setError("Could not create your account. Please try again.");
  }

  const fields: {
    key: FormKey; label: string; placeholder: string;
    type?: string; prefix?: string; required?: boolean;
  }[] = [
    { key: "businessName", label: "Business Name",    placeholder: "Your business name",    required: true },
    { key: "ownerName",    label: "Owner Name",       placeholder: "Your full name",         required: true },
    { key: "mobile",       label: "Mobile Number",    placeholder: "10-digit mobile number", required: true, prefix: "+91" },
    { key: "email",        label: "Email (optional)", placeholder: "your@email.com" },
    { key: "password",     label: "Password",         placeholder: "Create password",        required: true, type: "password" },
    { key: "confirm",      label: "Confirm Password", placeholder: "Confirm password",       required: true, type: "password" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(160deg, #040d18 0%, #071020 60%, #071820 100%)" }}>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
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

        <h1 className="font-bold text-2xl mb-1" style={{ color: "#e8f0f8", letterSpacing: "-0.02em" }}>
          Create your business account
        </h1>
        <p className="text-sm mb-7" style={{ color: "#7a9ab8" }}>Set up your account in less than a minute.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map(({ key, label, placeholder, type, prefix }) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3d5a78" }}>{label}</label>
              <div className="relative flex items-center">
                {prefix && (
                  <span className="absolute left-0 h-full flex items-center pl-4 text-sm font-medium pointer-events-none"
                    style={{ color: "#7a9ab8", borderRight: "1px solid rgba(255,255,255,0.08)", paddingRight: 12, minWidth: 52 }}>
                    {prefix}
                  </span>
                )}
                <input
                  type={type === "password" ? (showPw ? "text" : "password") : (key === "email" ? "email" : "text")}
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "#132235",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "#e8f0f8",
                    paddingLeft: prefix ? 64 : 16,
                    paddingRight: type === "password" ? 44 : 16,
                  }}
                  autoComplete={
                    key === "email"    ? "email" :
                    key === "mobile"   ? "tel" :
                    type === "password" ? "new-password" : "off"
                  }
                />
                {type === "password" && key === "password" && (
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 p-1">
                    {showPw ? <EyeOff size={15} color="#3d5a78" /> : <Eye size={15} color="#3d5a78" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && (
            <p className="text-xs px-3 py-2 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-60 mt-1"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
            {loading ? "Creating account…" : <><span>Create Business Account</span><ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "#3d5a78" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#10b981" }}>Log in</Link>
        </p>
      </div>

      <p className="text-xs mt-6 text-center" style={{ color: "#1e3a52" }}>
        "Your business finances. One simple pulse."
      </p>
    </div>
  );
}
