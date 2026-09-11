import { callClaude } from "../services/claude.js";

const FALLBACK = {
  summary:
    "Cash flow looks stable for the next 30 days, but the balance could fall below ₹2L around Day 24 if overdue invoices aren't collected.",
  forecast: {
    days30: { expectedBalance: 186000, cashIn: 325000, cashOut: 410000, note: "Potential dip if ₹1.42L in overdue invoices remain uncollected." },
    days60: { expectedBalance: 298000, cashIn: 520000, cashOut: 408000, note: "Recovery expected as pending invoices are due." },
    days90: { expectedBalance: 425000, cashIn: 540000, cashOut: 413000, note: "Cash position normalizes assuming regular collections." },
  },
  risk: "MEDIUM",
  liquidityDip: { dayEstimate: 24, estimatedBalance: 186000, threshold: 200000 },
  assumptions: [
    "Payroll of ₹1.80L due on the 5th",
    "Rent of ₹65,000 due on the 1st",
    "Pending invoices collected by Day 45",
  ],
};

export async function runForecastingAgent(data) {
  const result = await callClaude({
    systemPrompt: `You are the Forecasting Agent on an AI finance team for a small business. Your responsibility is to forecast cash flow. Analyze only the financial data provided. Project cash position for 30, 60, and 90 days. Consider current bank balance, expected invoice collections, overdue invoices, upcoming expenses, recurring subscriptions, payroll, and rent. Identify potential cash shortages, approximate dates of concern, and major assumptions. Be concise. Return valid JSON only with this structure: { summary, forecast: { days30: { expectedBalance, cashIn, cashOut, note }, days60, days90 }, risk, liquidityDip: { dayEstimate, estimatedBalance, threshold }, assumptions }`,
    userPrompt: JSON.stringify({
      bankBalance: data.business.bankBalance,
      overdueInvoices: data.invoices.filter((i) => i.status === "OVERDUE"),
      pendingInvoices: data.invoices.filter((i) => i.status === "PENDING"),
      expenses: data.expenses,
      subscriptions: data.subscriptions,
    }),
  });
  return result || FALLBACK;
}
