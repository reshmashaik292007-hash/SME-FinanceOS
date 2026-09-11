import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Mic, X } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import VoiceAssistant from "./VoiceAssistant";
import ImportModal from "./ImportModal";

type Props = { addToast: (msg: string, type?: "success" | "info" | "error") => void };

export default function Layout({ addToast }: Props) {
  const [voiceOpen,  setVoiceOpen]  = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="flex h-full" style={{ background: "#071020" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar onImport={() => setImportOpen(true)} />
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet context={{ openImport: () => setImportOpen(true) }} />
        </div>
      </main>

      {/* Voice panel overlay */}
      {voiceOpen && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setVoiceOpen(false)} />
          <div className="fixed z-50 flex flex-col" style={{ right: 0, top: 0, bottom: 0, width: "min(420px, 100vw)", boxShadow: "-8px 0 40px rgba(0,0,0,0.5)" }}>
            <VoiceAssistant onClose={() => setVoiceOpen(false)} addToast={addToast} />
          </div>
        </>
      )}

      {/* Import modal */}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} addToast={addToast} />}

      {/* Floating mic button */}
      <button onClick={() => setVoiceOpen((v) => !v)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ right: 20, bottom: voiceOpen ? -100 : 76, width: 56, height: 56, background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.4)", transition: "bottom 0.3s ease, transform 0.15s ease" }}
        aria-label="Talk to AI CFO">
        {voiceOpen ? <X size={20} color="white" /> : <Mic size={20} color="white" />}
      </button>

      {/* Ask AI label — mobile only */}
      {!voiceOpen && (
        <span className="fixed z-50 md:hidden text-xs font-semibold pointer-events-none" style={{ right: 16, bottom: 136, color: "#10b981" }}>Ask AI</span>
      )}

      <MobileNav onImport={() => setImportOpen(true)} />
    </div>
  );
}
