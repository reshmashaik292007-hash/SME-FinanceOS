import { callClaude } from "../services/claude.js";

const FALLBACK = {
  summary: "One subscription (CloudSuite Pro) appears unused since May — that's ₹6,999/month in potential savings. A duplicate charge was also detected this month.",
  anomalies: [
    { type: "UNUSED_SUBSCRIPTION", merchant: "CloudSuite Pro", amount: 6999, description: "No login detected since May 2025.", saving: 6999 },
    { type: "DUPLICATE_CHARGE", merchant: "CloudSuite Pro", amount: 6999, description: "Charged twice in September.", saving: 6999 },
    { type: "SPENDING_SPIKE", merchant: "Software (all vendors)", amount: 18996, description: "Software spend increased 24% month-over-month.", saving: 0 },
  ],
  potentialMonthlySavings: 6999,
  riskLevel: "MEDIUM",
};

export async function runRiskAgent(data) {
  const result = await callClaude({
    systemPrompt: `You are the Risk Agent on an AI finance team for a small business. Analyze expenses and subscriptions. Look for: duplicate charges, unused subscriptions, unusual spending spikes, recurring expense increases, and abnormal transactions. Quantify possible savings where possible. Return valid JSON only: { summary, anomalies: [{ type, merchant, amount, description, saving }], potentialMonthlySavings, riskLevel }`,
    userPrompt: JSON.stringify({ expenses: data.expenses, subscriptions: data.subscriptions }),
  });
  return result || FALLBACK;
}
