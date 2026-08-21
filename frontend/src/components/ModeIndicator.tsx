interface Props {
  demo?: boolean;
}

export default function ModeIndicator({
  demo = false,
}: Props) {
  return (
    <div
      className={`
        inline-flex items-center gap-2
        rounded-full border px-3 py-1.5
        text-[11px]
        ${
          demo
            ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
            : "border-green-500/20 bg-green-500/10 text-green-400"
        }
      `}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {demo
        ? "Demo Mode"
        : "Live Processing"}
    </div>
  );
}
