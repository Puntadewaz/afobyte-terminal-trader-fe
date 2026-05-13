"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORM_NAV } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

export function Sidebar() {
  const pathname = usePathname();
  const isCollapsed = useUiStore((state) => state.isSidebarCollapsed);

  return (
    <aside
      className={cn(
        "border-r border-zinc-800 bg-zinc-950 transition-all duration-200",
        isCollapsed ? "w-20" : "w-72",
      )}
    >
      <div className="border-b border-zinc-800 px-4 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-400">AfoByte</p>
        {!isCollapsed ? (
          <h1 className="mt-1 text-sm font-semibold text-zinc-100">
            Personal Investment Intelligence
          </h1>
        ) : null}
      </div>
      <nav className="space-y-1 p-3">
        {PLATFORM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-cyan-600/20 text-cyan-300"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
              )}
            >
              <Icon size={16} />
              {!isCollapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
