import { ExternalLink, FileText } from "lucide-react";

interface Props {
  source: string | null;
}

export default function SourceTag({
  source,
}: Props) {

  if (!source) {
    return (
      <span className="text-xs text-gray-600">
        No source
      </span>
    );
  }

  const isUrl =
    source.startsWith("http");

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">

      {isUrl ? (
        <ExternalLink
          size={12}
          className="shrink-0 text-orange"
        />
      ) : (
        <FileText
          size={12}
          className="shrink-0 text-orange"
        />
      )}

      {isUrl ? (
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="max-w-[220px] truncate text-[11px] text-gray-400 hover:text-orange"
        >
          Source
        </a>
      ) : (
        <span className="max-w-[220px] truncate text-[11px] text-gray-400">
          {source}
        </span>
      )}

    </div>
  );
}
