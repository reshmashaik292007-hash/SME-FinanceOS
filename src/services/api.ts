import {
  business,
  invoices,
  expenses,
  subscriptions,
  calcMetrics,
  calcPulseScore,
} from "../data/seed";
import {
  fallbackPulseExplanation,
  fallbackForecasting,
  fallbackCollections,
  fallbackRisk,
  fallbackAdvisor,
} from "../data/fallbacks";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function fetchJSON(path: string, options?: RequestInit) {
  const token = localStorage.getItem("finpilot_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
export { BASE_URL };
export const createInvoice = (invoice: unknown) => fetchJSON("/api/invoices", { method: "POST", body: JSON.stringify(invoice) });
export const updateInvoice = (invoice: any) => fetchJSON(`/api/invoices/${invoice.id}`, { method: "PUT", body: JSON.stringify(invoice) });
export const payInvoice = (id: string) => fetchJSON(`/api/invoices/${id}/pay`, { method: "POST" });
export const removeInvoice = (id: string) => fetchJSON(`/api/invoices/${id}`, { method: "DELETE" });
export const createExpense = (expense: unknown) => fetchJSON("/api/expenses", { method: "POST", body: JSON.stringify(expense) });
export const updateExpense = (expense: any) => fetchJSON(`/api/expenses/${expense.id}`, { method: "PUT", body: JSON.stringify(expense) });
export const removeExpense = (id: string) => fetchJSON(`/api/expenses/${id}`, { method: "DELETE" });
export const saveImportBatch = (batch: unknown) => fetchJSON("/api/imports", { method: "POST", body: JSON.stringify(batch) });
export const removeImportBatch = (id: string) => fetchJSON(`/api/imports/${id}`, { method: "DELETE" });
export const connectBank = (connection: unknown) => fetchJSON("/api/bank/connect", { method: "POST", body: JSON.stringify(connection) });
export const disconnectBank = () => fetchJSON("/api/bank", { method: "DELETE" });
export const resetDemo = () => fetchJSON("/api/demo/reset", { method: "POST" });

export async function fetchData() {
  try {
    return await fetchJSON("/api/data");
  } catch {
    return { business, invoices, expenses, subscriptions };
  }
}

export async function fetchPulse() {
  try {
    return await fetchJSON("/api/pulse");
  } catch {
    const pulse = calcPulseScore();
    return { ...pulse, explanation: fallbackPulseExplanation };
  }
}

export type AgentResults = {
  forecasting: typeof fallbackForecasting;
  collections: typeof fallbackCollections;
  risk: typeof fallbackRisk;
  advisor: typeof fallbackAdvisor;
  usedFallback?: boolean;
};

export async function runAgents(): Promise<AgentResults> {
  try {
    const result = await fetchJSON("/api/agents/run", { method: "POST" });
    return result.agents;
  } catch {
    // Simulate sequential agent execution with delays (handled in UI)
    return {
      forecasting: fallbackForecasting,
      collections: fallbackCollections,
      risk: fallbackRisk,
      advisor: fallbackAdvisor,
      usedFallback: true,
    };
  }
}
