"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { http } from "@/services/api/http";

interface BookkeepingPayload {
  period: "monthly";
  totals: {
    deposits: number;
    withdrawals: number;
    expenses: number;
    fees: number;
  };
}

export function BookkeepingPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["bookkeeping"],
    queryFn: () =>
      http<BookkeepingPayload>("/api/v1/bookkeeping/reports?period=monthly", undefined, {
        withUserId: true,
      }),
  });

  const net =
    !data
      ? 0
      : data.totals.deposits - data.totals.withdrawals - data.totals.expenses - data.totals.fees;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Net Worth</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-zinc-100">
            {isLoading || !data ? "..." : formatCurrency(net)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-zinc-100">
            {isLoading || !data
              ? "..."
              : `${((net / Math.max(data.totals.deposits, 1)) * 100).toFixed(5)}%`}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-zinc-100">
            {isLoading || !data ? "..." : formatCurrency(data.totals.fees)}
          </p>
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Monthly Totals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-4">
          {isLoading || !data ? (
            <p className="text-sm text-zinc-400">Loading totals...</p>
          ) : (
            (
              [
                ["Deposits", data.totals.deposits],
                ["Withdrawals", data.totals.withdrawals],
                ["Expenses", data.totals.expenses],
                ["Fees", data.totals.fees],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-md border border-zinc-800 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{label}</p>
                <p className="text-sm text-zinc-200">{formatCurrency(value)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
