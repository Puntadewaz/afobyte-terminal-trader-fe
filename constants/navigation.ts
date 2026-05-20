import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChartNoAxesCombined,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const PLATFORM_NAV: NavItem[] = [
  // { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Crypto", href: "/crypto", icon: ChartNoAxesCombined },
  // { label: "IDX", href: "/idx", icon: LineChart },
  // { label: "Portfolio", href: "/portfolio", icon: Wallet },
  // { label: "Watchlist", href: "/watchlist", icon: Star },
  // { label: "Alerts", href: "/alerts", icon: Bell },
  // { label: "Journal", href: "/journal", icon: NotebookPen },
  // { label: "Psychology", href: "/psychology", icon: Brain },
  // { label: "Guide", href: "/guide", icon: GraduationCap },
  // { label: "Capital Planning", href: "/capital-planning", icon: Scale },
  { label: "Rankings", href: "/rankings", icon: BookOpen },
];
