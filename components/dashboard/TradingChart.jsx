"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function TradingChart({ stock }) {
  const chartData = useMemo(() => {
    if (!stock?.spark_data || !Array.isArray(stock.spark_data) || stock.spark_data.length < 2) return [];

    const len = stock.spark_data.length;
    const dbTimestamps = Array.isArray(stock.spark_timestamps) ? stock.spark_timestamps : [];

    // Latest anchor time: use the newest timestamp from the DB, fallback to stock.updated_at or Date.now()
    const latestAnchor = dbTimestamps.length > 0
      ? new Date(dbTimestamps[dbTimestamps.length - 1]).getTime()
      : (stock?.updated_at ? new Date(stock.updated_at).getTime() : Date.now());

    return stock.spark_data.map((price, i) => {
      const roundsAgo = len - 1 - i;
      const currentVal = Number(price);

      // Use the actual persisted timestamp from Supabase if available; otherwise calculate relative interval
      const rawIso = dbTimestamps[i];
      const pointDate = rawIso
        ? new Date(rawIso)
        : new Date(latestAnchor - roundsAgo * 15000);

      // Format in user's local time (e.g. "1:47:15 AM")
      const timeLabel = pointDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
      });

      // Last price algorithm: compare each point against the immediate prior tick
      const prevPrice = i > 0
        ? Number(stock.spark_data[i - 1])
        : Number(stock.previous_price || currentVal);
      const diff = currentVal - prevPrice;
      const diffPct = prevPrice > 0 ? ((diff / prevPrice) * 100).toFixed(2) : "0.00";

      return {
        time: timeLabel,
        isoTime: pointDate.toISOString(),
        price: currentVal,
        prevPrice,
        diff,
        diffPct
      };
    });
  }, [stock]);

  if (!stock) {
    return (
      <div className="vercel-card rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] h-full min-h-[360px] flex flex-col items-center justify-center text-[var(--text-muted)]">
        <Activity className="w-8 h-8 mb-2" />
        <p className="font-mono text-xs">Select an instrument to view telemetry</p>
      </div>
    );
  }

  const currentPrice = Number(stock.price || 0);
  const changePct = Number(stock.change_percent || 0);
  const isPos = changePct >= 0;
  const strokeColor = isPos ? "#10b981" : "#f43f5e";
  const gradientId = `area-gradient-${stock.id || "default"}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const dataPoint = payload[0].payload;
    const pointPrice = payload[0].value;
    const diff = dataPoint?.diff !== undefined
      ? Number(dataPoint.diff)
      : pointPrice - (Number(stock.previous_price) || pointPrice);
    const diffPct = dataPoint?.diffPct !== undefined
      ? dataPoint.diffPct
      : (Number(stock.change_percent) || 0).toFixed(2);
    const isDiffPos = diff >= 0;

    return (
      <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-xl p-3 shadow-2xl text-xs font-mono backdrop-blur-md">
        <p className="text-[var(--text-tertiary)] text-[10px] mb-1.5 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {label}
        </p>
        <p className="text-[var(--text-primary)] font-bold text-base tnum">
          ${pointPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`text-[10px] font-bold mt-1 ${isDiffPos ? "text-emerald-500" : "text-rose-500"}`}>
          {isDiffPos ? "▲" : "▼"} {isDiffPos ? "+" : ""}{diff.toFixed(2)} ({isDiffPos ? "+" : ""}{diffPct}%)
        </p>
      </div>
    );
  };

  return (
    <div className="vercel-card rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] h-full flex flex-col min-h-[360px]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {stock.ticker}
            </h2>
            {stock.sector && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface-3)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)]">
                {stock.sector}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">{stock.name}</p>
        </div>

        <div className="text-right">
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tnum">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-semibold tnum px-2 py-0.5 rounded mt-1 ${
              isPos
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-[0_0_0_1px_rgba(244,63,94,0.25)]"
            }`}
          >
            {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isPos ? "+" : ""}{changePct.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3 sm:p-4" style={{ minHeight: 260 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="85%" stopColor={strokeColor} stopOpacity={0.05} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.4} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "monospace" }}
                dy={8}
                minTickGap={35}
              />
              <YAxis
                domain={["dataMin - 20", "dataMax + 20"]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
                tick={{ fill: "var(--text-tertiary)", fontSize: 10, fontFamily: "monospace" }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--text-tertiary)", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: strokeColor,
                  stroke: "var(--surface-1)",
                  strokeWidth: 2.5
                }}
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[var(--text-tertiary)] font-mono">
            Insufficient historical data for this instrument
          </div>
        )}
      </div>
    </div>
  );
}
