export const business = {
  name: "Sri Lakshmi Furnitures",
  industry: "Furniture & Interiors",
  currency: "INR",
  bankBalance: 480000,
  owner: "Sri Lakshmi",
  gstin: "29AADCB2230M1ZP",
  since: "2018",
};

export const invoices = [
  // OVERDUE — 5 invoices totaling ₹1,42,000
  {
    id: "INV-1042",
    customer: "Ravi Traders",
    amount: 48000,
    issueDate: "2025-08-15",
    dueDate: "2025-09-01",
    status: "OVERDUE",
    paidDate: null,
    daysOverdue: 23,
    risk: "HIGH",
    paymentHistory: [
      { invoiceId: "INV-1036", amount: 32000, daysLate: 18 },
      { invoiceId: "INV-1035", amount: 28000, daysLate: 12 },
    ],
  },
  {
    id: "INV-1040",
    customer: "Metro Wholesale",
    amount: 38000,
    issueDate: "2025-08-20",
    dueDate: "2025-09-09",
    status: "OVERDUE",
    paidDate: null,
    daysOverdue: 15,
    risk: "MEDIUM",
    paymentHistory: [
      { invoiceId: "INV-1037", amount: 42000, daysLate: 21 },
      { invoiceId: "INV-1038", amount: 56000, daysLate: 8 },
    ],
  },
  {
    id: "INV-1043",
    customer: "City Mart",
    amount: 28000,
    issueDate: "2025-08-25",
    dueDate: "2025-09-16",
    status: "OVERDUE",
    paidDate: null,
    daysOverdue: 8,
    risk: "MEDIUM",
    paymentHistory: [],
  },
  {
    id: "INV-1044",
    customer: "Prestige Homes",
    amount: 22000,
    issueDate: "2025-08-28",
    dueDate: "2025-09-19",
    status: "OVERDUE",
    paidDate: null,
    daysOverdue: 5,
    risk: "LOW",
    paymentHistory: [],
  },
  {
    id: "INV-1048",
    customer: "Sunrise Decor",
    amount: 6000,
    issueDate: "2025-09-01",
    dueDate: "2025-09-21",
    status: "OVERDUE",
    paidDate: null,
    daysOverdue: 3,
    risk: "LOW",
    paymentHistory: [],
  },
  // PENDING — due soon
  {
    id: "INV-1045",
    customer: "Horizon Decor",
    amount: 75000,
    issueDate: "2025-09-01",
    dueDate: "2025-09-29",
    status: "PENDING",
    paidDate: null,
    daysOverdue: 0,
    risk: "LOW",
    paymentHistory: [],
  },
  {
    id: "INV-1046",
    customer: "Kumar Interiors",
    amount: 120000,
    issueDate: "2025-09-03",
    dueDate: "2025-10-03",
    status: "PENDING",
    paidDate: null,
    daysOverdue: 0,
    risk: "LOW",
    paymentHistory: [],
  },
  {
    id: "INV-1047",
    customer: "Star Furniture Hub",
    amount: 85000,
    issueDate: "2025-09-05",
    dueDate: "2025-10-05",
    status: "PENDING",
    paidDate: null,
    daysOverdue: 0,
    risk: "LOW",
    paymentHistory: [],
  },
  {
    id: "INV-1049",
    customer: "Prestige Homes",
    amount: 45000,
    issueDate: "2025-09-08",
    dueDate: "2025-10-08",
    status: "PENDING",
    paidDate: null,
    daysOverdue: 0,
    risk: "LOW",
    paymentHistory: [],
  },
  // PAID — historical
  {
    id: "INV-1035",
    customer: "Ravi Traders",
    amount: 28000,
    issueDate: "2025-07-01",
    dueDate: "2025-07-20",
    status: "PAID",
    paidDate: "2025-08-01",
    paymentDelayDays: 12,
    daysOverdue: 0,
    risk: "HIGH",
    paymentHistory: [],
  },
  {
    id: "INV-1036",
    customer: "Ravi Traders",
    amount: 32000,
    issueDate: "2025-07-15",
    dueDate: "2025-08-04",
    status: "PAID",
    paidDate: "2025-08-22",
    paymentDelayDays: 18,
    daysOverdue: 0,
    risk: "HIGH",
    paymentHistory: [],
  },
  {
    id: "INV-1037",
    customer: "Metro Wholesale",
    amount: 42000,
    issueDate: "2025-07-10",
    dueDate: "2025-07-30",
    status: "PAID",
    paidDate: "2025-08-20",
    paymentDelayDays: 21,
    daysOverdue: 0,
    risk: "MEDIUM",
    paymentHistory: [],
  },
  {
    id: "INV-1038",
    customer: "Metro Wholesale",
    amount: 56000,
    issueDate: "2025-08-01",
    dueDate: "2025-08-21",
    status: "PAID",
    paidDate: "2025-08-29",
    paymentDelayDays: 8,
    daysOverdue: 0,
    risk: "MEDIUM",
    paymentHistory: [],
  },
  {
    id: "INV-1039",
    customer: "Kumar Interiors",
    amount: 120000,
    issueDate: "2025-08-05",
    dueDate: "2025-09-04",
    status: "PAID",
    paidDate: "2025-09-03",
    paymentDelayDays: 0,
    daysOverdue: 0,
    risk: "LOW",
    paymentHistory: [],
  },
  {
    id: "INV-1041",
    customer: "Star Furniture Hub",
    amount: 62000,
    issueDate: "2025-08-10",
    dueDate: "2025-09-09",
    status: "PAID",
    paidDate: "2025-09-08",
    paymentDelayDays: 0,
    daysOverdue: 0,
    risk: "LOW",
    paymentHistory: [],
  },
];

export const expenses = [
  // Recurring monthly fixed
  { id: "EXP-001", date: "2025-09-01", merchant: "City Property Partners", category: "Rent", amount: 65000, description: "Showroom & workshop rent", recurring: true, risk: "LOW" },
  { id: "EXP-002", date: "2025-09-05", merchant: "Payroll Processing", category: "Payroll", amount: 180000, description: "Staff salaries — 9 employees", recurring: true, risk: "LOW" },
  { id: "EXP-003", date: "2025-09-07", merchant: "CloudSuite Pro", category: "Software", amount: 6999, description: "Cloud ERP suite — possibly unused since Jun", recurring: true, risk: "HIGH" },
  { id: "EXP-004", date: "2025-09-07", merchant: "AccountingPro", category: "Software", amount: 2499, description: "Accounting & GST software", recurring: true, risk: "LOW" },
  { id: "EXP-005", date: "2025-09-07", merchant: "Canva Business", category: "Software", amount: 1299, description: "Design tools", recurring: true, risk: "LOW" },
  { id: "EXP-006", date: "2025-09-07", merchant: "Google Workspace", category: "Software", amount: 1200, description: "Email & collaboration", recurring: true, risk: "LOW" },
  { id: "EXP-007", date: "2025-09-08", merchant: "BESCOM", category: "Utilities", amount: 8500, description: "Electricity — workshop & showroom", recurring: true, risk: "LOW" },
  // Variable / one-time
  { id: "EXP-008", date: "2025-09-02", merchant: "Woodland Timber Depot", category: "Supplies", amount: 45000, description: "Teak and sheesham wood stock", recurring: false, risk: "LOW" },
  { id: "EXP-009", date: "2025-09-03", merchant: "Digital Square Agency", category: "Marketing", amount: 22000, description: "Instagram & Google Ads — Sep", recurring: false, risk: "LOW" },
  { id: "EXP-010", date: "2025-09-04", merchant: "IndiaMart Premium", category: "Marketing", amount: 13000, description: "B2B marketplace listing renewal", recurring: false, risk: "MEDIUM" },
  { id: "EXP-011", date: "2025-09-06", merchant: "Sharma Transport Co.", category: "Operations", amount: 18000, description: "Delivery & logistics — Sep", recurring: false, risk: "LOW" },
  { id: "EXP-012", date: "2025-09-09", merchant: "Decor Hardware Mart", category: "Supplies", amount: 12500, description: "Fixtures, handles & fittings", recurring: false, risk: "LOW" },
  { id: "EXP-013", date: "2025-09-10", merchant: "MakeMyTrip", category: "Travel", amount: 8200, description: "Client visit — Hyderabad", recurring: false, risk: "LOW" },
  { id: "EXP-014", date: "2025-09-10", merchant: "CloudSuite Pro", category: "Software", amount: 6999, description: "DUPLICATE — appears charged twice this month", recurring: false, risk: "HIGH" },
  // Previous month for trend analysis
  { id: "EXP-015", date: "2025-08-07", merchant: "CloudSuite Pro", category: "Software", amount: 4999, description: "Previous month rate (price hike in Sep)", recurring: true, risk: "HIGH" },
  { id: "EXP-016", date: "2025-08-07", merchant: "AccountingPro", category: "Software", amount: 2499, description: "Accounting software — Aug", recurring: true, risk: "LOW" },
  { id: "EXP-017", date: "2025-08-01", merchant: "City Property Partners", category: "Rent", amount: 65000, description: "Showroom rent — Aug", recurring: true, risk: "LOW" },
  { id: "EXP-018", date: "2025-08-05", merchant: "Payroll Processing", category: "Payroll", amount: 180000, description: "Staff salaries — Aug", recurring: true, risk: "LOW" },
  { id: "EXP-019", date: "2025-08-15", merchant: "OfficeSupplies365", category: "Supplies", amount: 4200, description: "Stationery and packing materials", recurring: false, risk: "LOW" },
  { id: "EXP-020", date: "2025-08-22", merchant: "Quick Repair Services", category: "Operations", amount: 3800, description: "Workshop machinery maintenance", recurring: false, risk: "LOW" },
];

export const subscriptions = [
  {
    id: "SUB-001",
    name: "CloudSuite Pro",
    amount: 6999,
    billingCycle: "monthly",
    lastUsed: "2025-05-14",
    status: "POSSIBLY_UNUSED",
    risk: "HIGH",
    description: "Cloud ERP suite — no login detected since May",
    potentialSaving: 6999,
  },
  {
    id: "SUB-002",
    name: "AccountingPro",
    amount: 2499,
    billingCycle: "monthly",
    lastUsed: "2025-09-09",
    status: "ACTIVE",
    risk: "LOW",
    description: "GST filing and accounting",
    potentialSaving: 0,
  },
  {
    id: "SUB-003",
    name: "Canva Business",
    amount: 1299,
    billingCycle: "monthly",
    lastUsed: "2025-09-05",
    status: "ACTIVE",
    risk: "LOW",
    description: "Design and social media creatives",
    potentialSaving: 0,
  },
  {
    id: "SUB-004",
    name: "Google Workspace",
    amount: 1200,
    billingCycle: "monthly",
    lastUsed: "2025-09-10",
    status: "ACTIVE",
    risk: "LOW",
    description: "Email and collaboration tools",
    potentialSaving: 0,
  },
];

// Derived metrics used throughout the app
export function calcMetrics() {
  const overdue = invoices.filter((i) => i.status === "OVERDUE");
  const pending = invoices.filter((i) => i.status === "PENDING");
  const paid = invoices.filter((i) => i.status === "PAID");

  const overdueTotal = overdue.reduce((s, i) => s + i.amount, 0);
  const pendingTotal = pending.reduce((s, i) => s + i.amount, 0);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // e.g. "2026-09"
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7); // e.g. "2026-08"
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const upcomingExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const paidThisMonth = paid
    .filter((i) => i.paidDate && i.paidDate.startsWith(currentMonth))
    .reduce((s, i) => s + i.amount, 0);

  const expensesThisMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = paidThisMonth - expensesThisMonth;

  // Software spend trend
  const softwareSep = expenses.filter(
    (e) => e.category === "Software" && e.date.startsWith(currentMonth)
  ).reduce((s, e) => s + e.amount, 0);
  const softwareAug = expenses.filter(
    (e) => e.category === "Software" && e.date.startsWith(prevMonth)
  ).reduce((s, e) => s + e.amount, 0);
  const softwareTrendPct = softwareAug > 0 ? Math.round(((softwareSep - softwareAug) / softwareAug) * 100) : 0;

  const grossRevenue = paidThisMonth;
  const grossMargin = grossRevenue > 0 ? Math.round(((grossRevenue - expensesThisMonth) / grossRevenue) * 100) : 0;

  return {
    bankBalance: business.bankBalance,
    overdueTotal,
    overdueCount: overdue.length,
    pendingTotal,
    upcomingExpenses,
    netProfit,
    paidThisMonth,
    softwareSep,
    softwareAug,
    softwareTrendPct,
    grossMargin,
    atRiskAmount: overdue.filter((i) => i.risk === "HIGH" || i.risk === "MEDIUM").reduce((s, i) => s + i.amount, 0),
  };
}

// Pulse score calculation
export function calcPulseScore() {
  const m = calcMetrics();

  // Cash on hand (25%): how much balance relative to monthly expenses
  const cashRatio = m.bankBalance / (m.upcomingExpenses || 1);
  const cashScore = Math.min(100, Math.round(cashRatio * 80));

  // Receivables (20%): overdue as % of total receivables
  const totalReceivables = m.overdueTotal + m.pendingTotal;
  const overdueRatio = totalReceivables > 0 ? m.overdueTotal / totalReceivables : 0;
  const receivablesScore = Math.round((1 - overdueRatio) * 100);

  // Upcoming expenses (20%): expenses coverage
  const expCoverage = m.bankBalance / (m.upcomingExpenses || 1);
  const expenseScore = Math.min(100, Math.round(expCoverage * 60));

  // Spending trend (15%): lower is better for trend anomalies
  const softwareAnomaly = m.softwareTrendPct > 20 ? 20 : 0;
  const spendingScore = Math.max(0, 90 - softwareAnomaly);

  // Profitability (20%)
  const profitScore = Math.min(100, Math.max(0, Math.round(m.grossMargin * 2.8)));

  const overall = Math.round(
    cashScore * 0.25 +
      receivablesScore * 0.2 +
      expenseScore * 0.2 +
      spendingScore * 0.15 +
      profitScore * 0.2
  );

  const status =
    overall >= 80 ? "Excellent" : overall >= 60 ? "Healthy" : overall >= 40 ? "Watch" : "Critical";

  return {
    score: overall,
    status,
    factors: {
      cash: { score: cashScore, label: "Cash on Hand", status: cashScore >= 80 ? "Healthy" : cashScore >= 60 ? "Watch" : "Critical" },
      receivables: { score: receivablesScore, label: "Receivables", status: receivablesScore >= 80 ? "Healthy" : receivablesScore >= 60 ? "Watch" : "Critical" },
      upcomingExpenses: { score: expenseScore, label: "Upcoming Expenses", status: expenseScore >= 70 ? "Stable" : "Watch" },
      spending: { score: spendingScore, label: "Spending Trend", status: spendingScore >= 80 ? "Healthy" : "Watch" },
      profitability: { score: profitScore, label: "Profitability", status: profitScore >= 80 ? "Strong" : "Healthy" },
    },
    metrics: {
      bankBalance: m.bankBalance,
      overdueTotal: m.overdueTotal,
      upcomingExpenses: m.upcomingExpenses,
      netProfit: m.netProfit,
    },
  };
}
