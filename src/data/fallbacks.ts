// Deterministic AI fallback outputs — used when Claude API is unavailable
export const fallbackPulseExplanation =
  "Your pulse is stable, but ₹1.42L is currently tied up in overdue invoices. Two customers — Ravi Traders and Metro Wholesale — have repeatedly paid late, putting near-term cash flow at risk.";

export const fallbackForecasting = {
  summary:
    "Cash flow looks stable for the next 30 days, but your balance could fall below ₹2L around Day 24 if overdue invoices from Ravi Traders and Metro Wholesale aren't collected.",
  forecast: {
    days30: {
      expectedBalance: 186000,
      cashIn: 325000,
      cashOut: 410000,
      note: "Potential dip if ₹1.42L in overdue invoices remain uncollected.",
    },
    days60: {
      expectedBalance: 298000,
      cashIn: 520000,
      cashOut: 408000,
      note: "Recovery expected as pending invoices are due.",
    },
    days90: {
      expectedBalance: 425000,
      cashIn: 540000,
      cashOut: 413000,
      note: "Cash position normalizes assuming regular collections.",
    },
  },
  risk: "MEDIUM",
  liquidityDip: {
    dayEstimate: 24,
    estimatedBalance: 186000,
    threshold: 200000,
  },
  assumptions: [
    "Payroll of ₹1.80L due on the 5th",
    "Rent of ₹65,000 due on the 1st",
    "Pending invoices collected by Day 45",
    "Overdue from Ravi Traders partially recovered by Day 30",
  ],
};

export const fallbackCollections = {
  summary:
    "₹1.42L is currently overdue across 5 invoices. Ravi Traders is the highest priority — ₹48,000 outstanding for 23 days with a consistent pattern of late payments.",
  urgentInvoice: {
    id: "INV-1042",
    customer: "Ravi Traders",
    amount: 48000,
    daysOverdue: 23,
    risk: "HIGH",
  },
  risk: "HIGH",
  reasons: [
    "Largest single overdue amount at ₹48,000",
    "23 days past due date — longest outstanding",
    "Two prior invoices also paid late (12 and 18 days)",
    "No payment communication received since due date",
  ],
  draft: {
    recipient: "Ravi Traders",
    subject: "Payment follow-up — Invoice #INV-1042",
    body: `Hi Ravi,

Just following up regarding invoice #INV-1042 for ₹48,000, which is currently 23 days overdue.

We'd appreciate it if you could arrange payment at your earliest convenience. If there's anything needed from our side — a revised invoice, bank details, or a payment plan — please let us know.

Your continued partnership means a lot to us, and we'd like to resolve this quickly.

Regards,
Your Business`,
  },
};

export const fallbackRisk = {
  summary:
    "One subscription (CloudSuite Pro) appears unused since May — that's ₹6,999/month in potential savings. A duplicate charge was also detected this month, and software spending has increased 24%.",
  anomalies: [
    {
      type: "UNUSED_SUBSCRIPTION",
      merchant: "CloudSuite Pro",
      amount: 6999,
      description: "No login detected since May 2025. Likely unused.",
      saving: 6999,
    },
    {
      type: "DUPLICATE_CHARGE",
      merchant: "CloudSuite Pro",
      amount: 6999,
      description: "Charged twice in September — EXP-003 and EXP-014.",
      saving: 6999,
    },
    {
      type: "SPENDING_SPIKE",
      merchant: "Software (all vendors)",
      amount: 18996,
      description: "Software spend increased 24% month-over-month.",
      saving: 0,
    },
  ],
  potentialMonthlySavings: 6999,
  riskLevel: "MEDIUM",
};

export const fallbackAdvisor = {
  priority: "HIGH",
  action: "Collect ₹48,000 from Ravi Traders immediately.",
  reason:
    "Your cash forecast shows a potential liquidity dip in 24 days. Ravi Traders' invoice is both the largest and the most overdue, and their repeated late-payment pattern makes this the highest-impact action you can take today.",
  impact: "+₹48,000 cash — improves 30-day runway by 25%",
};
