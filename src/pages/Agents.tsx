import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TrendingUp, MessageCircle, ShieldAlert, Sparkles,
  CheckCircle2, Loader2, ArrowDown, Copy, Send, AlertTriangle,
} from "lucide-react";
import { runAgents, type AgentResults } from "../services/api";

type ToastFn = (msg: string, type?: "success" | "info" | "error") => void;
type AgentKey = "forecasting" | "collections" | "risk" | "advisor";

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const STEPS = [
  { key: "forecasting" as AgentKey, name: "Cash Forecast", sub: "Will you have enough money?", icon: TrendingUp, color: "#10b981", step: "Checking cash flow…" },
  { key: "collections" as AgentKey, name: "Payment Helper",  sub: "Who needs a reminder?",       icon: MessageCircle, color: "#06b6d4", step: "Checking customer payments…" },
  { key: "risk"        as AgentKey, name: "Money Watch",     sub: "Where might you lose money?",  icon: ShieldAlert,   color: "#f59e0b", step: "Checking spending…" },
  { key: "advisor"     as AgentKey, name: "AI Advisor",      sub: "What should you do first?",    icon: Sparkles,      color: "#a78bfa", step: "Finding your next best action…" },
];

const HANDOFF: Record<string, string> = {
  forecasting: "Let's see which customer payment could help.",
  collections: "Now let's check if there are expenses we can reduce.",
  risk: "Here's what you should do first.",
};

export default function Agents({ addToast }: { addToast: ToastFn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<AgentKey[]>([]);
  const [results, setResults] = useState<AgentResults | null>(null);
  const [currentStep, setCurrentStep] = useState<AgentKey | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const hasAutoRun = useRef(false);

  const startAnalysis = useCallback(async () => {
    if (running) return;
    setRunning(true); setCompleted([]); setResults(null); setCurrentStep(null);
    addToast("Your AI team is checking your business…", "info");

    const resultPromise = runAgents();
    for (const step of STEPS) {
      setCurrentStep(step.key);
      await new Promise((r) => setTimeout(r, 1800 + Math.random() * 600));
      setCompleted((p) => [...p, step.key]);
      addToast(`✓ ${step.name} done`, "success");
    }
    const data = await resultPromise;
    setResults(data);
    if (data.usedFallback) setUsedFallback(true);
    setRunning(false); setCurrentStep(null);
    addToast("Recommendation ready!", "success");
  }, [running, addToast]);

  useEffect(() => {
    if (location.state?.autoRun && !hasAutoRun.current) {
      hasAutoRun.current = true;
      startAnalysis();
    }
  }, [location.state, startAnalysis]);

  function copyDraft() {
    if (!results?.collections?.draft) return;
    const { subject, body } = results.collections.draft;
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`).then(() => addToast("Reminder copied ✓"));
  }

  function sendReminder() { addToast("Reminder sent successfully ✓"); }

  const isDone  = (k: AgentKey) => completed.includes(k);
  const isNow   = (k: AgentKey) => currentStep === k;

  return (
    <div className="px-4 md:px-8 py-6 max-w-[820px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <h1 className="font-bold text-xl md:text-2xl mb-1" style={{ color: "#e8f0f8", letterSpacing: "-0.02em" }}>
            Your AI Finance Team
          </h1>
          <p className="text-sm" style={{ color: "#7a9ab8" }}>Four specialists looked at your business and compared their findings.</p>
        </div>
        <button
          onClick={startAnalysis}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 4px 16px rgba(16,185,129,0.28)" }}
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : null}
          {running ? "Checking…" : "Run again"}
        </button>
      </div>

      {/* Step breadcrumb */}
      {(running || results) && (
        <div className="flex items-center gap-1.5 flex-wrap mb-6 mt-4">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: isDone(s.key) ? `${s.color}18` : isNow(s.key) ? `${s.color}12` : "rgba(255,255,255,0.03)",
                  color: isDone(s.key) || isNow(s.key) ? s.color : "#3d5a78",
                  border: `1px solid ${isDone(s.key) ? s.color + "30" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {isDone(s.key) && "✓ "}{s.name}
              </span>
              {i < STEPS.length - 1 && <span style={{ color: "#3d5a78", fontSize: 10 }}>→</span>}
            </div>
          ))}
        </div>
      )}

      {usedFallback && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", color: "#f59e0b" }}>
          <AlertTriangle size={14} /> AI is temporarily unavailable. Showing calculated analysis.
        </div>
      )}

      {/* Idle state */}
      {!running && !results && (
        <div className="rounded-2xl p-10 flex flex-col items-center gap-4 text-center fade-in"
          style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <Sparkles size={24} color="#10b981" />
          </div>
          <h3 className="font-semibold text-lg" style={{ color: "#e8f0f8" }}>Ready to check your business</h3>
          <p className="text-sm max-w-xs" style={{ color: "#7a9ab8" }}>Your AI finance team will look at your cash, payments, spending, and give you one clear recommendation.</p>
          <button onClick={startAnalysis}
            className="mt-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 6px 20px rgba(16,185,129,0.28)" }}>
            Check my business with AI →
          </button>
        </div>
      )}

      {/* Agent timeline */}
      {(running || results) && (
        <div className="flex flex-col gap-0">
          {STEPS.map((meta, idx) => {
            const done = isDone(meta.key);
            const active = isNow(meta.key);
            const pending = !done && !active;

            return (
              <div key={meta.key}>
                <div
                  className="rounded-2xl p-5 transition-all duration-500"
                  style={{
                    background: "#0e1c2e",
                    border: done ? `1px solid ${meta.color}22` : active ? `1px solid ${meta.color}38` : "1px solid rgba(255,255,255,0.06)",
                    opacity: pending ? 0.45 : 1,
                    boxShadow: active ? `0 0 28px ${meta.color}0a` : undefined,
                  }}
                >
                  {/* Agent header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex items-center justify-center rounded-2xl shrink-0"
                      style={{ width: 44, height: 44, background: `${meta.color}12`, border: `1px solid ${meta.color}22` }}
                    >
                      <meta.icon size={20} color={meta.color} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold" style={{ color: "#e8f0f8" }}>{meta.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#7a9ab8" }}>
                        {active ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 size={10} color={meta.color} className="animate-spin" />
                            <span style={{ color: meta.color }}>{meta.step}</span>
                          </span>
                        ) : meta.sub}
                      </p>
                    </div>
                    {done && <CheckCircle2 size={20} color={meta.color} />}
                  </div>

                  {/* Agent intro line */}
                  {done && results && (
                    <div className="slide-up">
                      {meta.key === "forecasting" && results.forecasting && <ForecastResult data={results.forecasting} color={meta.color} />}
                      {meta.key === "collections" && results.collections && <CollectionsResult data={results.collections} color={meta.color} onCopy={copyDraft} onSend={sendReminder} addToast={addToast} navigate={navigate} />}
                      {meta.key === "risk"         && results.risk         && <RiskResult data={results.risk} color={meta.color} />}
                      {meta.key === "advisor"      && results.advisor      && <AdvisorResult data={results.advisor} color={meta.color} onView={() => {/* scroll to draft */}} />}
                    </div>
                  )}
                </div>

                {/* Handoff */}
                {idx < STEPS.length - 1 && (
                  <div className="flex items-center justify-center py-2 my-0.5">
                    <div className="flex flex-col items-center gap-1">
                      <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.06)" }} />
                      {done && (
                        <p className="text-xs px-3 py-1 rounded-full" style={{ color: "#7a9ab8", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <ArrowDown size={9} className="inline mr-1" /> Passing this to the next expert →
                        </p>
                      )}
                      <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.06)" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Collection draft */}
      {results?.collections?.draft && (
        <div className="mt-5 rounded-2xl p-5 slide-up" style={{ background: "#0e1c2e", border: "1px solid rgba(6,182,212,0.18)" }}>
          <p className="font-semibold mb-0.5" style={{ color: "#e8f0f8" }}>Ready to send payment reminder</p>
          <p className="text-xs mb-4" style={{ color: "#3d5a78" }}>Prepared by your Payment Helper</p>
          <div className="space-y-2.5 mb-4 text-sm">
            {[
              { l: "To", v: results.collections.draft.recipient },
              { l: "Subject", v: results.collections.draft.subject },
            ].map(({ l, v }) => (
              <div key={l} className="flex gap-2">
                <span className="font-semibold w-14 shrink-0" style={{ color: "#3d5a78" }}>{l}:</span>
                <span style={{ color: "#e8f0f8" }}>{v}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <span className="font-semibold w-14 shrink-0 pt-0.5" style={{ color: "#3d5a78" }}>Message:</span>
              <pre className="flex-1 whitespace-pre-wrap font-sans text-sm leading-relaxed" style={{ color: "#7a9ab8" }}>
                {results.collections.draft.body}
              </pre>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={copyDraft}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
              <Copy size={13} /> Copy message
            </button>
            <button onClick={sendReminder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#fff", boxShadow: "0 4px 14px rgba(6,182,212,0.25)" }}>
              <Send size={13} /> Send reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ForecastResult({ data, color }: { data: any; color: string }) {
  return (
    <div>
      <p className="text-sm text-center italic mb-3 px-2" style={{ color: "#7a9ab8" }}>
        "We looked at your cash coming in and going out."
      </p>
      <div
        className="rounded-xl p-4 mb-3"
        style={{ background: data.liquidityDip ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: "#3d5a78" }}>RESULT</p>
        <p className="font-semibold mb-1" style={{ color: "#e8f0f8" }}>{data.summary}</p>
        {data.liquidityDip && (
          <p className="text-sm font-bold number-font mt-2" style={{ color: "#ef4444" }}>
            ⚠ Cash may get tight around Day {data.liquidityDip.dayEstimate}
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["days30", "days60", "days90"].map((k, i) => {
          const d = data.forecast?.[k];
          if (!d) return null;
          const isLow = d.expectedBalance < 200000;
          return (
            <div key={k} className="rounded-xl p-3 text-center" style={{ background: isLow ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${isLow ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}` }}>
              <p className="text-xs mb-1" style={{ color: "#3d5a78" }}>{["30 days", "60 days", "90 days"][i]}</p>
              <p className="font-bold number-font" style={{ color: isLow ? "#ef4444" : "#e8f0f8" }}>{fmt(d.expectedBalance)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CollectionsResult({ data, color, onCopy, onSend, addToast, navigate }: any) {
  const inv = data.urgentInvoice;
  return (
    <div>
      <p className="text-sm text-center italic mb-3 px-2" style={{ color: "#7a9ab8" }}>
        "We checked your unpaid invoices."
      </p>
      {inv && (
        <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.14)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#3d5a78" }}>RESULT</p>
          <p className="font-semibold mb-2" style={{ color: "#e8f0f8" }}>{inv.customer} is your biggest collection priority.</p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold number-font" style={{ color: "#ef4444" }}>{fmt(inv.amount)}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7a9ab8" }}>{inv.daysOverdue} days late</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>HIGH PRIORITY</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskResult({ data, color }: { data: any; color: string }) {
  return (
    <div>
      <p className="text-sm text-center italic mb-3 px-2" style={{ color: "#7a9ab8" }}>
        "We checked your recent spending."
      </p>
      <div className="rounded-xl p-4" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.14)" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "#3d5a78" }}>RESULT</p>
        <p className="font-semibold mb-2" style={{ color: "#e8f0f8" }}>{data.summary}</p>
        {data.potentialMonthlySavings > 0 && (
          <p className="text-sm font-bold" style={{ color: "#10b981" }}>
            Potential saving: {fmt(data.potentialMonthlySavings)} / month
          </p>
        )}
      </div>
    </div>
  );
}

function AdvisorResult({ data, color, onView }: { data: any; color: string; onView: () => void }) {
  return (
    <div>
      <p className="text-sm text-center italic mb-3 px-2" style={{ color: "#7a9ab8" }}>
        "Here's what you should do first."
      </p>
      <div
        className="rounded-xl p-5"
        style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(16,185,129,0.06))", border: "1px solid rgba(167,139,250,0.2)" }}
      >
        <p className="text-xs font-bold tracking-wider mb-2" style={{ color: "#a78bfa" }}>YOUR NEXT BEST ACTION</p>
        <p className="font-bold text-lg mb-2 leading-snug" style={{ color: "#e8f0f8" }}>{data.action}</p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "#7a9ab8" }}>
          <strong style={{ color: "#e8f0f8" }}>Why? </strong>{data.reason}
        </p>
        {data.impact && (
          <div className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
            Impact: {data.impact}
          </div>
        )}
      </div>
    </div>
  );
}
