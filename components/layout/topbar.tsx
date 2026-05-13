"use client";

import { Menu, Search } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";

export function Topbar() {
  const toggle = useUiStore((state) => state.toggleSidebar);
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-zinc-800 bg-zinc-950/90 px-3 backdrop-blur sm:px-4">
      <button
        onClick={toggle}
        className="rounded-md border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800"
        aria-label="Toggle sidebar"
        aria-expanded={isSidebarCollapsed}
      >
        <Menu size={16} />
      </button>
      <div className="ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-400 sm:ml-3 sm:max-w-xl">
        <Search size={14} />
        <input
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-zinc-600"
          placeholder="Search assets, modules, alerts"
        />
      </div>
      <div className="ml-auto hidden text-right sm:block">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Mode</p>
        <p className="text-sm font-medium text-zinc-200">Educational Intelligence</p>
      </div>
    </header>
  );
}
