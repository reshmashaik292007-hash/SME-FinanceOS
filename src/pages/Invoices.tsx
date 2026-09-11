import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, X, CheckCircle, Trash2 } from "lucide-react";
import { useData, nextInvoiceId, type Invoice, type InvoiceStatus, type RiskLevel } from "../context/DataContext";

type ToastFn = (msg: string, type?: "success" | "info" | "error") => void;

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  PAID:    { bg: "rgba(16,185,129,0.1)",  color: "#10b981", label: "Paid" },
  PENDING: { bg: "rgba(6,182,212,0.1)",   color: "#06b6d4", label: "Pending" },
  OVERDUE: { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "Overdue" },
};

type Filter = "ALL" | "OVERDUE" | "PENDING" | "PAID";
const FILTERS: Filter[] = ["ALL", "OVERDUE", "PENDING", "PAID"];
const FILTER_LABELS: Record<Filter, string> = { ALL: "All", OVERDUE: "Overdue", PENDING: "Pending", PAID: "Paid" };

const CATEGORIES = ["Rent","Payroll","Supplies","Software","Utilities","Marketing","Travel","Operations"];

type FormState = {
  customer: string;
  id: string;
  amount: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
};

const emptyForm = (): FormState => ({
  customer: "",
  id: nextInvoiceId(),
  amount: "",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  status: "PENDING",
});

export default function Invoices({ addToast }: { addToast: ToastFn }) {
  const navigate = useNavigate();
  const { state, dispatch, metrics } = useData();
  const [filter, setFilter]       = useState<Filter>("ALL");
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<FormState>(emptyForm);

  const overdue = state.invoices.filter((i) => i.status === "OVERDUE");
  const pending = state.invoices.filter((i) => i.status === "PENDING");
  const paid    = state.invoices.filter((i) => i.status === "PAID");
  const overdueTotal = overdue.reduce((s, i) => s + i.amount, 0);
  const pendingTotal = pending.reduce((s, i) => s + i.amount, 0);
  const paidTotal    = paid.reduce((s, i) => s + i.amount, 0);

  const filtered = state.invoices.filter((inv) => {
    const fm = filter === "ALL" || inv.status === filter;
    const sm = !search || inv.customer.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    return fm && sm;
  });

  function submitForm() {
    const amount = parseFloat(form.amount);
    if (!form.customer.trim() || isNaN(amount) || amount <= 0 || !form.dueDate) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const isOverdue = form.dueDate < today && form.status !== "PAID";
    const daysOverdue = isOverdue
      ? Math.floor((Date.now() - new Date(form.dueDate).getTime()) / 86400000)
      : 0;
    const newInvoice: Invoice = {
      id: form.id,
      customer: form.customer.trim(),
      amount,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      status: isOverdue ? "OVERDUE" : form.status,
      paidDate: form.status === "PAID" ? today : null,
      daysOverdue,
      risk: daysOverdue > 14 ? "HIGH" : daysOverdue > 0 ? "MEDIUM" : "LOW",
    };
    dispatch({ type: "ADD_INVOICE", payload: newInvoice });
    addToast("Invoice added ✓");
    setShowForm(false);
    setForm(emptyForm());
  }

  function markPaid(id: string, customer: string) {
    dispatch({ type: "PAY_INVOICE", id });
    addToast(`Invoice marked as paid ✓`);
  }

  function deleteInvoice(id: string) {
    dispatch({ type: "DELETE_INVOICE", id });
    addToast("Invoice deleted.", "info");
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-bold text-xl md:text-2xl mb-1" style={{ color: "#e8f0f8", letterSpacing: "-0.02em" }}>Customer payments</h1>
          <p className="text-sm" style={{ color: "#7a9ab8" }}>See who has paid and who still owes you.</p>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setForm(emptyForm()); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
          <Plus size={15} /> Add Invoice
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Customers owe you", value: fmt(overdueTotal + pendingTotal), color: "#e8f0f8" },
          { label: "Overdue",           value: fmt(overdueTotal),                color: "#ef4444" },
          { label: "Collected so far",  value: fmt(paidTotal),                  color: "#10b981" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl p-4" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs mb-1.5" style={{ color: "#3d5a78" }}>{c.label}</p>
            <p className="font-bold number-font text-xl" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Add invoice form */}
      {showForm && (
        <div className="rounded-2xl p-5 mb-5 slide-up" style={{ background: "#0e1c2e", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold" style={{ color: "#e8f0f8" }}>New Invoice</p>
            <button onClick={() => setShowForm(false)}><X size={16} color="#7a9ab8" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              { label: "Customer name *", key: "customer", type: "text", placeholder: "e.g. Ravi Traders" },
              { label: "Invoice number", key: "id", type: "text", placeholder: "INV-1101" },
              { label: "Amount (₹) *", key: "amount", type: "number", placeholder: "e.g. 25000" },
              { label: "Issue date *", key: "issueDate", type: "date" },
              { label: "Due date *", key: "dueDate", type: "date" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1" style={{ color: "#3d5a78" }}>{label}</label>
                <input type={type} placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.08)", color: "#e8f0f8" }} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#3d5a78" }}>Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as InvoiceStatus }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "#132235", border: "1px solid rgba(255,255,255,0.08)", color: "#e8f0f8" }}>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={submitForm}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
              Add Invoice
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.04)", color: "#7a9ab8" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: filter === f ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)", border: filter === f ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.06)", color: filter === f ? "#10b981" : "#7a9ab8" }}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto px-3 py-1.5 rounded-xl" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search size={13} color="#3d5a78" />
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs outline-none w-32 md:w-48" style={{ color: "#e8f0f8" }} />
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((inv) => {
          const s = STATUS_STYLES[inv.status];
          const isOverdue = inv.status === "OVERDUE";
          return (
            <div key={inv.id} className="rounded-2xl p-4"
              style={{ background: "#0e1c2e", border: `1px solid ${isOverdue ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.07)"}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold" style={{ color: "#e8f0f8" }}>{inv.customer}</p>
                  <p className="text-xs" style={{ color: "#3d5a78" }}>{inv.id}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold number-font" style={{ color: isOverdue ? "#ef4444" : "#e8f0f8" }}>{fmt(inv.amount)}</p>
                  {inv.daysOverdue > 0
                    ? <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>{inv.daysOverdue} days late</p>
                    : <p className="text-xs" style={{ color: "#3d5a78" }}>Due {inv.dueDate}</p>}
                </div>
                <div className="flex gap-2">
                  {isOverdue && (
                    <button onClick={() => markPaid(inv.id, inv.customer)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
                      Mark paid
                    </button>
                  )}
                  {isOverdue && (
                    <button onClick={() => { navigate("/agents"); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                      style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
                      Remind
                    </button>
                  )}
                  <button onClick={() => deleteInvoice(inv.id)} className="p-1.5 rounded-lg hover:bg-white/5">
                    <Trash2 size={13} color="#3d5a78" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center py-8 text-sm" style={{ color: "#3d5a78" }}>No invoices match your filter.</p>}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid text-xs font-semibold px-5 py-3"
          style={{ gridTemplateColumns: "1fr 1.5fr 1fr 1fr 90px 80px 1fr", color: "#3d5a78", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span>INVOICE</span><span>CUSTOMER</span><span>AMOUNT</span><span>DUE DATE</span><span>STATUS</span><span>LATE</span><span>ACTIONS</span>
        </div>
        {filtered.map((inv, i) => {
          const s = STATUS_STYLES[inv.status];
          const isOverdue = inv.status === "OVERDUE";
          return (
            <div key={inv.id} className="grid px-5 py-3.5 text-sm hover:bg-white/[0.015] transition-colors"
              style={{ gridTemplateColumns: "1fr 1.5fr 1fr 1fr 90px 80px 1fr", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined, background: isOverdue ? "rgba(239,68,68,0.02)" : undefined, alignItems: "center" }}>
              <span className="text-xs font-medium" style={{ color: "#3d5a78" }}>{inv.id}</span>
              <span className="font-medium truncate" style={{ color: "#e8f0f8" }}>{inv.customer}</span>
              <span className="font-bold number-font" style={{ color: isOverdue ? "#ef4444" : "#e8f0f8" }}>{fmt(inv.amount)}</span>
              <span style={{ color: "#7a9ab8" }}>{inv.dueDate}</span>
              <span><span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: s.bg, color: s.color }}>{s.label}</span></span>
              <span className="text-xs number-font font-semibold" style={{ color: inv.daysOverdue > 0 ? "#ef4444" : "#3d5a78" }}>
                {inv.daysOverdue > 0 ? `${inv.daysOverdue}d` : "—"}
              </span>
              <div className="flex items-center gap-2">
                {isOverdue && (
                  <button onClick={() => markPaid(inv.id, inv.customer)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:scale-105"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
                    <CheckCircle size={11} /> Paid
                  </button>
                )}
                {isOverdue && (
                  <button onClick={() => navigate("/agents")}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:scale-105"
                    style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
                    Remind
                  </button>
                )}
                <button onClick={() => deleteInvoice(inv.id)} className="p-1 rounded-lg hover:bg-white/5 ml-auto">
                  <Trash2 size={13} color="#3d5a78" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="px-5 py-10 text-center text-sm" style={{ color: "#3d5a78" }}>No invoices match your filter.</div>}
      </div>
    </div>
  );
}
