const MAP = {
  low: { label: "Low traffic", dot: "bg-congestion-low", text: "text-congestion-low", bg: "bg-congestion-low/10" },
  medium: { label: "Moderate", dot: "bg-congestion-medium", text: "text-congestion-medium", bg: "bg-congestion-medium/10" },
  high: { label: "Crowded", dot: "bg-congestion-high", text: "text-congestion-high", bg: "bg-congestion-high/10" },
};

export const CongestionBadge = ({ level = "low", size = "md" }) => {
  const m = MAP[level] || MAP.low;
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm font-medium tracking-tight ${m.bg} ${m.text} ${padding}`}
      data-testid={`congestion-${level}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

export default CongestionBadge;
