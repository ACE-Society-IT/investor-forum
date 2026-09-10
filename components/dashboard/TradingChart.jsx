"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function TradingChart({ stock }) {
  // Format spark_data into Recharts compatible array
  const chartData = useMemo(() => {
    if (!stock || !stock.spark_data || !Array.isArray(stock.spark_data)) return [];
    
    // We will generate sequential time labels since we lack explicit timestamps for history
    const dataLength = stock.spark_data.length;
    return stock.spark_data.map((price, index) => {
      // Calculate how many rounds ago
      const roundsAgo = dataLength - 1 - index;
      const label = roundsAgo === 0 ? "Now" : `T-${roundsAgo}`;
      return {
        time: label,
        price: Number(price)
      };
    });
  }, [stock]);

  if (!stock) {
    return (
      <div className="vercel-card rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] h-[400px] flex flex-col items-center justify-center text-[var(--text-muted)]">
        <Activity className="w-8 h-8 mb-2" />
        <p className="font-mono text-xs">Select an instrument to view telemetry</p>
      </div>
    );
  }

  const currentPrice = Number(stock.price || 0);
  const changePct = Number(stock.change_percent || 0);
  const isPos = changePct >= 0;

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pointPrice = payload[0].value;
      return (
        <div className="bg-[var(--surface-1)] border border-[var(--border-color)] rounded-lg p-3 shadow-xl text-xs font-mono">
          <p className="text-[var(--text-secondary)] mb-1">Time: {label}</p>
          <p className="text-[var(--text-primary)] font-bold text-sm">
            ${pointPrice.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="vercel-card rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {stock.ticker}
            </h2>
            {stock.sector && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--surface-3)] text-[var(--text-secondary)] shadow-[0_0_0_1px_var(--border-color)]">
                {stock.sector}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{stock.name}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--text-primary)] tnum">
            ${currentPrice.toFixed(2)}
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

      {/* Chart Area */}
      <div className="flex-1 p-4 min-h-[300px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'monospace' }}
                dy={10}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
                tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'monospace' }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPos ? "#10b981" : "#f43f5e"}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: isPos ? "#10b981" : "#f43f5e", stroke: "var(--surface-1)", strokeWidth: 2 }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[var(--text-tertiary)] font-mono">
            Insufficient historical data
          </div>
        )}
      </div>
    </div>
  );
}
