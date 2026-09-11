import { LucideIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

type Props = {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
  sparkData?: { v: number }[];
  accentColor?: string;
};

export default function MetricCard({
  label,
  value,
  change,
  changePositive,
  sub,
  icon: Icon,
  iconColor = "#10b981",
  sparkData,
  accentColor = "#10b981",
}: Props) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 fade-in"
      style={{
        background: "#0d1520",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: "#3d5168" }}>{label}</p>
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, background: `${iconColor}15`, border: `1px solid ${iconColor}25` }}
        >
          <Icon size={14} color={iconColor} />
        </div>
      </div>

      <div>
        <p className="number-font font-bold" style={{ fontSize: 26, color: "#f0f4f8", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {change && (
            <span
              className="text-xs font-medium"
              style={{ color: changePositive ? "#10b981" : "#ef4444" }}
            >
              {change}
            </span>
          )}
          {sub && <span className="text-xs" style={{ color: "#3d5168" }}>{sub}</span>}
        </div>
      </div>

      {sparkData && sparkData.length > 0 && (
        <div style={{ height: 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
