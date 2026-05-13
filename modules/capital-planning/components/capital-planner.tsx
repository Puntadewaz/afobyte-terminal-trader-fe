"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  capital: z.number().positive(),
  targetAmount: z.number().positive(),
  durationDays: z.number().int().min(1).max(3650),
  winRate: z.number().min(20).max(95),
  riskPerTrade: z.number().min(0.1).max(5),
});

type FormValues = z.infer<typeof schema>;

interface PlanResult {
  required_growth_pct: number;
  estimated_required_trades: number;
  estimated_fee_impact: number;
  diversification_suggestion: string;
  realistic_expectation: string;
  feasibility_warning: string[];
}

export function CapitalPlanner() {
  const [result, setResult] = useState<PlanResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      capital: 10000,
      targetAmount: 20000,
      durationDays: 180,
      winRate: 52,
      riskPerTrade: 1,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch("/api/v1/capital-planning/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capital: values.capital,
        target_amount: values.targetAmount,
        duration_days: values.durationDays,
        estimated_winrate: values.winRate / 100,
        risk_per_trade_pct: values.riskPerTrade / 100,
        avg_rr: 1.8,
        estimated_fee_per_trade_pct: 0.001,
      }),
    });

    const wrapped = (await response.json()) as { success: boolean; data: PlanResult };
    const payload = wrapped.data;
    setResult(payload);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Capital Planning Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Capital" error={errors.capital?.message}>
              <Input type="number" step="0.01" {...register("capital", { valueAsNumber: true })} />
            </Field>
            <Field label="Target Amount" error={errors.targetAmount?.message}>
              <Input
                type="number"
                step="0.01"
                {...register("targetAmount", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Duration (Days)" error={errors.durationDays?.message}>
              <Input
                type="number"
                step="1"
                {...register("durationDays", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Estimated Winrate (%)" error={errors.winRate?.message}>
              <Input type="number" step="0.1" {...register("winRate", { valueAsNumber: true })} />
            </Field>
            <Field label="Risk per Trade (%)" error={errors.riskPerTrade?.message}>
              <Input
                type="number"
                step="0.1"
                {...register("riskPerTrade", { valueAsNumber: true })}
              />
            </Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Calculating..." : "Analyze Feasibility"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feasibility Output</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          {result ? (
            <>
              <p>Required annualized growth: {result.required_growth_pct.toFixed(2)}%</p>
              <p>Estimated trade count: {result.estimated_required_trades}</p>
              <p>Estimated fee impact: {result.estimated_fee_impact.toFixed(2)}%</p>
              <p>Expectation: {result.realistic_expectation}</p>
              <p>{result.diversification_suggestion}</p>
              {result.feasibility_warning.length > 0 ? (
                <p>Warnings: {result.feasibility_warning.join("; ")}</p>
              ) : null}
            </>
          ) : (
            <p>Run the calculator to view realistic probability and risk guidance.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm text-zinc-300">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}
