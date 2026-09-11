import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

const SAFETY = 200000;

function buildData(days: number) {
  const data = [];
  let balance = 480000;
  const incomePerDay = days === 30 ? 10833 : days === 60 ? 8667 : 6000;
  const expensePerDay = days === 30 ? 13667 : days === 60 ? 6800 : 5444;

  for (let d = 1; d <= days; d++) {
    const isPayrollDay = d === 5 || d === 35 || d === 65;
    const isRentDay = d === 1 || d === 31 || d === 61;
    let income = incomePerDay + (d >= 20 && d <= 35 && days === 30 ? 5000 : 0);
    let expense = expensePerDay + (isPayrollDay ? 180000 : 0) + (isRentDay ? 65000 : 0);
    balance = balance + income - expense;

    data.push({
      day: `Day ${d}`,
      actual:    d <= 10 ? Math.round(balance) : undefined,
      projected: Math.round(Math.max(balance, 50000)),
      safety:    SAFETY,
    });
  }
  return data;
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${Math.round(n / 1000)}K`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl px-4 py-3 text-xs" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <p className="font-semibold mb-2" style={{ color: "#e8f0f8" }}>{label}</p>
      {payload.map((p: any) => p.value && (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="inline-block rounded-full w-2 h-2" style={{ background: p.color }} />
          <span style={{ color: "#7a9ab8" }}>{p.name}:</span>
          <span className="font-bold number-font" style={{ color: "#e8f0f8" }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

const TABS = [{ label: "30 days", days: 30 }, { label: "60 days", days: 60 }, { label: "90 days", days: 90 }] as const;

export default function CashFlow() {
  const [activeTab, setActiveTab] = useState<30 | 60 | 90>(30);
  const data = buildData(activeTab);
  const dipDay = data.findIndex((d) => (d.projected ?? 0) < SAFETY + 50000);
  const dipBalance = dipDay >= 0 ? data[dipDay].projected : null;
  const dipLabel = dipDay >= 0 ? data[dipDay].day : null;

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1050px] mx-auto">
      <div className="mb-6">
        <h1 className="font-bold text-xl md:text-2xl mb-1" style={{ color: "#e8f0f8", letterSpacing: "-0.02em" }}>
          Will I have enough money?
        </h1>
        <p className="text-sm" style={{ color: "#7a9ab8" }}>Your expected cash balance over the next 90 days.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(({ label, days }) => (
          <button key={days} onClick={() => setActiveTab(days)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === days ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
              border: activeTab === days ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.07)",
              color: activeTab === days ? "#10b981" : "#7a9ab8",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Alert banner */}
      {dipLabel && activeTab <= 30 && (
        <div className="rounded-2xl px-5 py-4 mb-5 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <span style={{ fontSize: 20 }}>⚠</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#e8f0f8" }}>Possible cash dip</p>
            <p className="text-sm" style={{ color: "#7a9ab8" }}>
              Around {dipLabel}, your balance could drop to {fmt(dipBalance ?? 0)} — close to your safety level.
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl p-4 md:p-6 mb-5 fade-in" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-sm font-semibold mb-4" style={{ color: "#e8f0f8" }}>Cash balance — {activeTab}-day outlook</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fill: "#3d5a78", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false}
              interval={activeTab === 30 ? 4 : activeTab === 60 ? 9 : 14} />
            <YAxis tick={{ fill: "#3d5a78", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false}
              tickFormatter={fmt} width={56} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={SAFETY} stroke="#f59e0b" strokeDasharray="5 4" strokeWidth={1.5}
              label={{ value: "Safety level", fill: "#f59e0b", fontSize: 10, position: "insideTopRight" }} />
            <Area type="monotone" dataKey="actual" name="Actual" stroke="#06b6d4" strokeWidth={2} fill="url(#actualGrad)" dot={false} connectNulls={false} />
            <Area type="monotone" dataKey="projected" name="Projected" stroke="#10b981" strokeWidth={2} fill="url(#projGrad)" dot={false} strokeDasharray={activeTab > 30 ? "5 3" : undefined} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-center leading-relaxed" style={{ color: "#7a9ab8" }}>
        If customers pay on time, you're likely to stay comfortable.<br />
        If payments are delayed, cash could get tight — especially around Day 24.
      </p>
    </div>
  );
}
