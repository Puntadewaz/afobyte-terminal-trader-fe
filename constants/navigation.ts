import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  ChartNoAxesCombined,
  CircleDollarSign,
  LayoutDashboard,
  NotebookPen,
  Scale,
  Settings,
  ShieldAlert,
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
  // { label: "US Stocks", href: "/us-stocks", icon: Gauge },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Watchlist", href: "/watchlist", icon: Star },
  { label: "Bookkeeping", href: "/bookkeeping", icon: CircleDollarSign },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Journal", href: "/journal", icon: NotebookPen },
  { label: "Risk Mgmt", href: "/risk-management", icon: ShieldAlert },
  { label: "Capital Planning", href: "/capital-planning", icon: Scale },
  { label: "Rankings", href: "/rankings", icon: BookOpen },
  { label: "Settings", href: "/settings", icon: Settings },
];
