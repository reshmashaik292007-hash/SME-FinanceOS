if (import.meta.hot) { (import.meta.hot as any).decline(); }
import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "te" | "hi";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिन्दी",
};

export const SPEECH_LOCALE: Record<Lang, string> = {
  en: "en-IN",
  te: "te-IN",
  hi: "hi-IN",
};

export const T: Record<string, Record<Lang, string>> = {
  // Nav
  home:            { en: "Home",               te: "హోమ్",            hi: "होम" },
  aiTeam:          { en: "AI Finance Team",    te: "AI ఫైనాన్స్ టీమ్", hi: "AI वित्त टीम" },
  invoices:        { en: "Customer Payments",  te: "కస్టమర్ పేమెంట్లు", hi: "ग्राहक भुगतान" },
  expenses:        { en: "Business Spending",  te: "వ్యాపార ఖర్చులు",   hi: "व्यापार खर्च" },
  cashFlow:        { en: "Cash Flow",          te: "క్యాష్ ఫ్లో",      hi: "नकद प्रवाह" },
  importData:      { en: "Import Data",        te: "డేటా దిగుమతి",     hi: "डेटा आयात" },

  // Dashboard
  businessPulse:   { en: "Your Business Pulse",             te: "మీ వ్యాపార పల్స్",                   hi: "आपके व्यवसाय की स्थिति" },
  attention:       { en: "What needs your attention?",      te: "మీ దృష్టి ఏ విషయంపై అవసరం?",         hi: "आपके ध्यान की जरूरत किस पर है?" },
  talkAI:          { en: "Talk to your AI CFO",             te: "మీ AI CFOతో మాట్లాడండి",              hi: "अपने AI CFO से बात करें" },
  customersOwe:    { en: "Customers owe you",               te: "కస్టమర్లు మీకు ఇవ్వాల్సిన మొత్తం",   hi: "ग्राहकों से लेना बाकी है" },
  cashInBank:      { en: "Cash in bank",                    te: "బ్యాంకులో నగదు",                       hi: "बैंक में नकद" },
  upcomingCosts:   { en: "Upcoming costs",                  te: "రాబోయే ఖర్చులు",                      hi: "आगामी खर्च" },
  checkWithAI:     { en: "Check my business with AI →",     te: "AIతో నా వ్యాపారం చెక్ చేయండి →",     hi: "AI से मेरा व्यापार जांचें →" },
  importBusiness:  { en: "Import Business Data",            te: "వ్యాపార డేటా దిగుమతి చేయండి",        hi: "व्यापार डेटा आयात करें" },

  // Voice
  tapToSpeak:      { en: "Tap to speak",           te: "మాట్లాడటానికి నొక్కండి", hi: "बोलने के लिए टैप करें" },
  listening:       { en: "Listening...",            te: "వింటున్నాను...",           hi: "सुन रहा हूं..." },
  processing:      { en: "Understanding you...",   te: "అర్థం చేసుకుంటున్నాను...", hi: "समझ रहा हूं..." },
  speakingIn:      { en: "Speaking in",            te: "మాట్లాడుతున్న భాష",        hi: "भाषा" },
  typeQuestion:    { en: "Or type your question...", te: "లేదా మీ ప్రశ్న టైప్ చేయండి...", hi: "या अपना प्रश्न टाइप करें..." },
  micBlocked:      { en: "Microphone access is blocked. Allow it in browser settings, or type below.", te: "మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. బ్రౌజర్ సెట్టింగ్స్‌లో అనుమతివ్వండి లేదా దిగువ టైప్ చేయండి.", hi: "माइक्रोफोन एक्सेस ब्लॉक है। ब्राउज़र सेटिंग में अनुमति दें, या नीचे टाइप करें।" },
  voiceUnsupported: { en: "Voice input isn't supported here. You can type instead.", te: "వాయిస్ ఇన్‌పుట్ ఇక్కడ మద్దతు లేదు. దయచేసి టైప్ చేయండి.", hi: "यहां वॉइस इनपुट समर्थित नहीं है। टाइप करें।" },
  couldntHear:     { en: "We couldn't hear you. Please try again.", te: "మీరు చెప్పింది వినలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.", hi: "हम आपको सुन नहीं सके। कृपया पुनः प्रयास करें।" },

  // Import
  importTitle:     { en: "Import Business Data",  te: "వ్యాపార డేటా దిగుమతి",  hi: "व्यापार डेटा आयात" },
  importSubtitle:  { en: "Upload your Excel or CSV file and we'll organize it for you.", te: "మీ Excel లేదా CSV ఫైల్ అప్‌లోడ్ చేయండి, మేము అది వ్యవస్థీకరిస్తాము.", hi: "अपनी Excel या CSV फ़ाइल अपलोड करें, हम उसे व्यवस्थित करेंगे।" },
};

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const _langHot = (import.meta.hot as any)?.data ?? {};
if (!_langHot._LangCtx) {
  _langHot._LangCtx = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: (k) => k });
}
const Ctx: ReturnType<typeof createContext<LangCtx>> = _langHot._LangCtx;

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (key: string) => T[key]?.[lang] ?? T[key]?.en ?? key;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang() { return useContext(Ctx); }
