import ConfidenceBadge from "./ConfidenceBadge";
import SourceTag from "./SourceTag";

interface ProductFieldProps {
  label: string;
  field: {
    value: any;
    confidence: number;
    method: string | null;
    source_ref: string | null;
    flags: string[];
  } | undefined;
}

export default function ProductField({
  label,
  field,
}: ProductFieldProps) {
  const value = field?.value;

  return (
    <div className="grid gap-4 border-b border-white/5 p-5 md:grid-cols-[180px_1fr_120px_180px] items-center">
      {/* Label */}
      <div className="text-xs font-medium text-gray-500">
        {label}
      </div>

      {/* Value */}
      <div>
        {Array.isArray(value) ? (
          <p className="text-sm text-gray-200">{value.join(", ")}</p>
        ) : value !== null && value !== undefined && value !== "" ? (
          <>
            <p className="text-sm text-gray-200">{String(value)}</p>
            {field?.method && (
              <span
                className={`
                  mt-2 inline-block rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider
                  ${
                    field.method === "enriched"
                      ? "bg-orange/10 text-orange"
                      : "bg-blue-500/10 text-blue-400"
                  }
                `}
              >
                {field.method === "enriched" ? "WEB ENRICHED" : "DOCUMENT"}
              </span>
            )}
          </>
        ) : (
          <span className="italic text-gray-700">
            Not available
          </span>
        )}
      </div>

      {/* Confidence */}
      <div>
        <ConfidenceBadge confidence={field?.confidence ?? 0} />
      </div>

      {/* Source */}
      <div>
        <SourceTag source={field?.source_ref || null} />
      </div>
    </div>
  );
}
