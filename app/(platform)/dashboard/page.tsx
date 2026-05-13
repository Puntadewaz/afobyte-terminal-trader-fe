import { DashboardOverview } from "@/modules/dashboard/components/dashboard-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-3">
      <header>
        <h2 className="text-xl font-semibold text-zinc-100">Global Dashboard</h2>
        <p className="text-sm text-zinc-400">
          Unified portfolio intelligence focused on Crypto market.
        </p>
      </header>
      <DashboardOverview />
    </div>
  );
}
