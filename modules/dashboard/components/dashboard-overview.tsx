"use client";

import { useDashboardQuery } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCompact, formatCurrency, formatSigned } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function DashboardOverview() {
  const { data, isLoading } = useDashboardQuery();

  if (isLoading || !data) {
    return <p className="text-sm text-zinc-400">Loading dashboard intelligence...</p>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Portfolio Value</CardTitle>
          <Badge variant="info">Live</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-zinc-100">{formatCurrency(data.totalPortfolioValue)}</p>
          <p className="mt-2 text-xs text-zinc-400">Daily PnL {formatSigned(data.dailyPnl)}</p>
          <p className="text-xs text-zinc-400">Weekly PnL {formatSigned(data.weeklyPnl)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Exposure</CardTitle>
          <Badge variant={data.riskExposure > 70 ? "warning" : "neutral"}>{data.riskExposure}/100</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={data.riskExposure} />
          <p className="text-xs text-zinc-400">
            Higher exposure raises drawdown sensitivity. Keep concentration controlled.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market Summary</CardTitle>
          <Badge variant="neutral">Sentiment</Badge>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm text-zinc-300">Fear & Greed: {data.fearGreed}/100</p>
          <p className="text-sm text-zinc-300">
            Opportunities tracked: {formatCompact(data.topOpportunities.length)}
          </p>
          <p className="text-xs text-zinc-500">
            Sentiment is only context, not a standalone signal.
          </p>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Allocation Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.allocation.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <Progress value={item.value} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recentAlerts.slice(0, 4).map((alert) => (
            <div key={alert.id} className="rounded-md border border-zinc-800 p-2">
              <p className="text-xs font-medium text-zinc-200">{alert.title}</p>
              <p className="text-xs text-zinc-500">{alert.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
