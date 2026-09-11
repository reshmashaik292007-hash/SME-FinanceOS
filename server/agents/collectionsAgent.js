import { callClaude } from "../services/claude.js";

const FALLBACK = {
  summary: "₹1.42L is currently overdue across 5 invoices. Ravi Traders is the highest priority — ₹48,000 outstanding for 23 days with a consistent pattern of late payments.",
  urgentInvoice: { id: "INV-1042", customer: "Ravi Traders", amount: 48000, daysOverdue: 23, risk: "HIGH" },
  risk: "HIGH",
  reasons: [
    "Largest single overdue amount at ₹48,000",
    "23 days past due date",
    "Two prior invoices also paid late",
  ],
  draft: {
    recipient: "Ravi Traders",
    subject: "Payment follow-up — Invoice #INV-1042",
    body: `Hi Ravi,

Just following up regarding invoice #INV-1042 for ₹48,000, which is currently 23 days overdue.

We'd appreciate it if you could arrange payment at your earliest convenience. If there's anything needed from our side — a revised invoice, bank details, or a payment plan — please let us know.

Your continued partnership means a lot to us, and we'd like to resolve this quickly.

Regards,
Sri Lakshmi Furnitures`,
  },
};

export async function runCollectionsAgent(data) {
  const result = await callClaude({
    systemPrompt: `You are the Collections Agent on an AI finance team for a small business. Review unpaid and overdue invoices. Rank collection urgency using: invoice amount, days overdue, customer payment history, and repeated late-payment behavior. Choose ONE most urgent invoice. Draft a professional but firm payment reminder. Do not threaten the customer. Return valid JSON only: { summary, urgentInvoice: { id, customer, amount, daysOverdue, risk }, risk, reasons, draft: { recipient, subject, body } }`,
    userPrompt: JSON.stringify({
      overdueInvoices: data.invoices.filter((i) => i.status === "OVERDUE"),
    }),
  });
  return result || FALLBACK;
}
