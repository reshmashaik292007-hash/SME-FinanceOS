import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, X, Volume2, VolumeX, ArrowRight, Loader2, Sparkles, CheckCircle, XCircle, ChevronDown, AlertCircle } from "lucide-react";
import { useData } from "../context/DataContext";
import { useLang, LANG_LABELS, SPEECH_LOCALE, type Lang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";

type MicState = "idle" | "listening" | "processing" | "speaking" | "error" | "unsupported" | "permission_denied";
type MsgRole = "user" | "ai";

type Msg = {
  role: MsgRole;
  text: string;
  action?: { label: string; href: string };
  confirm?: { question: string; onYes: () => void };
};

type Props = {
  onClose: () => void;
  addToast: (msg: string, type?: "success" | "info" | "error") => void;
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} lakh`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ── Multilingual responses ────────────────────────────────────────────────
function makeGreet(firstName: string): Record<Lang, string> {
  const n = firstName ? `, ${firstName}` : "";
  return {
    en: `Hi${n}! I'm FinPilot AI — your finance assistant. Ask me anything about your business.`,
    te: `నమస్కారం${n}! నేను FinPilot AI — మీ ఫైనాన్స్ అసిస్టెంట్. మీ వ్యాపారం గురించి ఏదైనా అడగండి.`,
    hi: `నమస్తే${n}! मैं FinPilot AI हूं — आपका वित्त सहायक। अपने व्यापार के बारे में कुछ भी पूछें।`,
  };
}

const SUGGESTIONS: Record<Lang, string[]> = {
  en: ["Who owes me money?", "How much cash do I have?", "What should I do today?", "Will I have enough next month?"],
  te: ["నాకు ఎవరు డబ్బు ఇవ్వాలి?", "నా దగ్గర ఎంత క్యాష్ ఉంది?", "నేను ఈరోజు ఏం చేయాలి?", "వచ్చే నెల తగినంత డబ్బు ఉంటుందా?"],
  hi: ["मुझे पैसे कौन देना है?", "मेरे पास कितना कैश है?", "मुझे आज क्या करना चाहिए?", "क्या अगले महीने काफी पैसे होंगे?"],
};

export default function VoiceAssistant({ onClose, addToast }: Props) {
  const navigate = useNavigate();
  const { state, dispatch, metrics, pulse } = useData();
  const { lang, setLang, t } = useLang();
  const { user } = useAuth();
  const firstName = user?.ownerName?.split(" ")[0] ?? "";

  const [micState, setMicState]   = useState<MicState>("idle");
  const [messages, setMessages]   = useState<Msg[]>([]);
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null);
  const [lastError, setLastError] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthRef       = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecRef    = useRef<MediaRecorder | null>(null);

  // Init greeting based on lang and owner name
  useEffect(() => {
    setMessages([{ role: "ai", text: makeGreet(firstName)[lang] }]);
  }, [lang, firstName]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SR);
    synthRef.current = window.speechSynthesis || null;
    return () => { recognitionRef.current?.abort(); synthRef.current?.cancel(); };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Recreate recognition with correct locale when lang changes
  const buildRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = SPEECH_LOCALE[lang];
    return rec;
  }, [lang]);

  const speak = useCallback((text: string, overrideLang?: Lang) => {
    if (!synthRef.current || !ttsEnabled) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = SPEECH_LOCALE[overrideLang ?? lang];
    utt.rate  = 0.95;
    utt.onstart = () => setMicState("speaking");
    utt.onend   = () => setMicState("idle");
    utt.onerror = () => setMicState("idle");
    synthRef.current.speak(utt);
  }, [ttsEnabled, lang]);

  const addMsg = useCallback((msg: Msg) => setMessages((p) => [...p, msg]), []);

  // ── Multilingual answer engine ──────────────────────────────────────────
  const buildAnswer = useCallback((q: string): Msg => {
    const text = q.toLowerCase();
    const overdue = state.invoices.filter((i) => i.status === "OVERDUE");
    const overdueTotal = overdue.reduce((s, i) => s + i.amount, 0);
    const raviInv = overdue.find((i) => i.customer.toLowerCase().includes("ravi"));

    // Mark as paid action
    const paidMatch = text.match(/mark (.+?) (invoice )?as paid/i) || text.match(/(.+?) paid/i) ||
      text.match(/mark (.+?) చెల్లించారు/i) || text.match(/(.+?) ka bhugtan/i);
    if (paidMatch) {
      const hint = (paidMatch[1] || "").trim().toLowerCase();
      const inv  = overdue.find((i) => i.customer.toLowerCase().includes(hint));
      if (inv) {
        const question: Record<Lang, string> = {
          en: `I can mark ${inv.customer}'s ${fmt(inv.amount)} invoice as paid. Should I do that?`,
          te: `${inv.customer} యొక్క ${fmt(inv.amount)} ఇన్వాయిస్ చెల్లించినట్టు మార్కు చేయవచ్చు. చేయమంటారా?`,
          hi: `${inv.customer} का ${fmt(inv.amount)} का बिल paid करें? क्या करना चाहिए?`,
        };
        return {
          role: "ai", text: question[lang],
          confirm: {
            question: question[lang],
            onYes: () => {
              dispatch({ type: "PAY_INVOICE", id: inv.id });
              addToast("Invoice marked as paid ✓");
              const doneMsg: Record<Lang, string> = {
                en: `Done! ${inv.customer}'s ${fmt(inv.amount)} is now marked as paid. Your balance is updated.`,
                te: `అయింది! ${inv.customer} యొక్క ${fmt(inv.amount)} చెల్లించినట్టు మార్కు చేశాం. మీ బ్యాలెన్స్ అప్‌డేట్ అయింది.`,
                hi: `हो गया! ${inv.customer} का ${fmt(inv.amount)} paid mark हो गया। बैलेंस अपडेट हो गया।`,
              };
              addMsg({ role: "ai", text: doneMsg[lang] });
            },
          },
        };
      }
    }

    // Cash balance
    if (text.match(/how much (cash|money)|bank balance|available|cash.*have|ఎంత క్యాష్|ఎంత.*ఉంది|कितना.*cash|कितना.*पैसा/)) {
      const responses: Record<Lang, string> = {
        en: `You have ${fmt(metrics.bankBalance)} in your bank right now. FinPilot score: ${pulse.score}/100 — ${pulse.status}.`,
        te: `మీ బ్యాంకులో ప్రస్తుతం ${fmt(metrics.bankBalance)} ఉంది. FinPilot స్కోర్: ${pulse.score}/100 — ${pulse.status}.`,
        hi: `अभी आपके बैंक में ${fmt(metrics.bankBalance)} है। FinPilot स्कोर: ${pulse.score}/100 — ${pulse.status}.`,
      };
      return { role: "ai", text: responses[lang] };
    }

    // Who owes
    if (text.match(/who owes|overdue|late payment|unpaid|collect|ఎవరు.*ఇవ్వాలి|ఎవరు.*డబ్బు|कौन.*देना|बकाया/)) {
      const names = overdue.slice(0, 3).map((i) => `${i.customer} (${fmt(i.amount)})`).join(", ");
      const responses: Record<Lang, string> = {
        en: overdue.length > 0 ? `${overdue.length} customers owe you ${fmt(overdueTotal)} total. Top: ${names}.` : "No overdue invoices right now!",
        te: overdue.length > 0 ? `${overdue.length} కస్టమర్లు మీకు మొత్తం ${fmt(overdueTotal)} ఇవ్వాల్సి ఉంది. ముఖ్యమైనవి: ${names}.` : "ఇప్పుడు ఓవర్‌డ్యూ ఇన్వాయిస్‌లు లేవు!",
        hi: overdue.length > 0 ? `${overdue.length} ग्राहक आपको कुल ${fmt(overdueTotal)} देने हैं। मुख्य: ${names}.` : "अभी कोई बकाया बिल नहीं है!",
      };
      return { role: "ai", text: responses[lang], action: { label: "See all payments", href: "/invoices" } };
    }

    // Ravi
    if (text.match(/ravi/i)) {
      const responses: Record<Lang, string> = {
        en: raviInv ? `Ravi Traders owes you ${fmt(raviInv.amount)} and is ${raviInv.daysOverdue} days late.` : "Ravi Traders has no current overdue invoices.",
        te: raviInv ? `Ravi Traders మీకు ₹${fmt(raviInv.amount)} చెల్లించాలి. పేమెంట్ ${raviInv.daysOverdue} రోజులు ఆలస్యమైంది.` : "Ravi Traders కి ప్రస్తుతం ఓవర్‌డ్యూ ఇన్వాయిస్‌లు లేవు.",
        hi: raviInv ? `Ravi Traders को आपको ${fmt(raviInv.amount)} देना है और भुगतान ${raviInv.daysOverdue} दिन लेट है।` : "Ravi Traders का कोई बकाया बिल नहीं है।",
      };
      return { role: "ai", text: responses[lang], action: raviInv ? { label: "View invoice", href: "/invoices" } : undefined };
    }

    // Spending
    if (text.match(/spending|expenses|ఖర్చులు|ఎక్కువగా ఎక్కడ|खर्च|सबसे ज्यादा/)) {
      const responses: Record<Lang, string> = {
        en: `This month your spending is ${fmt(metrics.upcomingExpenses)}. Software costs rose ${metrics.softwareTrendPct}%. CloudSuite Pro may not be needed.`,
        te: `ఈ నెల మీ ఖర్చులు ${fmt(metrics.upcomingExpenses)}. సాఫ్ట్‌వేర్ ఖర్చులు ${metrics.softwareTrendPct}% పెరిగాయి. CloudSuite Pro అవసరం లేకపోవచ్చు.`,
        hi: `इस महीने आपके खर्च ${fmt(metrics.upcomingExpenses)} हैं। सॉफ्टवेयर खर्च ${metrics.softwareTrendPct}% बढ़ा। CloudSuite Pro की जरूरत नहीं हो सकती।`,
      };
      return { role: "ai", text: responses[lang], action: { label: "Review spending", href: "/expenses" } };
    }

    // Cash flow / enough
    if (text.match(/enough money|cash flow|next month|30 days|will i have|వచ్చే నెల|अगले महीने/)) {
      const responses: Record<Lang, string> = {
        en: `Cash could dip around Day 24 — close to your safety level. Collecting overdue payments would help significantly.`,
        te: `24వ రోజు నాటికి క్యాష్ తక్కువగా అవుతుంది — మీ సేఫ్టీ స్థాయికి దగ్గరగా. ఓవర్‌డ్యూ పేమెంట్లు సేకరించడం చాలా సహాయకరంగా ఉంటుంది.`,
        hi: `करीब 24वें दिन कैश कम हो सकता है — सुरक्षा स्तर के करीब। बकाया पेमेंट कलेक्ट करने से काफी मदद होगी।`,
      };
      return { role: "ai", text: responses[lang], action: { label: "See cash forecast", href: "/cash-flow" } };
    }

    // What to do / biggest problem
    if (text.match(/what should i do|next step|advice|recommend|priority|today|ఏం చేయాలి|ఈరోజు|क्या करना|सबसे बड़ी समस्या/)) {
      const top = overdue[0];
      const responses: Record<Lang, string> = {
        en: top ? `Most important: collect ${fmt(top.amount)} from ${top.customer}. This is your largest overdue payment.` : `Finances look healthy! Watch upcoming expenses of ${fmt(metrics.upcomingExpenses)}.`,
        te: top ? `అత్యంత ముఖ్యమైనది: ${top.customer} నుండి ${fmt(top.amount)} సేకరించండి. ఇది మీ అతిపెద్ద ఓవర్‌డ్యూ పేమెంట్.` : `ఫైనాన్సులు బాగున్నాయి! రాబోయే ${fmt(metrics.upcomingExpenses)} ఖర్చులపై శ్రద్ధ పెట్టండి.`,
        hi: top ? `सबसे जरूरी: ${top.customer} से ${fmt(top.amount)} कलेक्ट करें। यह आपका सबसे बड़ा बकाया है।` : `फाइनेंस ठीक है! ${fmt(metrics.upcomingExpenses)} के आने वाले खर्चों पर ध्यान दें।`,
      };
      return { role: "ai", text: responses[lang], action: top ? { label: "View payment reminder", href: "/agents" } : undefined };
    }

    // Health / score
    if (text.match(/health|score|how am i doing|finpilot|pulse|స్కోర్|स्कोर|स्थिति/)) {
      const responses: Record<Lang, string> = {
        en: `Your FinPilot score is ${pulse.score}/100 — ${pulse.status}. ${pulse.explanation}`,
        te: `మీ FinPilot స్కోర్ ${pulse.score}/100 — ${pulse.status}. ${pulse.explanation}`,
        hi: `आपका FinPilot स्कोर ${pulse.score}/100 — ${pulse.status}. ${pulse.explanation}`,
      };
      return { role: "ai", text: responses[lang] };
    }

    // Default
    const defaults: Record<Lang, string> = {
      en: "I can help with: who owes you money, cash balance, spending, cash flow forecast, or what to do today.",
      te: "నేను సహాయం చేయగలను: ఎవరు డబ్బు ఇవ్వాలి, బ్యాంక్ బ్యాలెన్స్, ఖర్చులు, క్యాష్ ఫ్లో, లేదా ఈరోజు ఏం చేయాలో.",
      hi: "मैं मदद कर सकता हूं: कौन पैसे देना है, बैंक बैलेंस, खर्च, कैश फ्लो, या आज क्या करना है।",
    };
    return { role: "ai", text: defaults[lang] };
  }, [state, metrics, pulse, dispatch, addToast, addMsg, lang]);

  const handleUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    addMsg({ role: "user", text: text.trim() });
    setMicState("processing");
    setInputText("");
    await new Promise((r) => setTimeout(r, 600));
    const reply = buildAnswer(text.trim());
    addMsg(reply);
    setMicState("idle");
    if (!reply.confirm) speak(reply.text);
  }, [addMsg, buildAnswer, speak]);

  // ── Microphone flow ───────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    if (micState !== "idle") return;
    setLastError("");
    synthRef.current?.cancel();

    // Check mic permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicState("permission_denied");
      setLastError(t("micBlocked"));
      return;
    }

    const rec = buildRecognition();
    if (!rec) {
      setMicState("unsupported");
      setLastError(t("voiceUnsupported"));
      return;
    }

    recognitionRef.current = rec;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) {
        setTranscript("");
        handleUserMessage(text);
      }
    };
    rec.onerror = (e: any) => {
      setMicState("error");
      if (e.error === "not-allowed") {
        setMicState("permission_denied");
        setLastError(t("micBlocked"));
      } else {
        setLastError(t("couldntHear"));
      }
      setTranscript("");
    };
    rec.onend = () => {
      setTranscript("");
      setMicState((s) => s === "listening" ? "idle" : s);
    };

    setMicState("listening");
    setTranscript("");
    try { rec.start(); } catch { setMicState("idle"); }
  }, [micState, buildRecognition, handleUserMessage, t]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setMicState("idle");
  }, []);

  function handleSend() { if (inputText.trim()) handleUserMessage(inputText); }
  function handleKeyDown(e: React.KeyboardEvent) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }

  const micColor =
    micState === "listening"        ? "#06b6d4" :
    micState === "processing"       ? "#a78bfa" :
    micState === "speaking"         ? "#10b981" :
    micState === "error"            ? "#ef4444" :
    micState === "permission_denied"? "#ef4444" :
    micState === "unsupported"      ? "#3d5a78" : "#10b981";

  const micLabel =
    micState === "idle"             ? t("tapToSpeak") :
    micState === "listening"        ? t("listening") :
    micState === "processing"       ? t("processing") :
    micState === "speaking"         ? "🔊 Speaking..." :
    micState === "error"            ? lastError :
    micState === "permission_denied"? t("micBlocked") :
    micState === "unsupported"      ? t("voiceUnsupported") : "";

  const canListen = micState === "idle" || micState === "error" || micState === "permission_denied";

  return (
    <div className="flex flex-col h-full" style={{ background: "#0e1c2e" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 36, height: 36, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Sparkles size={16} color="#10b981" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: "#e8f0f8" }}>{t("talkAI")}</p>
          <p className="text-xs" style={{ color: "#7a9ab8" }}>Score: {pulse.score}/100</p>
        </div>
        <button onClick={() => { setTtsEnabled((v) => !v); synthRef.current?.cancel(); }} className="p-1.5 rounded-lg hover:bg-white/5">
          {ttsEnabled ? <Volume2 size={15} color="#7a9ab8" /> : <VolumeX size={15} color="#3d5a78" />}
        </button>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
          <X size={16} color="#7a9ab8" />
        </button>
      </div>

      {/* Language indicator inside panel */}
      <div className="px-5 py-2.5 flex items-center gap-2 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
        <span className="text-xs" style={{ color: "#3d5a78" }}>{t("speakingIn")}:</span>
        <div className="relative flex-1 max-w-[140px]">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
            className="w-full px-2 py-1 rounded-lg text-xs font-semibold appearance-none outline-none pr-6 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#e8f0f8" }}>
            {(Object.entries(LANG_LABELS) as [Lang, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ChevronDown size={11} color="#3d5a78" className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {msg.role === "ai" && (
              <div className="shrink-0 flex items-center justify-center rounded-full mt-0.5"
                style={{ width: 26, height: 26, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <Sparkles size={11} color="#10b981" />
              </div>
            )}
            <div style={{ maxWidth: "82%" }}>
              <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === "user" ? "rgba(16,185,129,0.14)" : "rgba(255,255,255,0.05)",
                  border: msg.role === "user" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  color: "#e8f0f8",
                  borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                  borderBottomLeftRadius:  msg.role === "ai"   ? 4 : 16,
                }}>
                {msg.text}
              </div>
              {/* Listen button */}
              {msg.role === "ai" && !msg.confirm && (
                <button onClick={() => speak(msg.text)} className="mt-1 flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg hover:bg-white/5"
                  style={{ color: "#3d5a78" }}>
                  <Volume2 size={11} /> Listen
                </button>
              )}
              {/* Confirm */}
              {msg.confirm && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => { msg.confirm!.onYes(); setMessages((p) => p.map((m, j) => j === i ? { ...m, confirm: undefined } : m)); }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
                    <CheckCircle size={12} /> Yes
                  </button>
                  <button onClick={() => setMessages((p) => p.map((m, j) => j === i ? { ...m, confirm: undefined } : m))}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#7a9ab8" }}>
                    <XCircle size={12} /> Cancel
                  </button>
                </div>
              )}
              {/* Nav action */}
              {msg.action && !msg.confirm && (
                <button onClick={() => { onClose(); navigate(msg.action!.href); }}
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
                  {msg.action.label} <ArrowRight size={11} />
                </button>
              )}
            </div>
          </div>
        ))}
        {transcript && (
          <div className="flex justify-end">
            <div className="rounded-2xl px-4 py-2 text-sm italic"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.14)", color: "#7a9ab8", maxWidth: "82%" }}>
              {transcript}…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Orb area */}
      <div className="shrink-0 flex flex-col items-center py-5 gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Waveform when listening */}
        {micState === "listening" && (
          <div className="flex items-center gap-1 h-6">
            {[0.2, 0.5, 0.8, 1, 0.7, 0.4, 0.9, 0.6, 0.3, 0.8, 0.5].map((d, i) => (
              <div key={i} className="rounded-full" style={{ width: 3, height: 20, background: "#06b6d4", animation: `waveform-bar ${0.6 + d * 0.4}s ease-in-out ${d * 0.15}s infinite`, transformOrigin: "center" }} />
            ))}
          </div>
        )}

        {/* Error / unsupported state */}
        {(micState === "error" || micState === "permission_denied" || micState === "unsupported") && (
          <div className="flex items-start gap-2 mx-4 p-3 rounded-2xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={14} color="#ef4444" className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: "#ef4444" }}>{micLabel}</p>
          </div>
        )}

        {/* Orb */}
        <div className="relative">
          {micState !== "processing" && micState !== "error" && micState !== "unsupported" && (
            <div className="absolute inset-0 rounded-full" style={{ background: micColor, animation: "pulse-ring 2.5s ease-in-out infinite", zIndex: 0 }} />
          )}
          <button
            onClick={canListen ? startListening : micState === "listening" ? stopListening : undefined}
            className="relative z-10 flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{
              width: 68, height: 68,
              background: `radial-gradient(circle, ${micColor}28, ${micColor}16)`,
              border: `2px solid ${micColor}55`,
              boxShadow: `0 0 24px ${micColor}28`,
              animation: micState === "idle" ? "orb-idle 3s ease-in-out infinite" : micState === "listening" ? "orb-listen 1s ease-in-out infinite" : undefined,
            }}
            aria-label="Microphone">
            {micState === "processing" ? <Loader2 size={26} color={micColor} className="animate-spin" />
              : micState === "listening" ? <MicOff size={26} color="#06b6d4" />
              : micState === "unsupported" ? <MicOff size={26} color="#3d5a78" />
              : <Mic size={26} color={micColor} />}
          </button>
        </div>

        <p className="text-xs font-medium text-center px-4" style={{ color: micState === "idle" ? "#3d5a78" : micColor, maxWidth: 260 }}>
          {micState === "idle"       && (speechSupported ? t("tapToSpeak") : t("voiceUnsupported"))}
          {micState === "listening"  && t("listening")}
          {micState === "processing" && t("processing")}
          {micState === "speaking"   && "🔊 Speaking..."}
        </p>

        {/* Suggestion chips */}
        {micState === "idle" && messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5 justify-center px-4">
            {SUGGESTIONS[lang].map((s) => (
              <button key={s} onClick={() => handleUserMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#7a9ab8" }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text input */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={t("typeQuestion")} className="flex-1 bg-transparent text-sm outline-none" style={{ color: "#e8f0f8" }}
          disabled={micState === "processing"} />
        <button onClick={handleSend} disabled={!inputText.trim() || micState === "processing"}
          className="p-2 rounded-xl transition-all disabled:opacity-30"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <ArrowRight size={14} color="#10b981" />
        </button>
      </div>
    </div>
  );
}
