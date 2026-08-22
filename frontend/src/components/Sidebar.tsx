import {
  LayoutDashboard,
  Upload,
  Package,
  FileOutput,
  Settings,
} from "lucide-react";
import logoImg from "../assets/logo.png";

interface SidebarProps {
  active: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({
  active,
  onNavigate,
}: SidebarProps) {
  const items = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "upload",
      label: "Upload",
      icon: Upload,
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
    },
    {
      id: "export",
      label: "Export",
      icon: FileOutput,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-[#090909] p-5">

      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-black/20 border border-white/5">
          <img src={logoImg} className="h-full w-full object-contain" alt="VetraIQ Logo" />
        </div>

        <div>
          <h1 className="text-lg font-bold">
            Vetra<span className="text-orange">IQ</span>
          </h1>

          <p className="text-[10px] text-gray-500">
            INDUSTRIAL INTELLIGENCE
          </p>
        </div>

      </div>

      {/* Navigation */}

      <div className="space-y-2">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Workspace
        </p>

        {items.map((item) => {

          const Icon = item.icon;

          const selected =
            active === item.id;

          return (
            <button
              key={item.id}
              onClick={() =>
                onNavigate(item.id)
              }
              className={`
                flex w-full items-center gap-3
                rounded-xl px-3 py-3
                text-sm transition
                ${
                  selected
                    ? "bg-orange/10 text-orange"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon size={18} />

              {item.label}

              {selected && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-orange" />
              )}
            </button>
          );
        })}

      </div>

      {/* Bottom */}

      <div className="absolute bottom-5 left-5 right-5">

        <div className="glass rounded-2xl p-4">

          <div className="mb-3 flex items-center gap-2">
            <Settings
              size={15}
              className="text-gray-500"
            />

            <span className="text-xs text-gray-400">
              System
            </span>
          </div>

          <div className="flex items-center justify-between">

            <span className="text-xs text-gray-500">
              API Status
            </span>

            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Online
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}
