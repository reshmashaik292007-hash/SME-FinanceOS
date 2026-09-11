import { useEffect, useRef, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  score: number;
  status: string;
  explanation: string;
  factors: Record<string, { score: number; label: string; status: string }>;
  metrics: { bankBalance: number; overdueTotal: number; upcomingExpenses: number };
  loading?: boolean;
};

const STATUS_COLOR: Record<string, string> = {
  Excellent: "#10b981", Healthy: "#34d399", Watch: "#f59e0b", Critical: "#ef4444",
};
const STATUS_MSG: Record<string, string> = {
  Excellent: "Your business is in excellent shape.",
  Healthy:   "You're doing well overall.",
  Watch:     "A few things need your attention.",
  Critical:  "Some urgent issues need fixing.",
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

// ── ECG beat engine ────────────────────────────────────────────────────────
//
// One beat cycle (norm 0→1):
//   0.00–0.27  flat baseline (pre-beat rest)
//   0.27–0.35  P-wave  — small upward bump
//   0.38–0.45  Q-wave  — tiny downward notch
//   0.43–0.47  R-wave  — sharp tall positive spike  ← main beat
//   0.46–0.51  S-wave  — immediate deep negative dip
//   0.54–0.70  T-wave  — rounded recovery bump
//   0.70–1.00  flat baseline (post-beat rest)
//
// Returns y ∈ [0,1], 0=canvas top (HIGH), 0.5=baseline, 1=canvas bottom (LOW).

const BEAT_PHASE   = 5.2;   // phase-units per heartbeat
const PHASE_SPAN   = 10.8;  // phase-units visible across canvas (~2.07 beats)
const SCROLL_SPEED = 0.036; // phase-units per animation frame (~2.4 s/beat at 60 fps)

// Gaussian bump helper
const G = (norm: number, c: number, w: number) =>
  Math.exp(-w * (norm - c) * (norm - c));

// Per-cycle variation table — makes consecutive beats look slightly different
const BEAT_VARIANTS = [
  { r: 1.00, s: 1.00, t: 1.00 },
  { r: 0.88, s: 1.12, t: 0.85 },
  { r: 1.07, s: 0.92, t: 1.10 },
  { r: 0.93, s: 1.05, t: 0.90 },
];

function ecgY(phase: number, score: number): number {
  // Normalise to [0,1) within one beat
  const bp   = ((phase % BEAT_PHASE) + BEAT_PHASE) % BEAT_PHASE;
  const norm = bp / BEAT_PHASE;

  // Which cycle are we on? (determines per-beat variation)
  const cycleIdx = Math.floor(((phase % (BEAT_PHASE * 4)) + BEAT_PHASE * 4) / BEAT_PHASE) % 4;
  const v = BEAT_VARIANTS[cycleIdx];

  // Score → amplitude parameters
  // rAmp: height of R-spike above baseline (0=high score = tall, goes toward canvas top)
  // sAmp: depth of S-dip below baseline
  const rAmp = (score >= 80 ? 0.41 : score >= 60 ? 0.36 : score >= 40 ? 0.30 : 0.25) * v.r;
  const sAmp = (score >= 80 ? 0.21 : score >= 60 ? 0.26 : score >= 40 ? 0.32 : 0.38) * v.s;
  const pAmp = score >= 60 ? 0.065 : score >= 40 ? 0.050 : 0.035;
  const tAmp = (score >= 80 ? 0.11 : score >= 60 ? 0.09 : score >= 40 ? 0.07 : 0.05) * v.t;

  // Low-score instability: slight jitter on the baseline
  const jitter = score < 50
    ? (score < 30 ? 0.05 : 0.025) * Math.sin(phase * 11.3 + cycleIdx * 1.7)
    : 0;

  // P-wave  — small pre-beat upward bump
  const p =  pAmp   * G(norm, 0.310, 180);
  // Q-wave  — tiny downward notch just before the spike
  const q = -0.024  * G(norm, 0.415, 700);
  // R-wave  — sharp tall spike (positive, above baseline)
  const r =  rAmp   * G(norm, 0.440, 420);
  // S-wave  — immediate deep dip (negative, below baseline)
  const s = -sAmp   * G(norm, 0.476, 300);
  // T-wave  — rounded recovery bump
  const t =  tAmp   * G(norm, 0.625, 65);

  // y = 0.5 − displacement  (positive displacement → upward → lower Y value)
  return Math.min(0.96, Math.max(0.04, 0.5 - (p + q + r + s + t) - jitter));
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PulseHero({ score, status, explanation, metrics, loading }: Props) {
  const navigate    = useNavigate();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const animRef     = useRef<number>(0);
  const phaseRef    = useRef(0);
  const statusColor = STATUS_COLOR[status] || "#10b981";

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    phaseRef.current += SCROLL_SPEED;
    const phase0 = phaseRef.current;

    // Build point array
    const pts: { x: number; y: number }[] = new Array(W);
    for (let i = 0; i < W; i++) {
      const t = (i / (W - 1)) * PHASE_SPAN;
      pts[i]  = { x: i, y: ecgY(phase0 - t, score) * H };
    }

    // ── Area fill (very subtle) ───────────────────────────────────────
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0,   statusColor + "12");
    fillGrad.addColorStop(0.6, statusColor + "04");
    fillGrad.addColorStop(1,   "transparent");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < W; i++) {
      const p = pts[i - 1], c = pts[i], mx = (p.x + c.x) / 2;
      ctx.bezierCurveTo(mx, p.y, mx, c.y, c.x, c.y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // ── Glow pass (wide, soft, behind the line) ───────────────────────
    ctx.save();
    ctx.strokeStyle = statusColor + "2a";
    ctx.lineWidth   = 9;
    ctx.lineJoin    = "round";
    ctx.lineCap     = "round";
    ctx.filter      = "blur(4px)";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < W; i++) {
      const p = pts[i - 1], c = pts[i], mx = (p.x + c.x) / 2;
      ctx.bezierCurveTo(mx, p.y, mx, c.y, c.x, c.y);
    }
    ctx.stroke();
    ctx.restore();

    // ── Main line ─────────────────────────────────────────────────────
    const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
    lineGrad.addColorStop(0,    statusColor + "00");
    lineGrad.addColorStop(0.12, statusColor + "55");
    lineGrad.addColorStop(0.55, statusColor + "bb");
    lineGrad.addColorStop(1,    statusColor + "ff");

    ctx.strokeStyle = lineGrad;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = "round";
    ctx.lineCap     = "round";
    ctx.shadowBlur  = 6;
    ctx.shadowColor = statusColor + "66";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < W; i++) {
      const p = pts[i - 1], c = pts[i], mx = (p.x + c.x) / 2;
      ctx.bezierCurveTo(mx, p.y, mx, c.y, c.x, c.y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── Fading trail before dot ───────────────────────────────────────
    const trailLen = Math.round(W * 0.12);
    for (let i = W - trailLen; i < W - 1; i++) {
      const alpha = (i - (W - trailLen)) / trailLen;
      const a = Math.round(alpha * 90).toString(16).padStart(2, "0");
      ctx.strokeStyle = statusColor + a;
      ctx.lineWidth   = 1.5 + alpha * 4;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }

    // ── Leading dot — brightens at R-peak, dims at S-dip ─────────────
    const last   = pts[W - 1];
    const relY   = last.y / H;                            // 0=top 1=bottom
    const bright = 1.0 - (relY - 0.5) * 0.7;             // higher on canvas → brighter

    ctx.globalAlpha = 0.18 * Math.max(0.4, bright);
    ctx.fillStyle   = statusColor;
    ctx.beginPath(); ctx.arc(last.x, last.y, 13, 0, Math.PI * 2); ctx.fill();

    ctx.globalAlpha = 0.35 * Math.max(0.5, bright);
    ctx.beginPath(); ctx.arc(last.x, last.y, 7,  0, Math.PI * 2); ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur  = 14;
    ctx.shadowColor = statusColor;
    ctx.fillStyle   = relY < 0.38 ? "#ffffff" : relY > 0.68 ? statusColor + "cc" : "#f0fdf4";
    ctx.beginPath(); ctx.arc(last.x, last.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur  = 0;

    // ── Left edge fade ────────────────────────────────────────────────
    const fade = ctx.createLinearGradient(0, 0, W * 0.09, 0);
    fade.addColorStop(0, "rgba(14,28,46,1)");
    fade.addColorStop(1, "rgba(14,28,46,0)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, W * 0.09, H);

    animRef.current = requestAnimationFrame(draw);
  }, [score, statusColor]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  if (loading) {
    return <div className="rounded-2xl animate-pulse" style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.07)", height: 220 }} />;
  }

  return (
    <div className="rounded-3xl overflow-hidden fade-in"
      style={{ background: "#0e1c2e", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
      <div className="flex flex-col md:flex-row">

        {/* Left — score + narrative */}
        <div className="flex-1 px-6 md:px-8 pt-6 pb-5 flex flex-col justify-between" style={{ minWidth: 0 }}>
          <div>
            <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "#3d5a78", letterSpacing: "0.12em" }}>YOUR BUSINESS PULSE</p>
            <div className="flex items-end gap-2 mb-3 flex-wrap">
              <span className="number-font" style={{ fontSize: "clamp(56px, 9vw, 80px)", fontWeight: 800, color: "#e8f0f8", lineHeight: 1, letterSpacing: "-0.04em" }}>
                {score}
              </span>
              <span style={{ fontSize: 26, color: "#3d5a78", fontWeight: 300, marginBottom: 10 }}>/100</span>
              <span className="mb-2 ml-1 inline-block rounded-xl px-3 py-1 text-xs font-bold"
                style={{ background: `${STATUS_COLOR[status] || "#10b981"}18`, color: STATUS_COLOR[status] || "#10b981", border: `1px solid ${STATUS_COLOR[status] || "#10b981"}30`, letterSpacing: "0.06em" }}>
                {status.toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-sm mb-1.5" style={{ color: "#e8f0f8" }}>{STATUS_MSG[status]}</p>
            {explanation && (
              <p className="text-sm leading-relaxed" style={{ color: "#7a9ab8", maxWidth: 420 }}>{explanation}</p>
            )}
          </div>
          <button onClick={() => navigate("/agents", { state: { autoRun: false } })}
            className="flex items-center gap-1.5 text-sm font-semibold mt-5 transition-all hover:gap-2.5 w-fit"
            style={{ color: STATUS_COLOR[status] || "#10b981" }}>
            See what's affecting my score <ChevronRight size={14} />
          </button>
        </div>

        {/* Right — ECG waveform */}
        <div className="md:w-[46%] flex flex-col justify-between px-4 md:px-6 pb-5 pt-5 md:pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="relative group">
            <canvas
              ref={canvasRef}
              width={560}
              height={130}
              style={{ width: "100%", height: 118, display: "block", borderRadius: 12 }}
            />
            <div className="absolute inset-x-0 top-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-xs font-medium px-3 py-1 rounded-lg"
                style={{ background: "rgba(14,28,46,0.92)", border: "1px solid rgba(255,255,255,0.1)", color: "#7a9ab8" }}>
                Financial momentum
              </span>
            </div>
          </div>

          {/* Data markers */}
          <div className="flex justify-between mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { label: "CASH",         value: fmt(metrics.bankBalance),      color: "#10b981" },
              { label: "RECEIVABLES",  value: fmt(metrics.overdueTotal),     color: "#ef4444" },
              { label: "NEXT 30 DAYS", value: fmt(metrics.upcomingExpenses), color: "#f59e0b" },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-xs font-bold mb-1" style={{ color: "#3d5a78", letterSpacing: "0.06em" }}>{m.label}</p>
                <p className="number-font font-bold text-sm" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
