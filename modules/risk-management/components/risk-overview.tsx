import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RiskOverview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Risk Warnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          <p>Cut loss discipline prevents a single trade from dominating total drawdown.</p>
          <p>When RR is below 1.4, signal quality must be significantly higher to justify entry.</p>
          <p>Target growth above 50% annually requires materially higher variance exposure.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Exposure Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          <p>Max single-position risk: 1.2% of total capital.</p>
          <p>Max correlated exposure by market: 45%.</p>
          <p>Diversification warning activates if concentration exceeds 35%.</p>
        </CardContent>
      </Card>
    </div>
  );
}
