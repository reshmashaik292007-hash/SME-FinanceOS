import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useData, nextExpenseId, type Expense } from "../context/DataContext";

type ToastFn = (msg: string, type?: "success" | "info" | "error") => void;

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const CATEGORIES = ["Rent","Payroll","Supplies","Software","Utilities","Marketing","Travel","Operations"];

const CATEGORY_COLORS: Record<string, string> = {
  Rent: "#7a9ab8", Payroll: "#7a9ab8", Software: "#f59e0b",
  Utilities: "#7a9ab8", Supplies: "#06b6d4", Marketing: "#a78bfa",
  Travel: "#7a9ab8", Operations: "#7a9ab8",
};

type FormState = { merchant: string; category: string; amount: string; date: string; recurring: boolean; description: string };
const emptyForm = (): FormState => ({
  merchant: "", category: "Supplies", amount: "",
  date: new Date().toISOString().slice(0, 10),
  recurring: false, description: "",
});

export default function Expenses({ addToast }: { addToast: ToastFn }) {
  const { state, dispatch } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<FormState>(emptyForm());

  const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-09"
  const currentMonth = state.expenses.filter((e) => e.date.startsWith(currentMonthStr));
  const totalSpend    = currentMonth.reduce((s, e) => s + e.amount, 0);
  const recurringSpend = currentMonth.filter((e) => e.recurring).reduce((s, e) => s + e.amount, 0);

  function submitForm() {
    const amount = parseFloat(form.amount);
    if (!form.merchant.trim() || isNaN(amount) || amount <= 0) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    const newExpense: Expense = {
      id: nextExpenseId(),
      date: form.date,
      merchant: form.merchant.trim(),
      category: form.category,
      amount,
      description: form.description || form.category,
      recurring: form.recurring,
      risk: form.category === "Software" ? "MEDIUM" : "LOW",
    };
    dispatch({ type: "ADD_EXPENSE", payload: newExpense });
    addToast("Expense added ✓");
    setShowForm(false);
    setForm(emptyForm());
  }

  function deleteExpense(id: string) {
    dispatch({ type: "DELETE_EXPENSE", id });
    addToast("Expense deleted.", "info");
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-bold text-xl md:text-2xl mb-1" style={{ color: "#e8f0f8", letterSpacing: "-0.02em" }}>Business spending</h1>
          <p className="text-sm" style={{ color: "#7a9ab8" }}>See where your money is going.</p>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setForm(emptyForm()); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "This month",         value: fmt(totalSpend),    color: "#e8f0f8" },
          { label: "Fixed monthly costs", value: fmt(recurringSpend), color: "#06b6d4" },
          { label: "Potential savings",   value: "₹6,999/mo",        color: "#10b981" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-4" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs mb-1.5" style={{ color: "#3d5a78" }}>{c.label}</p>
            <p className="font-bold number-font text-xl" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Add expense form */}
      {showForm && (
        <div className="rounded-2xl p-5 mb-5 slide-up" style={{ background: "#0e1c2e", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold" style={{ color: "#e8f0f8" }}>New Expense</p>
            <button onClick={() => setShowForm(false)}><X size={16} color="#7a9ab8" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3d5a78" }}>Merchant *</label>
              <input type="text" placeholder="e.g. Woodland Timber" value={form.merchant}
                onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.08)", color: "#e8f0f8" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3d5a78" }}>Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.08)", color: "#e8f0f8" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3d5a78" }}>Amount (₹) *</label>
              <input type="number" placeholder="e.g. 5000" value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.08)", color: "#e8f0f8" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3d5a78" }}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.08)", color: "#e8f0f8" }} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "#3d5a78" }}>Description</label>
              <input type="text" placeholder="Optional description" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.08)", color: "#e8f0f8" }} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="recurring" checked={form.recurring}
                onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))}
                className="w-4 h-4 rounded" />
              <label htmlFor="recurring" className="text-sm" style={{ color: "#7a9ab8" }}>Recurring monthly</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={submitForm}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
              Add Expense
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.04)", color: "#7a9ab8" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI flags */}
      <div className="mb-5">
        <h2 className="font-semibold mb-3" style={{ color: "#e8f0f8" }}>Things worth looking at</h2>
        <div className="flex flex-col gap-3">
          {[
            { title: "CloudSuite Pro may not be needed", detail: "₹6,999/month — no usage detected since May.", tag: "May save ₹6,999/mo", tagColor: "#ef4444" },
            { title: "Possible duplicate charge",        detail: "CloudSuite Pro appears charged twice this month.", tag: "Check this", tagColor: "#f59e0b" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl p-4 flex items-start gap-4"
              style={{ background: "#0e1c2e", border: "1px solid rgba(239,68,68,0.12)" }}>
              <span style={{ fontSize: 18 }}>⚠</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-0.5" style={{ color: "#e8f0f8" }}>{f.title}</p>
                <p className="text-sm" style={{ color: "#7a9ab8" }}>{f.detail}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                style={{ background: `${f.tagColor}18`, color: f.tagColor, border: `1px solid ${f.tagColor}28` }}>
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <h2 className="font-semibold mb-3" style={{ color: "#e8f0f8" }}>
        {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}
      </h2>
      <div className="flex flex-col gap-2 md:hidden">
        {currentMonth.map((exp) => {
          const catColor = CATEGORY_COLORS[exp.category] || "#7a9ab8";
          const isFlag   = exp.risk === "HIGH";
          return (
            <div key={exp.id} className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
              style={{ background: "#0e1c2e", border: `1px solid ${isFlag ? "rgba(239,68,68,0.14)" : "rgba(255,255,255,0.06)"}` }}>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg shrink-0" style={{ background: `${catColor}14`, color: catColor }}>{exp.category}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#e8f0f8" }}>{exp.merchant}</p>
                <p className="text-xs truncate" style={{ color: "#3d5a78" }}>{exp.description}</p>
              </div>
              <p className="font-bold number-font text-sm shrink-0" style={{ color: isFlag ? "#ef4444" : "#e8f0f8" }}>{fmt(exp.amount)}</p>
              <button onClick={() => deleteExpense(exp.id)} className="p-1 rounded-lg hover:bg-white/5 shrink-0">
                <Trash2 size={13} color="#3d5a78" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid text-xs font-semibold px-5 py-3"
          style={{ gridTemplateColumns: "90px 1.5fr 1fr 1fr 80px 36px", color: "#3d5a78", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span>DATE</span><span>MERCHANT</span><span>CATEGORY</span><span>AMOUNT</span><span>FLAG</span><span />
        </div>
        {currentMonth.map((exp, i) => {
          const catColor = CATEGORY_COLORS[exp.category] || "#7a9ab8";
          const isFlag   = exp.risk === "HIGH";
          return (
            <div key={exp.id} className="grid px-5 py-3.5 text-sm hover:bg-white/[0.015] transition-colors"
              style={{ gridTemplateColumns: "90px 1.5fr 1fr 1fr 80px 36px", borderBottom: i < currentMonth.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined, background: isFlag ? "rgba(239,68,68,0.02)" : undefined, alignItems: "center" }}>
              <span className="text-xs" style={{ color: "#3d5a78" }}>{exp.date.slice(5)}</span>
              <div className="min-w-0">
                <p className="font-medium truncate" style={{ color: "#e8f0f8" }}>{exp.merchant}</p>
                <p className="text-xs truncate" style={{ color: "#3d5a78" }}>{exp.description}</p>
              </div>
              <span><span className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: `${catColor}14`, color: catColor }}>{exp.category}</span></span>
              <span className="font-bold number-font" style={{ color: isFlag ? "#ef4444" : "#e8f0f8" }}>{fmt(exp.amount)}</span>
              <span>
                {isFlag
                  ? <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                      {exp.description.toLowerCase().includes("duplicate") ? "Duplicate" : "Unused"}
                    </span>
                  : <span style={{ color: "#3d5a78" }}>—</span>}
              </span>
              <button onClick={() => deleteExpense(exp.id)} className="p-1 rounded-lg hover:bg-white/5 justify-self-end">
                <Trash2 size={13} color="#3d5a78" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
