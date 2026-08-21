import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: Props) {
  return (
    <div className="glass orange-glow rounded-2xl p-5 transition hover:border-white/15">

      <div className="mb-5 flex items-center justify-between">

        <div className="rounded-xl bg-orange/10 p-2.5 text-orange">
          <Icon size={18} />
        </div>

      </div>

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <div className="mt-1 text-3xl font-semibold">
        {value}
      </div>

      <p className="mt-2 text-xs text-gray-600">
        {subtitle}
      </p>

    </div>
  );
}
