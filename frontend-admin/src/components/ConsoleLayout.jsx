import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function ConsoleLayout({ eyebrow, title, action, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink flex">
      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-ink/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border sticky top-0 bg-ink z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-text-muted hover:text-text p-1 -ml-1"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 font-display font-semibold text-base">
            <span className="size-5 rounded-full border-2 border-amber border-r-transparent rotate-45" aria-hidden="true" />
            Circul <span className="text-text-muted font-normal text-sm">Admin</span>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6 lg:mb-8">
            <div>
              {eyebrow && (
                <p className="font-mono text-xs tracking-widest text-amber uppercase mb-1.5">{eyebrow}</p>
              )}
              <h1 className="font-display text-xl lg:text-2xl font-semibold text-text">{title}</h1>
            </div>
            {action}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
