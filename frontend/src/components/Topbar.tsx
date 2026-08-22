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

    </header>
  );
}
