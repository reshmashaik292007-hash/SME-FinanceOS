export function calculatePulseScore({ business, invoices, expenses }) {
  const overdue = invoices.filter((i) => i.status === "OVERDUE");
  const pending = invoices.filter((i) => i.status === "PENDING");
  const overdueTotal = overdue.reduce((s, i) => s + i.amount, 0);
  const pendingTotal = pending.reduce((s, i) => s + i.amount, 0);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // e.g. "2026-09"
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7); // e.g. "2026-08"

  const monthExp = expenses.filter((e) => e.date?.startsWith(currentMonth));
  const upcomingExpenses = monthExp.reduce((s, e) => s + e.amount, 0);

  const bankBalance = business.bankBalance;

  // Cash on hand (25%)
  const cashRatio = bankBalance / (upcomingExpenses || 1);
  const cashScore = Math.min(100, Math.round(cashRatio * 80));

  // Receivables (20%)
  const totalRec = overdueTotal + pendingTotal;
  const overdueRatio = totalRec > 0 ? overdueTotal / totalRec : 0;
  const receivablesScore = Math.round((1 - overdueRatio) * 100);

  // Expense coverage (20%)
  const expCoverage = bankBalance / (upcomingExpenses || 1);
  const expenseScore = Math.min(100, Math.round(expCoverage * 60));

  // Spending trend (15%)
  const softSep = monthExp.filter((e) => e.category === "Software").reduce((s, e) => s + e.amount, 0);
  const softAug = expenses
    .filter((e) => e.category === "Software" && e.date?.startsWith(prevMonth))
    .reduce((s, e) => s + e.amount, 0);
  const softAnomaly = softAug > 0 && (softSep - softAug) / softAug > 0.2 ? 20 : 0;
  const spendingScore = Math.max(0, 90 - softAnomaly);

  // Profitability (20%)
  const paidThisMonth = invoices
    .filter((i) => i.status === "PAID" && i.paidDate?.startsWith(currentMonth))
    .reduce((s, i) => s + i.amount, 0);
  const grossMargin = paidThisMonth > 0
    ? Math.round(((paidThisMonth - upcomingExpenses) / paidThisMonth) * 100)
    : 0;
  const profitScore = Math.min(100, Math.max(0, Math.round(grossMargin * 2.8)));

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
      bankBalance,
      overdueTotal,
      upcomingExpenses,
      netProfit: paidThisMonth - upcomingExpenses,
    },
  };
}