"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp } from "lucide-react"
import { formatNgn, formatUsdt } from "@/lib/format"

const CHART_HEIGHT = 300
const GRID_STROKE = "#1f2937"
const AXIS_TICK = { fill: "#9ca3af", fontSize: 11 }

type MetricView = "both" | "ngn" | "usd"

interface VolumeRow {
  date: string
  ngn: number
  usd: number
}

interface TransactionVolumeChartProps {
  data: VolumeRow[]
}

function formatChartDate(iso: string) {
  const d = new Date(iso + "T12:00:00")
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" })
}

function formatCompactNgn(v: number) {
  if (v >= 1_000_000_000) return `₦${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `₦${(v / 1000).toFixed(0)}k`
  return `₦${v}`
}

function formatCompactUsd(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v}`
}

function VolumeTooltip({
  active,
  payload,
  label,
  view,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string; dataKey?: string }[]
  label?: string
  view: MetricView
}) {
  if (!active || !payload?.length) return null
  const ngn = payload.find((p) => p.dataKey === "ngn")?.value ?? 0
  const usd = payload.find((p) => p.dataKey === "usd")?.value ?? 0

  return (
    <div className="rounded-lg border border-border bg-[#111419]/95 px-3 py-2.5 shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label ? formatChartDate(label) : ""}
      </p>
      {(view === "both" || view === "ngn") && (
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-gray-300">NGN</span>
          <span className="ml-auto font-semibold text-emerald-400">{formatNgn(Number(ngn))}</span>
        </div>
      )}
      {(view === "both" || view === "usd") && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          <span className="text-gray-300">USD</span>
          <span className="ml-auto font-semibold text-teal-400">{formatUsdt(Number(usd))}</span>
        </div>
      )}
    </div>
  )
}

const TOGGLE_OPTIONS: { id: MetricView; label: string }[] = [
  { id: "both", label: "Both" },
  { id: "ngn", label: "NGN" },
  { id: "usd", label: "USD" },
]

export function TransactionVolumeChart({ data }: TransactionVolumeChartProps) {
  const [view, setView] = useState<MetricView>("both")

  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        totalNgn: 0,
        totalUsd: 0,
        avgNgn: 0,
        peakRow: null as VolumeRow | null,
        trendPercent: 0,
      }
    }
    const totalNgn = data.reduce((s, d) => s + d.ngn, 0)
    const totalUsd = data.reduce((s, d) => s + d.usd, 0)
    const avgNgn = totalNgn / data.length
    const peakRow = data.reduce((max, d) => (d.ngn > max.ngn ? d : max), data[0])

    let trendPercent = 0
    if (data.length >= 2) {
      const half = Math.floor(data.length / 2)
      const firstHalf = data.slice(0, half).reduce((s, d) => s + d.ngn, 0)
      const secondHalf = data.slice(half).reduce((s, d) => s + d.ngn, 0)
      if (firstHalf > 0) {
        trendPercent = ((secondHalf - firstHalf) / firstHalf) * 100
      }
    }

    return { totalNgn, totalUsd, avgNgn, peakRow, trendPercent }
  }, [data])

  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        label: formatChartDate(row.date),
      })),
    [data]
  )

  const TrendIcon =
    stats.trendPercent > 1.5 ? ArrowUpRight : stats.trendPercent < -1.5 ? ArrowDownRight : Minus
  const trendColor =
    stats.trendPercent > 1.5
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : stats.trendPercent < -1.5
        ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
        : "text-gray-400 bg-gray-500/10 border-gray-500/30"

  const showNgn = view === "both" || view === "ngn"
  const showUsd = view === "both" || view === "usd"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1 text-xs font-medium ${trendColor}`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {stats.trendPercent === 0
            ? "Flat vs first half"
            : `${stats.trendPercent > 0 ? "+" : ""}${stats.trendPercent.toFixed(1)}% vs first half`}
        </div>

        <div className="inline-flex self-start rounded-full border border-border bg-card p-1 sm:self-auto">
          {TOGGLE_OPTIONS.map((opt) => {
            const active = view === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setView(opt.id)}
                className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="volumeViewIndicator"
                    className="absolute inset-0 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Total NGN"
          value={formatCompactNgn(stats.totalNgn)}
          subValue={formatNgn(stats.totalNgn)}
          accent="emerald"
        />
        <StatTile
          label="Total USD"
          value={formatCompactUsd(stats.totalUsd)}
          subValue={formatUsdt(stats.totalUsd)}
          accent="teal"
        />
        <StatTile
          label="Daily average"
          value={formatCompactNgn(stats.avgNgn)}
          subValue={`Across ${data.length} day${data.length === 1 ? "" : "s"}`}
          accent="emerald"
        />
        <StatTile
          label="Peak day"
          value={stats.peakRow ? formatCompactNgn(stats.peakRow.ngn) : "—"}
          subValue={stats.peakRow ? formatChartDate(stats.peakRow.date) : "No data"}
          accent="amber"
          icon={<TrendingUp className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="relative -mx-2 min-h-[300px] w-[calc(100%+1rem)]" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart data={chartData} margin={{ top: 16, right: 16, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="ngnGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.55} />
                <stop offset="55%" stopColor="#10b981" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="usdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.45} />
                <stop offset="55%" stopColor="#14b8a6" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <filter id="ngnGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={16}
            />
            <YAxis
              yAxisId="ngn"
              hide={!showNgn}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompactNgn}
              width={56}
            />
            <YAxis
              yAxisId="usd"
              hide={!showUsd}
              orientation="right"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompactUsd}
              width={48}
            />
            <Tooltip
              content={<VolumeTooltip view={view} />}
              cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.5 }}
            />
            {showUsd && (
              <Area
                yAxisId="usd"
                type="monotone"
                dataKey="usd"
                name="USD"
                stroke="#14b8a6"
                strokeWidth={2}
                fill="url(#usdGradient)"
                activeDot={{ r: 5, fill: "#14b8a6", stroke: "#0a0d10", strokeWidth: 2 }}
                animationDuration={900}
              />
            )}
            {showNgn && (
              <Area
                yAxisId="ngn"
                type="monotone"
                dataKey="ngn"
                name="NGN"
                stroke="#10b981"
                strokeWidth={2.25}
                fill="url(#ngnGradient)"
                activeDot={{ r: 5, fill: "#10b981", stroke: "#0a0d10", strokeWidth: 2 }}
                animationDuration={900}
                style={{ filter: "url(#ngnGlow)" }}
              />
            )}
            {showNgn && stats.peakRow && (
              <ReferenceDot
                yAxisId="ngn"
                x={formatChartDate(stats.peakRow.date)}
                y={stats.peakRow.ngn}
                r={6}
                fill="#fbbf24"
                stroke="#0a0d10"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {showNgn && (
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            NGN volume
          </span>
        )}
        {showUsd && (
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
            USD equivalent
          </span>
        )}
        {showNgn && stats.peakRow && (
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            Peak ({formatChartDate(stats.peakRow.date)})
          </span>
        )}
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  subValue,
  accent,
  icon,
}: {
  label: string
  value: string
  subValue?: string
  accent: "emerald" | "teal" | "amber"
  icon?: React.ReactNode
}) {
  const accentMap = {
    emerald: "text-emerald-400 border-emerald-500/20",
    teal: "text-teal-300 border-teal-500/20",
    amber: "text-amber-300 border-amber-500/20",
  } as const

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl border bg-card/60 p-4 ${accentMap[accent]}`}
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        {icon ? <span className={accentMap[accent].split(" ")[0]}>{icon}</span> : null}
      </div>
      <p className="mt-2 truncate text-lg font-bold text-foreground sm:text-xl">{value}</p>
      {subValue && (
        <p className="mt-1 truncate text-[11px] text-muted-foreground">{subValue}</p>
      )}
    </motion.div>
  )
}
