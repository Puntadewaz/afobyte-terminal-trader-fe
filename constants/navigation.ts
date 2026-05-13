import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Brain,
  BookOpen,
  ChartNoAxesCombined,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  Scale,
  Star,
  Wallet,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const PLATFORM_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Crypto", href: "/crypto", icon: ChartNoAxesCombined },
  // { label: "IDX", href: "/idx", icon: LineChart },
  { label: "US Stocks", href: "/us-stocks", icon: Gauge },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Watchlist", href: "/watchlist", icon: Star },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Journal", href: "/journal", icon: NotebookPen },
  { label: "Psychology", href: "/psychology", icon: Brain },
  { label: "Guide", href: "/guide", icon: GraduationCap },
  { label: "Capital Planning", href: "/capital-planning", icon: Scale },
  { label: "Rankings", href: "/rankings", icon: BookOpen },
];
