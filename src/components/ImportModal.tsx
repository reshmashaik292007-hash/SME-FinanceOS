import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, ChevronDown, Trash2 } from "lucide-react";
import { useData, nextInvoiceId, nextExpenseId, type Invoice, type Expense, type ImportBatch } from "../context/DataContext";
import { useLang } from "../context/LangContext";

type DataType = "invoices" | "expenses" | "transactions";
type Step = "type" | "upload" | "map" | "confirm" | "success";

type RawRow = Record<string, string | number | null>;

interface MappedInvoice {
  customer: string; invoiceNumber: string; amount: number;
  issueDate: string; dueDate: string; status: string;
}
interface MappedExpense {
  merchant: string; category: string; amount: number; date: string; description: string;
}

// ── Column name aliases ───────────────────────────────────────────────────
function findCol(keys: string[], aliases: string[]): string | undefined {
  const lower = keys.map((k) => k.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = lower.findIndex((l) => l.includes(alias));
    if (idx !== -1) return keys[idx];
  }
  return undefined;
}

function toDateStr(raw: string | number | null): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  if (typeof raw === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(raw);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const d = new Date(String(raw));
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function toAmount(raw: string | number | null): number {
  if (!raw) return 0;
  const n = parseFloat(String(raw).replace(/[₹,\s]/g, ""));
  return isNaN(n) ? 0 : Math.abs(n);
}

// ── Parse sheets ──────────────────────────────────────────────────────────
function parseFile(file: File): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: null, raw: false });
        resolve(rows as RawRow[]);
      } catch { reject(new Error("Could not read this file.")); }
    };
    reader.onerror = () => reject(new Error("File read failed."));
    reader.readAsBinaryString(file);
  });
}

function detectDataType(keys: string[]): DataType {
  const lower = keys.join(" ").toLowerCase();
  if (lower.includes("invoice") || lower.includes("customer") || lower.includes("client")) return "invoices";
  if (lower.includes("merchant") || lower.includes("vendor") || lower.includes("payee")) return "expenses";
  return "transactions";
}

// ── Map rows to invoices ──────────────────────────────────────────────────
function mapInvoiceRows(rows: RawRow[]): { valid: MappedInvoice[]; errors: string[] } {
  const keys = Object.keys(rows[0] || {});
  const customerCol  = findCol(keys, ["customer", "client", "customer name"]);
  const amountCol    = findCol(keys, ["amount", "total", "invoice amount", "value"]);
  const issueDateCol = findCol(keys, ["issue date", "invoice date", "date"]);
  const dueDateCol   = findCol(keys, ["due date", "due", "payment due"]);
  const statusCol    = findCol(keys, ["status", "payment status"]);
  const invNumCol    = findCol(keys, ["invoice number", "invoice no", "invoice id", "inv no"]);

  const valid: MappedInvoice[] = [];
  const errors: string[] = [];
  rows.forEach((row, i) => {
    const customer = customerCol ? String(row[customerCol] || "").trim() : "";
    const amount   = amountCol ? toAmount(row[amountCol]) : 0;
    if (!customer) { errors.push(`Row ${i + 2}: missing customer name`); return; }
    if (amount <= 0) { errors.push(`Row ${i + 2}: invalid amount`); return; }
    const status   = statusCol ? String(row[statusCol] || "").toUpperCase() : "PENDING";
    const normStatus = status.includes("PAID") ? "PAID" : status.includes("OVER") ? "OVERDUE" : "PENDING";
    valid.push({
      customer,
      invoiceNumber: invNumCol ? String(row[invNumCol] || "") : "",
      amount,
      issueDate: issueDateCol ? toDateStr(row[issueDateCol] as string | number) : new Date().toISOString().slice(0, 10),
      dueDate:   dueDateCol   ? toDateStr(row[dueDateCol]   as string | number) : new Date().toISOString().slice(0, 10),
      status: normStatus,
    });
  });
  return { valid, errors };
}

function mapExpenseRows(rows: RawRow[]): { valid: MappedExpense[]; errors: string[] } {
  const keys = Object.keys(rows[0] || {});
  const merchantCol  = findCol(keys, ["merchant", "vendor", "payee", "description", "narration", "details"]);
  const amountCol    = findCol(keys, ["amount", "value", "debit", "withdrawal", "expense"]);
  const dateCol      = findCol(keys, ["date", "transaction date", "txn date"]);
  const categoryCol  = findCol(keys, ["category", "expense type", "type"]);

  const valid: MappedExpense[] = [];
  const errors: string[] = [];
  rows.forEach((row, i) => {
    const merchant = merchantCol ? String(row[merchantCol] || "").trim() : "";
    const amount   = amountCol ? toAmount(row[amountCol]) : 0;
    if (!merchant) { errors.push(`Row ${i + 2}: missing merchant`); return; }
    if (amount <= 0) { errors.push(`Row ${i + 2}: invalid amount`); return; }
    valid.push({
      merchant,
      amount,
      date:     dateCol     ? toDateStr(row[dateCol]     as string | number) : new Date().toISOString().slice(0, 10),
      category: categoryCol ? String(row[categoryCol] || "Operations").trim() : "Operations",
      description: merchant,
    });
  });
  return { valid, errors };
}

// ── Duplicate detection ───────────────────────────────────────────────────
function detectDupeInvoices(incoming: MappedInvoice[], existing: Invoice[]): number {
  let count = 0;
  for (const inv of incoming) {
    if (existing.some((e) => e.customer === inv.customer && e.amount === inv.amount && e.dueDate === inv.dueDate)) count++;
  }
  return count;
}
function detectDupeExpenses(incoming: MappedExpense[], existing: Expense[]): number {
  let count = 0;
  for (const exp of incoming) {
    if (existing.some((e) => e.merchant === exp.merchant && e.amount === exp.amount && e.date === exp.date)) count++;
  }
  return count;
}

// ── Format helper ─────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ── Main component ────────────────────────────────────────────────────────
type Props = {
  onClose: () => void;
  addToast: (msg: string, type?: "success" | "info" | "error") => void;
};

export default function ImportModal({ onClose, addToast }: Props) {
  const { state, dispatch } = useData();
  const { t } = useLang();

  const [step, setStep]                   = useState<Step>("type");
  const [dataType, setDataType]           = useState<DataType>("invoices");
  const [dragging, setDragging]           = useState(false);
  const [fileName, setFileName]           = useState("");
  const [rawRows, setRawRows]             = useState<RawRow[]>([]);
  const [validInvoices, setValidInvoices] = useState<MappedInvoice[]>([]);
  const [validExpenses, setValidExpenses] = useState<MappedExpense[]>([]);
  const [errors, setErrors]              = useState<string[]>([]);
  const [dupeCount, setDupeCount]         = useState(0);
  const [skipDupes, setSkipDupes]         = useState(true);
  const [parseError, setParseError]       = useState("");
  const [totalValue, setTotalValue]       = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      setParseError("Please upload an XLSX, XLS or CSV file.");
      return;
    }
    setParseError("");
    setFileName(file.name);
    try {
      const rows = await parseFile(file);
      if (!rows.length) { setParseError("This file appears to be empty."); return; }
      setRawRows(rows);

      const detectedType = detectDataType(Object.keys(rows[0]));
      setDataType(detectedType);

      if (detectedType === "invoices" || dataType === "invoices") {
        const { valid, errors: errs } = mapInvoiceRows(rows);
        setValidInvoices(valid);
        setErrors(errs);
        setDupeCount(detectDupeInvoices(valid, state.invoices));
        setTotalValue(valid.reduce((s, i) => s + i.amount, 0));
        setDataType("invoices");
      } else {
        const { valid, errors: errs } = mapExpenseRows(rows);
        setValidExpenses(valid);
        setErrors(errs);
        setDupeCount(detectDupeExpenses(valid, state.expenses));
        setTotalValue(valid.reduce((s, e) => s + e.amount, 0));
        setDataType(detectedType === "expenses" ? "expenses" : "expenses");
      }
      setStep("map");
    } catch (e: unknown) {
      setParseError((e as Error).message || "We couldn't read this file.");
    }
  }, [dataType, state]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function doImport() {
    const batchId = `batch-${Date.now()}`;
    const now = new Date().toISOString();

    if (dataType === "invoices") {
      let list = validInvoices;
      if (skipDupes) list = list.filter((inv) => !state.invoices.some((e) => e.customer === inv.customer && e.amount === inv.amount && e.dueDate === inv.dueDate));
      const today = new Date().toISOString().slice(0, 10);
      const invoices: Invoice[] = list.map((inv) => ({
        id: nextInvoiceId(),
        customer: inv.customer,
        amount: inv.amount,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        status: (["PAID","PENDING","OVERDUE"].includes(inv.status) ? inv.status : "PENDING") as Invoice["status"],
        paidDate: inv.status === "PAID" ? today : null,
        daysOverdue: inv.status === "OVERDUE" ? 7 : 0,
        risk: "LOW",
        source: "imported",
      } as Invoice & { source: string }));
      const batch: ImportBatch = { id: batchId, filename: fileName, dataType: "invoices", count: invoices.length, importedAt: now };
      dispatch({ type: "IMPORT_INVOICES", invoices, batch });
      setTotalValue(invoices.reduce((s, i) => s + i.amount, 0));
    } else {
      let list = validExpenses;
      if (skipDupes) list = list.filter((exp) => !state.expenses.some((e) => e.merchant === exp.merchant && e.amount === exp.amount && e.date === exp.date));
      const expenses: Expense[] = list.map((exp) => ({
        id: nextExpenseId(),
        date: exp.date,
        merchant: exp.merchant,
        category: exp.category,
        amount: exp.amount,
        description: exp.description,
        recurring: false,
        risk: "LOW",
        source: "imported",
      } as Expense & { source: string }));
      const batch: ImportBatch = { id: batchId, filename: fileName, dataType: "expenses", count: expenses.length, importedAt: now };
      dispatch({ type: "IMPORT_EXPENSES", expenses, batch });
      setTotalValue(expenses.reduce((s, e) => s + e.amount, 0));
    }
    setStep("success");
  }

  const previewRows = dataType === "invoices" ? validInvoices.slice(0, 6) : validExpenses.slice(0, 6);
  const validCount  = dataType === "invoices" ? validInvoices.length : validExpenses.length;
  const importCount = skipDupes ? validCount - dupeCount : validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl flex flex-col"
        style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h2 className="font-bold text-lg" style={{ color: "#e8f0f8" }}>{t("importTitle")}</h2>
            <p className="text-sm mt-0.5" style={{ color: "#7a9ab8" }}>{t("importSubtitle")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5"><X size={18} color="#7a9ab8" /></button>
        </div>

        {/* Step: type */}
        {step === "type" && (
          <div className="p-6 flex flex-col gap-4">
            <p className="font-semibold text-sm mb-1" style={{ color: "#e8f0f8" }}>What would you like to import?</p>
            {(["invoices","expenses","transactions"] as DataType[]).map((dt) => {
              const icons: Record<DataType, string> = { invoices: "🧾", expenses: "💸", transactions: "📄" };
              const labels: Record<DataType, string> = { invoices: "Customer Invoices", expenses: "Business Expenses", transactions: "Bank Transactions" };
              const descs: Record<DataType, string> = { invoices: "Invoice records — customers, amounts, due dates", expenses: "Business expenses — merchant, category, amount", transactions: "Bank transaction history" };
              const active = dataType === dt;
              return (
                <button key={dt} onClick={() => setDataType(dt)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{ background: active ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}` }}>
                  <span style={{ fontSize: 28 }}>{icons[dt]}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#e8f0f8" }}>{labels[dt]}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#7a9ab8" }}>{descs[dt]}</p>
                  </div>
                </button>
              );
            })}
            <button onClick={() => setStep("upload")}
              className="mt-2 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
              Continue →
            </button>
          </div>
        )}

        {/* Step: upload */}
        {step === "upload" && (
          <div className="p-6">
            <button onClick={() => setStep("type")} className="text-xs mb-4 flex items-center gap-1" style={{ color: "#7a9ab8" }}>← Back</button>
            {/* Drag zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all"
              style={{ border: `2px dashed ${dragging ? "#10b981" : "rgba(255,255,255,0.12)"}`, background: dragging ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)", padding: "40px 20px", minHeight: 200 }}>
              <FileSpreadsheet size={40} color={dragging ? "#10b981" : "#3d5a78"} />
              <p className="font-semibold" style={{ color: "#e8f0f8" }}>Drop your file here</p>
              <p className="text-sm" style={{ color: "#7a9ab8" }}>or click to browse</p>
              <p className="text-xs mt-1 px-3 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "#3d5a78" }}>XLSX · XLS · CSV</p>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            {parseError && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle size={14} color="#ef4444" />
                <p className="text-sm" style={{ color: "#ef4444" }}>{parseError}</p>
              </div>
            )}
            {/* Mobile file picker */}
            <button onClick={() => fileRef.current?.click()}
              className="mt-4 w-full py-3 rounded-2xl text-sm font-semibold md:hidden"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
              Choose file
            </button>
          </div>
        )}

        {/* Step: map + preview */}
        {step === "map" && (
          <div className="p-6 flex flex-col gap-4">
            <button onClick={() => setStep("upload")} className="text-xs mb-2 flex items-center gap-1" style={{ color: "#7a9ab8" }}>← Back</button>
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{rawRows.length} records detected</span>
              <span className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{validCount} valid</span>
              {errors.length > 0 && <span className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{errors.length} need attention</span>}
              {dupeCount > 0 && <span className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{dupeCount} possible duplicates</span>}
            </div>

            {/* Data type picker */}
            <div className="flex gap-2">
              {(["invoices","expenses"] as DataType[]).map((dt) => (
                <button key={dt} onClick={() => {
                  setDataType(dt);
                  if (dt === "invoices") { const r = mapInvoiceRows(rawRows); setValidInvoices(r.valid); setErrors(r.errors); setDupeCount(detectDupeInvoices(r.valid, state.invoices)); setTotalValue(r.valid.reduce((s,i)=>s+i.amount,0)); }
                  else { const r = mapExpenseRows(rawRows); setValidExpenses(r.valid); setErrors(r.errors); setDupeCount(detectDupeExpenses(r.valid, state.expenses)); setTotalValue(r.valid.reduce((s,e)=>s+e.amount,0)); }
                }}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: dataType === dt ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${dataType === dt ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`, color: dataType === dt ? "#10b981" : "#7a9ab8" }}>
                  {dt === "invoices" ? "🧾 Invoices" : "💸 Expenses"}
                </button>
              ))}
            </div>

            {/* Preview table */}
            <div>
              <p className="font-semibold text-sm mb-2" style={{ color: "#e8f0f8" }}>Preview — first rows</p>
              <div className="rounded-2xl overflow-hidden text-xs" style={{ background: "#071020", border: "1px solid rgba(255,255,255,0.06)" }}>
                {dataType === "invoices" ? (
                  <>
                    <div className="grid px-4 py-2.5 font-semibold" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 80px", color: "#3d5a78", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span>CUSTOMER</span><span>AMOUNT</span><span>DUE DATE</span><span>STATUS</span>
                    </div>
                    {(previewRows as MappedInvoice[]).map((r, i) => (
                      <div key={i} className="grid px-4 py-2.5" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 80px", borderBottom: i < previewRows.length-1 ? "1px solid rgba(255,255,255,0.04)" : undefined, alignItems: "center" }}>
                        <span className="truncate" style={{ color: "#e8f0f8" }}>{r.customer}</span>
                        <span style={{ color: "#10b981" }}>{fmt(r.amount)}</span>
                        <span style={{ color: "#7a9ab8" }}>{r.dueDate}</span>
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: r.status === "PAID" ? "rgba(16,185,129,0.1)" : r.status === "OVERDUE" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", color: r.status === "PAID" ? "#10b981" : r.status === "OVERDUE" ? "#ef4444" : "#f59e0b" }}>{r.status}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="grid px-4 py-2.5 font-semibold" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr", color: "#3d5a78", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span>MERCHANT</span><span>AMOUNT</span><span>DATE</span><span>CATEGORY</span>
                    </div>
                    {(previewRows as MappedExpense[]).map((r, i) => (
                      <div key={i} className="grid px-4 py-2.5" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr", borderBottom: i < previewRows.length-1 ? "1px solid rgba(255,255,255,0.04)" : undefined, alignItems: "center" }}>
                        <span className="truncate" style={{ color: "#e8f0f8" }}>{r.merchant}</span>
                        <span style={{ color: "#e8f0f8" }}>{fmt(r.amount)}</span>
                        <span style={{ color: "#7a9ab8" }}>{r.date}</span>
                        <span style={{ color: "#06b6d4" }}>{r.category}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {validCount > 6 && <p className="text-xs mt-1.5" style={{ color: "#3d5a78" }}>+ {validCount - 6} more rows</p>}
            </div>

            {/* Dupe option */}
            {dupeCount > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}>
                <AlertTriangle size={16} color="#f59e0b" className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#f59e0b" }}>{dupeCount} possible duplicate records found</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setSkipDupes(true)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: skipDupes ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)", color: skipDupes ? "#f59e0b" : "#7a9ab8" }}>Skip duplicates</button>
                    <button onClick={() => setSkipDupes(false)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: !skipDupes ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)", color: !skipDupes ? "#f59e0b" : "#7a9ab8" }}>Import anyway</button>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#ef4444" }}>{errors.length} records need attention</p>
                <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                  {errors.map((e, i) => <p key={i} className="text-xs" style={{ color: "#7a9ab8" }}>• {e}</p>)}
                </div>
              </div>
            )}

            <button onClick={() => setStep("confirm")} disabled={importCount <= 0}
              className="py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
              Import {importCount} records →
            </button>
          </div>
        )}

        {/* Step: confirm */}
        {step === "confirm" && (
          <div className="p-6 flex flex-col gap-4">
            <p className="font-bold text-base" style={{ color: "#e8f0f8" }}>Confirm import</p>
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#071020" }}>
              <div className="flex justify-between"><span style={{ color: "#7a9ab8" }}>File</span><span className="font-medium" style={{ color: "#e8f0f8" }}>{fileName}</span></div>
              <div className="flex justify-between"><span style={{ color: "#7a9ab8" }}>Data type</span><span className="font-medium" style={{ color: "#e8f0f8" }}>{dataType === "invoices" ? "Invoices" : "Expenses"}</span></div>
              <div className="flex justify-between"><span style={{ color: "#7a9ab8" }}>Records</span><span className="font-medium" style={{ color: "#10b981" }}>{importCount}</span></div>
              <div className="flex justify-between"><span style={{ color: "#7a9ab8" }}>Total value</span><span className="font-bold" style={{ color: "#10b981" }}>{fmt(totalValue)}</span></div>
              {skipDupes && dupeCount > 0 && <div className="flex justify-between"><span style={{ color: "#7a9ab8" }}>Skipping duplicates</span><span style={{ color: "#f59e0b" }}>{dupeCount}</span></div>}
            </div>
            <p className="text-sm" style={{ color: "#7a9ab8" }}>After import, your FinPilot will recalculate automatically.</p>
            <div className="flex gap-3">
              <button onClick={doImport}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
                Import {importCount} records
              </button>
              <button onClick={() => setStep("map")} className="px-5 py-3 rounded-2xl text-sm font-medium" style={{ background: "rgba(255,255,255,0.04)", color: "#7a9ab8" }}>Back</button>
            </div>
          </div>
        )}

        {/* Step: success */}
        {step === "success" && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mt-2" style={{ background: "rgba(16,185,129,0.15)" }}>
              <CheckCircle size={32} color="#10b981" />
            </div>
            <h3 className="font-bold text-xl" style={{ color: "#e8f0f8" }}>Import complete</h3>
            <div className="flex flex-col gap-2 text-sm" style={{ color: "#7a9ab8" }}>
              <p><span className="font-bold text-base" style={{ color: "#10b981" }}>{importCount}</span> {dataType} added</p>
              <p><span className="font-bold" style={{ color: "#e8f0f8" }}>{fmt(totalValue)}</span> total value</p>
              <p style={{ color: "#10b981" }}>FinPilot has been updated.</p>
            </div>
            <div className="flex gap-3 mt-2 w-full">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
                View dashboard
              </button>
              <button onClick={() => { setStep("type"); setFileName(""); setRawRows([]); setValidInvoices([]); setValidExpenses([]); setErrors([]); setDupeCount(0); }}
                className="flex-1 py-3 rounded-2xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.05)", color: "#7a9ab8" }}>
                Import more
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ImportHistory sub-component ───────────────────────────────────────────
export function ImportHistory() {
  const { state, dispatch } = useData();
  if (!state.importHistory.length) return null;

  return (
    <div className="mt-4">
      <p className="font-semibold text-sm mb-2" style={{ color: "#e8f0f8" }}>Import history</p>
      <div className="flex flex-col gap-2">
        {state.importHistory.map((batch) => (
          <div key={batch.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <FileSpreadsheet size={16} color="#7a9ab8" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#e8f0f8" }}>{batch.filename}</p>
              <p className="text-xs" style={{ color: "#3d5a78" }}>{batch.count} records · {new Date(batch.importedAt).toLocaleString()}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Imported</span>
            <button onClick={() => dispatch({ type: "DELETE_IMPORT_BATCH", id: batch.id })} className="p-1 hover:bg-white/5 rounded-lg">
              <Trash2 size={13} color="#3d5a78" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
