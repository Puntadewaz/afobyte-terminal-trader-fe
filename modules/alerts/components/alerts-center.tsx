"use client";

import { useState } from "react";
import { useAlertsQuery } from "@/hooks/use-alerts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export function AlertsCenter() {
  const { data, isLoading } = useAlertsQuery();
  const [filter, setFilter] = useState("all");

  const rows =
    data?.filter((alert) => (filter === "all" ? true : alert.severity === filter)) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Center</CardTitle>
        <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="extreme">Extreme</option>
        </Select>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-zinc-400">Loading alerts...</p>
        ) : (
          rows.map((alert) => (
            <div key={alert.id} className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-200">{alert.title}</p>
                <Badge variant={alert.severity === "high" || alert.severity === "extreme" ? "warning" : "info"}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400">{alert.detail}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
