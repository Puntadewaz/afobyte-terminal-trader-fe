import { DashboardOverview } from "@/modules/dashboard/components/dashboard-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-3">
      <header>
        <h2 className="text-xl font-semibold text-zinc-100">Global Dashboard</h2>
        <p className="text-sm text-zinc-400">
          Ringkasan cepat untuk melihat kondisi portfolio, exposure risiko, sentimen market, dan alert terbaru.
        </p>
      </header>
      <DashboardOverview />
    </div>
  );
}
