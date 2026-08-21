interface Props {
  confidence: number;
}

export default function ConfidenceBadge({
  confidence,
}: Props) {
  const percentage =
    Math.round(confidence * 100);

  let label = "Low";
  let style =
    "border-red-500/20 bg-red-500/10 text-red-400";

  if (confidence >= 0.8) {
    label = "High";
    style =
      "border-green-500/20 bg-green-500/10 text-green-400";
  } else if (confidence >= 0.6) {
    label = "Medium";
    style =
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {label} · {percentage}%
    </span>
  );
}
