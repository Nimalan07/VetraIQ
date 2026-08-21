import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: ReactNode;
  title: string;
  active: string;
  onNavigate: (page: string) => void;
}

export default function Layout({
  children,
  title,
  active,
  onNavigate,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-white">

      <Sidebar
        active={active}
        onNavigate={onNavigate}
      />

      <main className="ml-64 min-h-screen">

        <Topbar title={title} />

        <div className="p-8">
          {children}
        </div>

      </main>

    </div>
  );
}
