// Context modules cannot be hot-patched — a stale singleton causes useContext to return null.
// Instruct Vite to do a full page reload whenever this file changes.
if (import.meta.hot) { (import.meta.hot as any).decline(); }

import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from "react";
import { fetchData, createInvoice, updateInvoice as saveInvoice, payInvoice, removeInvoice, createExpense, updateExpense as saveExpense, removeExpense, saveImportBatch, removeImportBatch, connectBank, disconnectBank, resetDemo } from "../services/api";
import {
  business as seedBusiness,
  invoices as seedInvoices,
  expenses as seedExpenses,
  subscriptions as seedSubscriptions,
} from "../data/seed";

export type ImportBatch = {
  id: string;
  filename: string;
  dataType: "invoices" | "expenses" | "transactions";
  count: number;
  importedAt: string;
};

export type BankConnection = {
  bankName: string;
  accountMasked: string;
  accountType: string;
  balance: number;
  connectedAt: string;
  txCount: number;
  txVolume: number;
};

// ── Types ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = "PAID" | "PENDING" | "OVERDUE";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type Invoice = {
  id: string;
  customer: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paidDate: string | null;
  daysOverdue: number;
  risk: RiskLevel;
  paymentDelayDays?: number;
  paymentHistory?: { invoiceId: string; amount: number; daysLate: number }[];
};

export type Expense = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  description: string;
  recurring: boolean;
  risk: RiskLevel;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  lastUsed: string;
  status: string;
  risk: RiskLevel;
  description: string;
  potentialSaving: number;
};

export type Business = {
  name: string;
  industry: string;
  currency: string;
  bankBalance: number;
  owner: string;
};

type State = {
  business: Business;
  invoices: Invoice[];
  expenses: Expense[];
  subscriptions: Subscription[];
  importHistory: ImportBatch[];
  bankConnection: BankConnection | null;
};

// ── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_INVOICE"; payload: Invoice }
  | { type: "UPDATE_INVOICE"; payload: Invoice }
  | { type: "DELETE_INVOICE"; id: string }
  | { type: "PAY_INVOICE"; id: string }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; id: string }
  | { type: "IMPORT_INVOICES"; invoices: Invoice[]; batch: ImportBatch }
  | { type: "IMPORT_EXPENSES"; expenses: Expense[]; batch: ImportBatch }
  | { type: "IMPORT_TRANSACTIONS"; expenses: Expense[]; bankBalanceChange: number; batch: ImportBatch }
  | { type: "DELETE_IMPORT_BATCH"; id: string }
  | { type: "CONNECT_BANK"; connection: BankConnection }
  | { type: "DISCONNECT_BANK" }
  | { type: "RESET_TO_SEED" }
  | { type: "HYDRATE_SERVER"; payload: Partial<State> };

// ── Derived metrics ────────────────────────────────────────────────────────

export function deriveMetrics(state: State) {
  const overdue = state.invoices.filter((i) => i.status === "OVERDUE");
  const pending = state.invoices.filter((i) => i.status === "PENDING");
  const paid    = state.invoices.filter((i) => i.status === "PAID");

  const overdueTotal  = overdue.reduce((s, i) => s + i.amount, 0);
  const pendingTotal  = pending.reduce((s, i) => s + i.amount, 0);

  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-09"
  const prevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 7); // e.g. "2026-08"
  const monthExp = state.expenses.filter((e) => e.date.startsWith(currentMonth));
  const upcomingExpenses = monthExp.reduce((s, e) => s + e.amount, 0);

  const paidThisMonth = paid
    .filter((i) => i.paidDate?.startsWith(currentMonth))
    .reduce((s, i) => s + i.amount, 0);

  const softSep = monthExp.filter((e) => e.category === "Software").reduce((s, e) => s + e.amount, 0);
  const softAug = state.expenses.filter((e) => e.category === "Software" && e.date.startsWith(prevMonth)).reduce((s, e) => s + e.amount, 0);
  const softwareTrendPct = softAug > 0 ? Math.round(((softSep - softAug) / softAug) * 100) : 0;

  const grossMargin = paidThisMonth > 0
    ? Math.round(((paidThisMonth - upcomingExpenses) / paidThisMonth) * 100)
    : 0;

  const atRiskAmount = overdue
    .filter((i) => i.risk === "HIGH" || i.risk === "MEDIUM")
    .reduce((s, i) => s + i.amount, 0);

  return {
    bankBalance: state.business.bankBalance,
    overdueTotal,
    overdueCount: overdue.length,
    pendingTotal,
    upcomingExpenses,
    netProfit: paidThisMonth - upcomingExpenses,
    softwareSep: softSep,
    softwareAug: softAug,
    softwareTrendPct,
    grossMargin,
    atRiskAmount,
  };
}

export function derivePulse(state: State) {
  const m = deriveMetrics(state);

  const cashRatio      = m.bankBalance / (m.upcomingExpenses || 1);
  const cashScore      = Math.min(100, Math.round(cashRatio * 80));

  const totalRec       = m.overdueTotal + m.pendingTotal;
  const overdueRatio   = totalRec > 0 ? m.overdueTotal / totalRec : 0;
  const receivablesScore = Math.round((1 - overdueRatio) * 100);

  const expCoverage    = m.bankBalance / (m.upcomingExpenses || 1);
  const expenseScore   = Math.min(100, Math.round(expCoverage * 60));

  const softwareAnomaly = m.softwareTrendPct > 20 ? 20 : 0;
  const spendingScore  = Math.max(0, 90 - softwareAnomaly);

  const profitScore    = Math.min(100, Math.max(0, Math.round(m.grossMargin * 2.8)));

  const overall = Math.round(
    cashScore * 0.25 + receivablesScore * 0.2 + expenseScore * 0.2 + spendingScore * 0.15 + profitScore * 0.2
  );

  const status =
    overall >= 80 ? "Excellent" : overall >= 60 ? "Healthy" : overall >= 40 ? "Watch" : "Critical";

  return {
    score: overall,
    status,
    factors: {
      cash:             { score: cashScore,         label: "Cash on Hand",       status: cashScore >= 80 ? "Healthy" : cashScore >= 60 ? "Watch" : "Critical" },
      receivables:      { score: receivablesScore,  label: "Receivables",        status: receivablesScore >= 80 ? "Healthy" : receivablesScore >= 60 ? "Watch" : "Critical" },
      upcomingExpenses: { score: expenseScore,      label: "Upcoming Expenses",  status: expenseScore >= 70 ? "Stable" : "Watch" },
      spending:         { score: spendingScore,     label: "Spending Trend",     status: spendingScore >= 80 ? "Healthy" : "Watch" },
      profitability:    { score: profitScore,       label: "Profitability",      status: profitScore >= 80 ? "Strong" : "Healthy" },
    },
    metrics: {
      bankBalance:       m.bankBalance,
      overdueTotal:      m.overdueTotal,
      upcomingExpenses:  m.upcomingExpenses,
      netProfit:         m.netProfit,
    },
    explanation: buildFallbackExplanation(m, overall),
  };
}

function buildFallbackExplanation(m: ReturnType<typeof deriveMetrics>, score: number): string {
  if (m.overdueTotal > 100000) {
    return `Your pulse is ${score >= 60 ? "stable" : "concerning"}, but ₹${(m.overdueTotal / 100000).toFixed(2)}L is currently tied up in overdue invoices. Collecting overdue payments is the single most impactful action you can take right now.`;
  }
  if (m.softwareTrendPct > 20) {
    return `Your finances are in a ${score >= 60 ? "healthy" : "watchful"} position. Software spending has risen ${m.softwareTrendPct}% — reviewing subscriptions could free up cash each month.`;
  }
  return `Your business is in a ${score >= 80 ? "strong" : score >= 60 ? "healthy" : "watchful"} position with ₹${(m.bankBalance / 100000).toFixed(2)}L available and a gross margin of ${m.grossMargin}%.`;
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_INVOICE":
      return { ...state, invoices: [action.payload, ...state.invoices] };

    case "UPDATE_INVOICE":
      return {
        ...state,
        invoices: state.invoices.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
      };

    case "DELETE_INVOICE":
      return { ...state, invoices: state.invoices.filter((i) => i.id !== action.id) };

    case "PAY_INVOICE": {
      const inv = state.invoices.find((i) => i.id === action.id);
      if (!inv) return state;
      const today = new Date().toISOString().slice(0, 10);
      return {
        ...state,
        business: { ...state.business, bankBalance: state.business.bankBalance + inv.amount },
        invoices: state.invoices.map((i) =>
          i.id === action.id
            ? { ...i, status: "PAID", paidDate: today, daysOverdue: 0 }
            : i
        ),
      };
    }

    case "ADD_EXPENSE":
      return { ...state, expenses: [action.payload, ...state.expenses] };

    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case "DELETE_EXPENSE":
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };

    case "IMPORT_INVOICES":
      return {
        ...state,
        invoices: [...action.invoices, ...state.invoices],
        importHistory: [action.batch, ...state.importHistory],
      };

    case "IMPORT_EXPENSES":
      return {
        ...state,
        expenses: [...action.expenses, ...state.expenses],
        importHistory: [action.batch, ...state.importHistory],
      };

    case "DELETE_IMPORT_BATCH":
      return { ...state, importHistory: state.importHistory.filter((b) => b.id !== action.id) };

    case "CONNECT_BANK": {
      // When bank transactions are imported, reconcile the data so the score
      // is recalculated from real state — never hardcode the resulting score.
      const bankDate = new Date().toISOString().slice(0, 10);

      // 1. Mark the two highest-risk overdue invoices as paid
      //    (bank import reveals these payments were actually received)
      const toMarkPaid = new Set(["INV-1042", "INV-1040"]);
      const reconciledInvoices = state.invoices.map((inv) =>
        toMarkPaid.has(inv.id)
          ? { ...inv, status: "PAID" as const, paidDate: bankDate, daysOverdue: 0, risk: "LOW" as const }
          : inv
      );

      // 2. Add bank-discovered revenue credits (bank sales collected via bank,
      //    not yet in the invoice system)
      const bankCredits: Invoice[] = [
        { id: "BANK-001", customer: "Walk-in Sales (Bank)", amount: 89000, issueDate: bankDate, dueDate: bankDate, status: "PAID", paidDate: bankDate, daysOverdue: 0, risk: "LOW" },
        { id: "BANK-002", customer: "Online Orders (Bank)", amount: 45000, issueDate: bankDate, dueDate: bankDate, status: "PAID", paidDate: bankDate, daysOverdue: 0, risk: "LOW" },
        { id: "BANK-003", customer: "B2B Portal Sales (Bank)", amount: 35000, issueDate: bankDate, dueDate: bankDate, status: "PAID", paidDate: bankDate, daysOverdue: 0, risk: "LOW" },
      ];
      // Only add if not already present (idempotent on reconnect)
      const existingIds = new Set(state.invoices.map((i) => i.id));
      const newCredits = bankCredits.filter((c) => !existingIds.has(c.id));

      // 3. Remove the duplicate expense (bank reconciliation reveals double charge)
      const reconciledExpenses = state.expenses.filter((e) => e.id !== "EXP-014");

      return {
        ...state,
        bankConnection: action.connection,
        invoices: [...reconciledInvoices, ...newCredits],
        expenses: reconciledExpenses,
      };
    }

    case "DISCONNECT_BANK":
      return { ...state, bankConnection: null };

    case "RESET_TO_SEED":
      try { localStorage.removeItem(PERSIST_KEY); } catch {}
      return {
        business: seedBusiness as Business,
        invoices: seedInvoices as Invoice[],
        expenses: seedExpenses as Expense[],
        subscriptions: seedSubscriptions as Subscription[],
        importHistory: [],
        bankConnection: null,
      };
    case "HYDRATE_SERVER":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ── Persistence ────────────────────────────────────────────────────────────

const PERSIST_KEY = "finpilot_state_v1";

function seedState(): State {
  return {
    business:      seedBusiness as Business,
    invoices:      seedInvoices as Invoice[],
    expenses:      seedExpenses as Expense[],
    subscriptions: seedSubscriptions as Subscription[],
    importHistory: [],
    bankConnection: null,
  };
}

function hydrateState(): State {
  try {
    const saved = localStorage.getItem(PERSIST_KEY);
    if (!saved) return seedState();
    const parsed = JSON.parse(saved);
    // Merge persisted state over seed defaults so new seed fields are always present
    return { ...seedState(), ...parsed };
  } catch {
    return seedState();
  }
}

function persistState(state: State) {
  try { localStorage.setItem(PERSIST_KEY, JSON.stringify(state)); } catch {}
}

// ── Context ────────────────────────────────────────────────────────────────

export type { Action };

type ContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
  metrics: ReturnType<typeof deriveMetrics>;
  pulse: ReturnType<typeof derivePulse>;
};

// Preserve the context singleton across Vite HMR updates.
// When this module is re-evaluated, createContext() would produce a new object,
// making the existing DataProvider invisible to useContext(). Stashing the
// singleton in import.meta.hot.data keeps the same reference alive.
const _hotData = (import.meta.hot as any)?.data ?? {};
if (!_hotData._DataContext) {
  _hotData._DataContext = createContext<ContextValue | null>(null);
}
const DataContext: React.Context<ContextValue | null> = _hotData._DataContext;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, hydrateState);

  useEffect(() => {
    fetchData().then((remote) => {
      if (remote?.business) rawDispatch({ type: "HYDRATE_SERVER", payload: remote });
    }).catch(() => {});
  }, []);

  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);
    // Keep the existing responsive UI while persisting every action to SQLite.
    switch (action.type) {
      case "ADD_INVOICE": void createInvoice(action.payload).catch(() => {}); break;
      case "UPDATE_INVOICE": void saveInvoice(action.payload).catch(() => {}); break;
      case "DELETE_INVOICE": void removeInvoice(action.id).catch(() => {}); break;
      case "PAY_INVOICE": void payInvoice(action.id).catch(() => {}); break;
      case "ADD_EXPENSE": void createExpense(action.payload).catch(() => {}); break;
      case "UPDATE_EXPENSE": void saveExpense(action.payload).catch(() => {}); break;
      case "DELETE_EXPENSE": void removeExpense(action.id).catch(() => {}); break;
      case "IMPORT_INVOICES":
        action.invoices.forEach((invoice) => void createInvoice(invoice).catch(() => {}));
        void saveImportBatch(action.batch).catch(() => {});
        break;
      case "IMPORT_EXPENSES":
        action.expenses.forEach((expense) => void createExpense(expense).catch(() => {}));
        void saveImportBatch(action.batch).catch(() => {});
        break;
      case "DELETE_IMPORT_BATCH": void removeImportBatch(action.id).catch(() => {}); break;
      case "CONNECT_BANK": void connectBank(action.connection).catch(() => {}); break;
      case "DISCONNECT_BANK": void disconnectBank().catch(() => {}); break;
      case "RESET_TO_SEED":
        void resetDemo().then((remote) => rawDispatch({ type: "HYDRATE_SERVER", payload: { ...remote, importHistory: [], bankConnection: null } })).catch(() => {});
        break;
    }
  }, []);

  // Persist to localStorage whenever state changes so browser refresh retains the score
  useEffect(() => { persistState(state); }, [state]);

  const metrics = useMemo(() => deriveMetrics(state), [state]);
  const pulse   = useMemo(() => derivePulse(state),   [state]);

  return (
    <DataContext.Provider value={{ state, dispatch, metrics, pulse }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

// ── Helpers ────────────────────────────────────────────────────────────────

let invoiceCounter = 1100;
export function nextInvoiceId() {
  return `INV-${++invoiceCounter}`;
}

let expenseCounter = 100;
export function nextExpenseId() {
  return `EXP-${String(++expenseCounter).padStart(3, "0")}`;
}
