if (import.meta.hot) { (import.meta.hot as any).decline(); }
import { createContext, useContext, useState, type ReactNode } from "react";

export type AuthUser = {
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
};

type RegisterData = AuthUser & { password: string };

type AuthCtx = {
  user: AuthUser | null;
  register: (data: RegisterData) => Promise<boolean>;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  setOnboarded: () => void;
  onboarded: boolean;
};

const STORAGE_KEY  = "finpilot_user";
const ONBOARD_KEY  = "finpilot_onboarded";
// Store all registered accounts so login can look them up
const ACCOUNTS_KEY = "finpilot_accounts";

type StoredAccount = AuthUser & { password: string };

function loadUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}

function loadAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); } catch { return []; }
}

function saveAccount(data: RegisterData) {
  const accounts = loadAccounts();
  const existing = accounts.findIndex(
    (a) => a.mobile === data.mobile || (data.email && a.email === data.email)
  );
  if (existing >= 0) accounts[existing] = data;
  else accounts.push(data);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

const _authHot = (import.meta.hot as any)?.data ?? {};
if (!_authHot._AuthCtx) {
  _authHot._AuthCtx = createContext<AuthCtx>({
    user: null, register: async () => false, login: async () => false, logout: () => {},
    setOnboarded: () => {}, onboarded: false,
  });
}
const Ctx: ReturnType<typeof createContext<AuthCtx>> = _authHot._AuthCtx;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,       setUser]        = useState<AuthUser | null>(loadUser);
  const [onboarded,  setOnboardedS]  = useState(() => !!localStorage.getItem(ONBOARD_KEY));

  async function register(data: RegisterData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) return false;
      const result = await response.json(); localStorage.setItem("finpilot_token", result.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user)); setUser(result.user); return true;
    } catch {}
    const u: AuthUser = {
      businessName: data.businessName,
      ownerName:    data.ownerName,
      mobile:       data.mobile,
      email:        data.email,
    };
    saveAccount(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return true;
  }

  async function login(identifier: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }) });
      if (response.ok) { const result = await response.json(); localStorage.setItem("finpilot_token", result.token); localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user)); setUser(result.user); return true; }
    } catch {}
    const id = identifier.trim().toLowerCase();
    // Look up against registered accounts first
    const accounts = loadAccounts();
    const match = accounts.find(
      (a) =>
        a.mobile === id ||
        a.email.toLowerCase() === id ||
        // strip +91 prefix for mobile comparison
        a.mobile.replace(/^\+91/, "") === id.replace(/^\+91/, "")
    );

    if (match) {
      // In demo MVP any password is accepted after registration
      const u: AuthUser = {
        businessName: match.businessName,
        ownerName:    match.ownerName,
        mobile:       match.mobile,
        email:        match.email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
      return true;
    }

    // No registered account found — reject login so we don't create ghost users
    return false;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ONBOARD_KEY);
    localStorage.removeItem("finpilot_token");
    setUser(null);
    setOnboardedS(false);
  }

  function setOnboarded() {
    localStorage.setItem(ONBOARD_KEY, "1");
    setOnboardedS(true);
  }

  return (
    <Ctx.Provider value={{ user, register, login, logout, setOnboarded, onboarded }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() { return useContext(Ctx); }
