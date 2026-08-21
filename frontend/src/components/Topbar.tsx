import { Bell, Search } from "lucide-react";

interface TopbarProps {
  title: string;
}

export default function Topbar({
  title,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/5 bg-[#070707]/80 px-8 backdrop-blur-xl">

      <div>
        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Industrial product intelligence
        </p>
      </div>

      <div className="flex items-center gap-4">

        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 md:flex">
          <Search
            size={15}
            className="text-gray-500"
          />

          <span className="text-xs text-gray-500">
            Search products...
          </span>
        </div>

        <button className="rounded-xl border border-white/10 p-2.5 text-gray-400 hover:text-white">
          <Bell size={17} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-xs font-bold">
          AI
        </div>

      </div>

    </header>
  );
}
