import {
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Props {
  flags: string[];
}

export default function ValidationFlags({
  flags,
}: Props) {

  if (!flags || flags.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-400">
        <CheckCircle2 size={14} />
        No validation issues
      </div>
    );
  }

  return (
    <div className="space-y-2">

      {flags.map(
        (flag, index) => (
          <div
            key={`${flag}-${index}`}
            className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400"
          >
            <AlertTriangle size={13} />

            {flag.replace(
              /_/g,
              " "
            )}
          </div>
        )
      )}

    </div>
  );
}
