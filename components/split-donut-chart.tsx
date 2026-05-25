"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Pie, PieChart, ResponsiveContainer, Sector } from "recharts"
import type { PieSectorDataItem, PieSectorShapeProps } from "recharts/types/polar/Pie"

export interface SplitItem {
  name: string
  value: number
}

type SplitVariant = "network" | "currency"

interface SplitDonutChartProps {
  data: SplitItem[]
  variant: SplitVariant
  unitLabel?: string
}

interface SegmentStyle {
  gradientId: string
  from: string
  to: string
  text: string
  border: string
  glow: string
}

const VARIANT_META: Record<
  SplitVariant,
  { defaultDescription: string; segmentStyles: SegmentStyle[] }
> = {
  network: {
    defaultDescription: "Chain distribution",
    segmentStyles: [
      {
        gradientId: "networkGrad0",
        from: "#34d399",
        to: "#059669",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        glow: "shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)]",
      },
      {
        gradientId: "networkGrad1",
        from: "#22d3ee",
        to: "#7c3aed",
        text: "text-cyan-400",
        border: "border-cyan-500/30",
        glow: "shadow-[0_0_20px_-4px_rgba(34,211,238,0.45)]",
      },
      {
        gradientId: "networkGrad2",
        from: "#a78bfa",
        to: "#6366f1",
        text: "text-violet-400",
        border: "border-violet-500/30",
        glow: "shadow-[0_0_20px_-4px_rgba(139,92,246,0.45)]",
      },
    ],
  },
  currency: {
    defaultDescription: "Stablecoin mix",
    segmentStyles: [
      {
        gradientId: "currencyGrad0",
        from: "#6ee7b7",
        to: "#10b981",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        glow: "shadow-[0_0_20px_-4px_rgba(16,185,129,0.5)]",
      },
      {
        gradientId: "currencyGrad1",
        from: "#5eead4",
        to: "#0d9488",
        text: "text-teal-400",
        border: "border-teal-500/30",
        glow: "shadow-[0_0_20px_-4px_rgba(20,184,166,0.45)]",
      },
      {
        gradientId: "currencyGrad2",
        from: "#67e8f9",
        to: "#0891b2",
        text: "text-sky-400",
        border: "border-sky-500/30",
        glow: "shadow-[0_0_20px_-4px_rgba(6,182,212,0.45)]",
      },
    ],
  },
}

const CHART_HEIGHT = 280
const INNER_RADIUS = 68
const OUTER_RADIUS = 98

function renderActiveShape(props: PieSectorDataItem) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "#10b981",
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 0 12px rgba(16, 185, 129, 0.45))" }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 2}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.35}
      />
    </g>
  )
}

export function SplitDonutChart({
  data,
  variant,
  unitLabel = "Transactions",
}: SplitDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const meta = VARIANT_META[variant]
  const styles = meta.segmentStyles

  const { total, segments, leader } = useMemo(() => {
    const sum = data.reduce((s, d) => s + d.value, 0)
    const mapped = data.map((d, i) => {
      const style = styles[i % styles.length]
      const percent = sum > 0 ? (d.value / sum) * 100 : 0
      return { ...d, percent, style, index: i }
    })
    const top = mapped.length
      ? mapped.reduce((max, s) => (s.value > max.value ? s : max), mapped[0])
      : null
    return { total: sum, segments: mapped, leader: top }
  }, [data, styles])

  const displayIndex = activeIndex ?? leader?.index ?? 0
  const displaySegment = segments[displayIndex] ?? leader

  if (data.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        No data for this period
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Total {unitLabel.toLowerCase()}:{" "}
          <span className="font-semibold text-foreground">{total.toLocaleString()}</span>
        </span>
        {leader && (
          <span className={`inline-flex items-center gap-1.5 ${leader.style.text}`}>
            <span
              className={`h-2 w-2 rounded-full bg-gradient-to-br ${leader.style.glow}`}
              style={{
                background: `linear-gradient(135deg, ${leader.style.from}, ${leader.style.to})`,
              }}
            />
            {leader.name} leads · {leader.percent.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="relative min-h-[280px] w-full" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <PieChart>
            <defs>
              {segments.map((seg) => (
                <linearGradient
                  key={seg.style.gradientId}
                  id={seg.style.gradientId}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={seg.style.from} />
                  <stop offset="100%" stopColor={seg.style.to} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              shape={(props: PieSectorShapeProps) => {
                const seg = segments[props.index]
                if (!seg) return <Sector {...props} />
                if (activeIndex === props.index) {
                  return renderActiveShape(props)
                }
                return (
                  <Sector
                    {...props}
                    fill={`url(#${seg.style.gradientId})`}
                    stroke="#0a0d10"
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                  />
                )
              }}
              onMouseEnter={(_data, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationBegin={0}
              animationDuration={800}
            />
          </PieChart>
        </ResponsiveContainer>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          {displaySegment && (
            <>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {activeIndex !== null ? "Selected" : "Top share"}
              </p>
              <p
                className={`mt-0.5 text-lg font-bold sm:text-xl ${displaySegment.style.text}`}
              >
                {displaySegment.name}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {displaySegment.percent.toFixed(1)}%
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {displaySegment.value.toLocaleString()} {unitLabel.toLowerCase()}
              </p>
            </>
          )}
        </motion.div>
      </div>

      <div
        className={`grid gap-3 ${
          segments.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {segments.map((seg) => {
          const isActive = activeIndex === seg.index
          return (
            <motion.button
              key={seg.name}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + seg.index * 0.08 }}
              onMouseEnter={() => setActiveIndex(seg.index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`rounded-xl border bg-card/60 p-3 text-left transition-all ${seg.style.border} ${
                isActive ? `bg-card ${seg.style.glow} scale-[1.02]` : "hover:bg-card/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${seg.style.from}, ${seg.style.to})`,
                    boxShadow: `0 0 10px ${seg.style.from}66`,
                  }}
                />
                <span className={`text-sm font-semibold ${seg.style.text}`}>{seg.name}</span>
              </div>
              <p className="mt-2 text-xl font-bold text-foreground">
                {seg.percent.toFixed(1)}%
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {seg.value.toLocaleString()} · {meta.defaultDescription}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
