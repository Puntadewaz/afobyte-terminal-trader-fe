"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePsychologyQuery } from "@/hooks/use-psychology";

function bandVariant(band?: string) {
  if (band === "high") return "bullish" as const;
  if (band === "medium") return "warning" as const;
  return "bearish" as const;
}

function ScoreMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value.toFixed(5)}</p>
      <Progress className="mt-2" value={Math.max(0, Math.min(100, value))} />
    </div>
  );
}

export function PsychologyPanel() {
  const { data, isLoading, error } = usePsychologyQuery();
  const disciplineScore = data?.discipline_score ?? 0;
  const disciplineBand = data?.discipline_band ?? "low";
  const asOf = data?.as_of ? new Date(data.as_of).toLocaleString() : "n/a";
  const warnings = data?.warnings ?? [];

  return (
    <div className="space-y-4">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-zinc-100">Trading Psychology</h2>
          <Badge variant={bandVariant(disciplineBand)}>Discipline: {disciplineBand}</Badge>
        </div>
        <p className="text-sm text-zinc-400">
          Behavioral risk profile generated from your current portfolio activity.
        </p>
      </header>

      {isLoading ? <p className="text-sm text-zinc-400">Loading psychology profile...</p> : null}
      {error ? <p className="text-sm text-red-400">Failed to load psychology data.</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Discipline Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <ScoreMetric label="Discipline Score" value={disciplineScore} />
          <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
            <p className="text-xs text-zinc-500">As Of</p>
            <p className="mt-1 text-sm text-zinc-200">{asOf}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        <ScoreMetric label="Overtrading Risk" value={data?.overtrading_score ?? 0} />
        <ScoreMetric label="Emotional Risk" value={data?.emotional_risk_score ?? 0} />
        <ScoreMetric label="Concentration Risk" value={data?.concentration_risk_score ?? 0} />
        <ScoreMetric label="Unrealistic Target Risk" value={data?.unrealistic_target_score ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          {warnings.length === 0 ? <p>No active psychology warnings.</p> : null}
          {warnings.map((warning) => (
            <p key={warning} className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              - {warning}
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Execution Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            <p>- Keep risk per trade fixed and avoid impulsive size increase.</p>
            <p>- Follow invalidation rules before adding or averaging positions.</p>
            <p>- Review warnings above before opening new trades.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reflection Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-300">
            <p className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
              Which warning influenced your latest decision, and how will you prevent it on the next trade?
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
