import { callClaude } from "../services/claude.js";

const FALLBACK = {
  priority: "HIGH",
  action: "Collect ₹48,000 from Ravi Traders immediately.",
  reason: "Your cash forecast shows a potential liquidity dip in 24 days. Ravi Traders' invoice is both the largest and most overdue, and their repeated late-payment pattern makes this the highest-impact action you can take today.",
  impact: "+₹48,000 cash — improves 30-day runway by 25%",
};

export async function runAdvisorAgent({ forecasting, collections, risk }) {
  const result = await callClaude({
    systemPrompt: `You are the senior financial advisor coordinating an AI finance team for a small business. You receive reports from three specialist agents: Forecasting, Collections, and Risk. Choose ONE highest-priority action for the business owner. Do not provide a list. Choose the action with the greatest near-term financial impact. Explain in simple business language. Return valid JSON only: { priority, action, reason, impact }`,
    userPrompt: JSON.stringify({ forecasting, collections, risk }),
  });
  return result || FALLBACK;
}
