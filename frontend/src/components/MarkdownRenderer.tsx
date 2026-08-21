
interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  // Simple custom Markdown parser for technical catalog sheets
  const blocks = content.split(/\n\n+/);

  const parseInline = (text: string) => {
    // Replace **bold** with strong
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-white">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-5 text-gray-300 leading-relaxed text-sm">
      {blocks.map((block, blockIndex) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Headers
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={blockIndex} className="text-2xl font-bold text-white border-b border-white/10 pb-2 mt-6 uppercase tracking-wide">
              {parseInline(trimmed.substring(2))}
            </h1>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={blockIndex} className="text-lg font-semibold text-orange mt-5 pb-1">
              {parseInline(trimmed.substring(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={blockIndex} className="text-sm font-medium text-gray-400 uppercase tracking-[0.1em] mt-3">
              {parseInline(trimmed.substring(4))}
            </h3>
          );
        }

        // 2. Horizontal Rule
        if (trimmed === "---") {
          return <hr key={blockIndex} className="border-white/10 my-4" />;
        }

        // 3. Lists
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split(/\n- /);
          return (
            <ul key={blockIndex} className="list-none space-y-2 pl-4">
              {items.map((item, itemIndex) => {
                const cleanedItem = itemIndex === 0 ? item.substring(2) : item;
                return (
                  <li key={itemIndex} className="relative pl-5 before:content-['•'] before:absolute before:left-0 before:text-orange before:font-bold">
                    {parseInline(cleanedItem)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // 4. Tables
        if (trimmed.startsWith("|")) {
          const lines = trimmed.split("\n").filter(l => l.trim().startsWith("|"));
          if (lines.length >= 2) {
            // Find header rows
            const parseRow = (rowStr: string) => {
              return rowStr
                .split("|")
                .map(cell => cell.trim())
                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            };

            const headerCells = parseRow(lines[0]);
            // Skip index 1 because it's the divider row like |---|---|
            const rowLines = lines.slice(2);

            return (
              <div key={blockIndex} className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02] my-4">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.05] text-gray-400 font-semibold uppercase tracking-wider">
                      {headerCells.map((cell, idx) => (
                        <th key={idx} className="p-3">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rowLines.map((rowLine, rowIdx) => {
                      const cells = parseRow(rowLine);
                      return (
                        <tr key={rowIdx} className="hover:bg-white/[0.01] transition">
                          {cells.map((cell, cellIdx) => (
                            <td key={cellIdx} className="p-3">
                              {parseInline(cell)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 5. Default Paragraph
        return (
          <p key={blockIndex} className="text-gray-300">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
