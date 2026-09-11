import { invoices, expenses, subscriptions, calcMetrics, calcPulseScore } from "../data/seed";
import { BASE_URL } from "./api";

export type AssistantMessage = {
  role: "user" | "ai";
  text: string;
  action?: { label: string; href: string };
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} lakh`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const overdue = invoices.filter((i) => i.status === "OVERDUE");
const overdueTotal = overdue.reduce((s, i) => s + i.amount, 0);
const raviInv = overdue.find((i) => i.customer === "Ravi Traders");
const m = calcMetrics();
const pulse = calcPulseScore();

function match(text: string, ...patterns: string[]) {
  const t = text.toLowerCase();
  return patterns.some((p) => t.includes(p));
}

export function answerQuestion(question: string): AssistantMessage {
  const q = question.toLowerCase();

  if (match(q, "how much money", "bank balance", "available", "how much cash", "cash do i have", "how much do i have")) {
    return {
      role: "ai",
      text: `You have ${fmt(m.bankBalance)} available in your bank right now. Your overall financial health score is ${pulse.score} out of 100 — that's ${pulse.status.toLowerCase()}.`,
    };
  }

  if (match(q, "ravi trader", "ravi")) {
    return {
      role: "ai",
      text: `Ravi Traders owes you ${fmt(raviInv?.amount ?? 48000)} and is ${raviInv?.daysOverdue ?? 23} days late. They have also paid late on two earlier invoices. This is your highest priority collection.`,
      action: { label: "View payment reminder", href: "/agents" },
    };
  }

  if (match(q, "who owes", "overdue", "late payment", "collect", "who has not paid", "unpaid", "receivable")) {
    const names = overdue.map((i) => `${i.customer} (${fmt(i.amount)})`).slice(0, 3).join(", ");
    return {
      role: "ai",
      text: `${overdue.length} customers owe you a total of ${fmt(overdueTotal)}. The biggest: ${names}. Ravi Traders is the most overdue at ${raviInv?.daysOverdue ?? 23} days.`,
      action: { label: "See all payments", href: "/invoices" },
    };
  }

  if (match(q, "remind ravi", "send reminder", "reminder", "email ravi", "message ravi")) {
    return {
      role: "ai",
      text: `I found Ravi Traders' ${fmt(raviInv?.amount ?? 48000)} overdue invoice. I've prepared a payment reminder for you.`,
      action: { label: "View reminder", href: "/agents" },
    };
  }

  if (match(q, "subscription", "cloudsuite", "unused", "not being used", "software")) {
    const cloudSub = subscriptions.find((s) => s.name === "CloudSuite Pro");
    return {
      role: "ai",
      text: `CloudSuite Pro costs ${fmt(cloudSub?.amount ?? 6999)} every month, but there's no record of it being used since May. You could save ${fmt(cloudSub?.amount ?? 6999)} per month by cancelling it.`,
      action: { label: "Review spending", href: "/expenses" },
    };
  }

  if (match(q, "spending", "expenses", "where is my money going", "where am i spending", "costs")) {
    const softTotal = m.softwareSep;
    return {
      role: "ai",
      text: `This month you've spent ${fmt(m.upcomingExpenses)} in total. Software costs have gone up ${m.softwareTrendPct}% compared to last month — and one subscription may not be needed. I also noticed a possible duplicate charge.`,
      action: { label: "Review spending", href: "/expenses" },
    };
  }

  if (match(q, "will i have enough", "cash flow", "next month", "enough money", "future", "30 days", "90 days")) {
    return {
      role: "ai",
      text: `Based on your current invoices and expenses, your cash could dip to around ₹1.86 lakh around Day 24 — which is close to your safety threshold. If customers pay on time, you'll be fine. If not, it could get tight.`,
      action: { label: "See cash forecast", href: "/cash-flow" },
    };
  }

  if (match(q, "profit", "profitable", "margin", "making money")) {
    return {
      role: "ai",
      text: `Your business is profitable. Net profit this month is ${fmt(m.netProfit)}, and your gross margin is around ${m.grossMargin}%. That's a healthy position — the main concern is collecting overdue payments.`,
    };
  }

  if (match(q, "health", "score", "how am i doing", "how is my business", "pulse")) {
    return {
      role: "ai",
      text: `Your business health score is ${pulse.score} out of 100 — that's ${pulse.status.toLowerCase()}. Your cash and profitability are strong, but ${fmt(overdueTotal)} in overdue payments is pulling the score down a little.`,
    };
  }

  if (match(q, "what should i do", "next step", "best action", "advice", "recommend", "priority")) {
    return {
      role: "ai",
      text: `Your most important action right now: collect ${fmt(raviInv?.amount ?? 48000)} from Ravi Traders. This single payment would improve your cash position before the expected dip in 24 days.`,
      action: { label: "View payment reminder", href: "/agents" },
    };
  }

  if (match(q, "run analysis", "check my business", "analyse", "analyze", "ai team")) {
    return {
      role: "ai",
      text: `Sure! Your AI finance team can do a full check of your business. They'll look at cash flow, overdue payments, spending risks, and give you one clear recommendation.`,
      action: { label: "Run analysis", href: "/agents" },
    };
  }

  // Generic fallback
  return {
    role: "ai",
    text: `I can help you with questions like: "Who owes me money?", "How much cash do I have?", "Will I have enough next month?", "Where am I spending too much?", or "What should I do today?"`,
  };
}

// POST /api/assistant wrapper with fallback
export async function askAssistant(question: string): Promise<AssistantMessage> {
  try {
    const res = await fetch(`${BASE_URL}/api/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(localStorage.getItem("finpilot_token") ? { Authorization: `Bearer ${localStorage.getItem("finpilot_token")}` } : {}) },
      body: JSON.stringify({
        message: question,
        context: { invoices, expenses, subscriptions, metrics: m, pulse: calcPulseScore() },
      }),
    });
    if (!res.ok) throw new Error("non-200");
    const data = await res.json();
    return { role: "ai", text: data.response, action: data.suggestedAction };
  } catch {
    return answerQuestion(question);
  }
}
