"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";

interface LightweightChartProps {
  data: Array<{ time: string; open: number; high: number; low: number; close: number }>;
  indicators?: {
    ema20: boolean;
    ema50: boolean;
    ema200: boolean;
    rsi14: boolean;
    macd: boolean;
  };
}

export interface LightweightChartHandle {
  takeSnapshot: () => string | null;
}

function toTimestamp(value: string): UTCTimestamp {
  return Math.floor(new Date(value).getTime() / 1000) as UTCTimestamp;
}

function computeEma(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const multiplier = 2 / (period + 1);
  const result: number[] = [];
  let previous = values[0];

  for (let index = 0; index < values.length; index += 1) {
    const current = values[index];
    previous = index === 0 ? current : (current - previous) * multiplier + previous;
    result.push(previous);
  }

  return result;
}

function computeRsi(values: number[], period: number): Array<number | null> {
  if (values.length < period + 1) return values.map(() => null);

  const result: Array<number | null> = values.map(() => null);
  let gainSum = 0;
  let lossSum = 0;

  for (let index = 1; index <= period; index += 1) {
    const delta = values[index] - values[index - 1];
    if (delta >= 0) {
      gainSum += delta;
    } else {
      lossSum += Math.abs(delta);
    }
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  const baseRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result[period] = 100 - 100 / (1 + baseRs);

  for (let index = period + 1; index < values.length; index += 1) {
    const delta = values[index] - values[index - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result[index] = 100;
      continue;
    }

    const rs = avgGain / avgLoss;
    result[index] = 100 - 100 / (1 + rs);
  }

  return result;
}

function toLineData(times: UTCTimestamp[], values: Array<number | null>): LineData<UTCTimestamp>[] {
  const points: LineData<UTCTimestamp>[] = [];
  for (let index = 0; index < times.length; index += 1) {
    const value = values[index];
    if (value === null || !Number.isFinite(value)) continue;
    points.push({ time: times[index], value: Number(value.toFixed(6)) });
  }
  return points;
}

function toHistogramData(times: UTCTimestamp[], values: number[]): HistogramData<UTCTimestamp>[] {
  return values.map((value, index) => ({
    time: times[index],
    value: Number(value.toFixed(6)),
    color: value >= 0 ? "#22c55e" : "#ef4444",
  }));
}

export const LightweightChart = forwardRef<LightweightChartHandle, LightweightChartProps>(
  function LightweightChart({ data, indicators }, forwardedRef) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const indicatorVisibility = {
    ema20: indicators?.ema20 ?? true,
    ema50: indicators?.ema50 ?? true,
    ema200: indicators?.ema200 ?? true,
    rsi14: indicators?.rsi14 ?? true,
    macd: indicators?.macd ?? true,
  };

  useImperativeHandle(forwardedRef, () => ({
    takeSnapshot: () => {
      if (!chartRef.current) return null;

      try {
        const canvas = chartRef.current.takeScreenshot();
        return canvas.toDataURL("image/png");
      } catch {
        return null;
      }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const candles = data.map((item) => ({
      ...item,
      time: toTimestamp(item.time),
    }));

    if (candles.length === 0) return;

    const times = candles.map((item) => item.time);
    const closes = candles.map((item) => item.close);
    const ema20 = computeEma(closes, 20);
    const ema50 = computeEma(closes, 50);
    const ema200 = computeEma(closes, 200);
    const rsi14 = computeRsi(closes, 14);
    const ema12 = computeEma(closes, 12);
    const ema26 = computeEma(closes, 26);
    const macdLine = ema12.map((value, index) => value - ema26[index]);
    const signalLine = computeEma(macdLine, 9);
    const histogram = macdLine.map((value, index) => value - signalLine[index]);

    const hasRsi = indicatorVisibility.rsi14;
    const hasMacd = indicatorVisibility.macd;
    const chartHeight = hasRsi || hasMacd ? 520 : 360;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0b" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "#27272a" },
        horzLines: { color: "#27272a" },
      },
      rightPriceScale: { borderColor: "#3f3f46" },
      timeScale: { borderColor: "#3f3f46" },
      crosshair: { vertLine: { color: "#06b6d4" }, horzLine: { color: "#06b6d4" } },
      width: containerRef.current.clientWidth,
      height: chartHeight,
    });

    chart.priceScale("right").applyOptions({
      scaleMargins: {
        top: 0.04,
        bottom: hasRsi && hasMacd ? 0.45 : hasRsi || hasMacd ? 0.24 : 0.08,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    series.setData(
      candles as CandlestickData<UTCTimestamp>[],
    );

    if (indicatorVisibility.ema20) {
      const ema20Series = chart.addSeries(LineSeries, {
        color: "#f59e0b",
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      ema20Series.setData(toLineData(times, ema20));
    }

    if (indicatorVisibility.ema50) {
      const ema50Series = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      ema50Series.setData(toLineData(times, ema50));
    }

    if (indicatorVisibility.ema200) {
      const ema200Series = chart.addSeries(LineSeries, {
        color: "#a855f7",
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      ema200Series.setData(toLineData(times, ema200));
    }

    if (hasRsi) {
      const rsiSeries = chart.addSeries(LineSeries, {
        color: "#06b6d4",
        lineWidth: 2,
        priceScaleId: "rsi",
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const rsiUpperBand = chart.addSeries(LineSeries, {
        color: "#52525b",
        lineWidth: 1,
        lineStyle: 2,
        priceScaleId: "rsi",
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const rsiLowerBand = chart.addSeries(LineSeries, {
        color: "#52525b",
        lineWidth: 1,
        lineStyle: 2,
        priceScaleId: "rsi",
        lastValueVisible: false,
        priceLineVisible: false,
      });

      chart.priceScale("rsi").applyOptions({
        borderColor: "#3f3f46",
        scaleMargins: hasMacd ? { top: 0.62, bottom: 0.2 } : { top: 0.62, bottom: 0.04 },
      });

      rsiSeries.setData(toLineData(times, rsi14));
      rsiUpperBand.setData(times.map((time) => ({ time, value: 70 })));
      rsiLowerBand.setData(times.map((time) => ({ time, value: 30 })));
    }

    if (hasMacd) {
      const macdHistogramSeries = chart.addSeries(HistogramSeries, {
        priceScaleId: "macd",
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const macdSeries = chart.addSeries(LineSeries, {
        color: "#22d3ee",
        lineWidth: 2,
        priceScaleId: "macd",
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const signalSeries = chart.addSeries(LineSeries, {
        color: "#fb7185",
        lineWidth: 2,
        priceScaleId: "macd",
        lastValueVisible: false,
        priceLineVisible: false,
      });

      chart.priceScale("macd").applyOptions({
        borderColor: "#3f3f46",
        scaleMargins: hasRsi ? { top: 0.82, bottom: 0.02 } : { top: 0.62, bottom: 0.02 },
      });

      macdHistogramSeries.setData(toHistogramData(times, histogram));
      macdSeries.setData(toLineData(times, macdLine));
      signalSeries.setData(toLineData(times, signalLine));
    }

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    });

    resizeObserver.observe(containerRef.current);
    chartRef.current = chart;

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, indicatorVisibility.ema20, indicatorVisibility.ema50, indicatorVisibility.ema200, indicatorVisibility.macd, indicatorVisibility.rsi14]);

    return <div ref={containerRef} className="w-full" style={{ height: indicatorVisibility.rsi14 || indicatorVisibility.macd ? 520 : 360 }} />;
  },
);

LightweightChart.displayName = "LightweightChart";
