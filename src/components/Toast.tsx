import { CheckCircle, Info, XCircle, X } from "lucide-react";
import type { Toast } from "../hooks/useToast";

type Props = {
  toasts: Toast[];
  remove: (id: string) => void;
};

export default function ToastContainer({ toasts, remove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl slide-in"
          style={{
            background: "#0d1520",
            borderColor: t.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)",
            color: "#f0f4f8",
            minWidth: 240,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {t.type === "error" ? (
            <XCircle size={16} color="#ef4444" />
          ) : t.type === "info" ? (
            <Info size={16} color="#06b6d4" />
          ) : (
            <CheckCircle size={16} color="#10b981" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="opacity-40 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
