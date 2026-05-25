"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

interface StatusBucket {
  bucket: "2xx" | "4xx" | "5xx"
  count: number
}

interface StatusCodeBarProps {
  data: StatusBucket[]
}

const META: Record<
  StatusBucket["bucket"],
  {
    title: string
    code: string
    description: string
    gradient: string
    text: string
    shadow: string
    border: string
    icon: typeof CheckCircle2
  }
> = {
  "2xx": {
    title: "Success",
    code: "2xx",
    description: "Request completed successfully",
    gradient: "from-emerald-400 via-emerald-500 to-teal-500",
    text: "text-emerald-400",
    shadow: "shadow-[0_0_24px_-4px_rgba(16,185,129,0.45)]",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  "4xx": {
    title: "Client errors",
    code: "4xx",
    description: "Invalid request, auth, or missing resource",
    gradient: "from-amber-400 via-amber-500 to-orange-500",
    text: "text-amber-400",
    shadow: "shadow-[0_0_24px_-4px_rgba(245,158,11,0.45)]",
    border: "border-amber-500/30",
    icon: AlertTriangle,
  },
  "5xx": {
    title: "Server errors",
    code: "5xx",
    description: "Something failed on our servers",
    gradient: "from-rose-400 via-red-500 to-red-600",
    text: "text-rose-400",
    shadow: "shadow-[0_0_24px_-4px_rgba(244,63,94,0.45)]",
    border: "border-rose-500/30",
    icon: XCircle,
  },
}

const ORDER: StatusBucket["bucket"][] = ["2xx", "4xx", "5xx"]

export function StatusCodeBar({ data }: StatusCodeBarProps) {
  const [hovered, setHovered] = useState<StatusBucket["bucket"] | null>(null)

  const { total, byBucket, successRate } = useMemo(() => {
    const lookup: Record<StatusBucket["bucket"], number> = { "2xx": 0, "4xx": 0, "5xx": 0 }
    for (const row of data) {
      if (row.bucket in lookup) lookup[row.bucket] = row.count
    }
    const sum = lookup["2xx"] + lookup["4xx"] + lookup["5xx"]
    return {
      total: sum,
      byBucket: lookup,
      successRate: sum > 0 ? (lookup["2xx"] / sum) * 100 : 0,
    }
  }, [data])

  const segments = ORDER.map((bucket) => {
    const count = byBucket[bucket]
    const percent = total > 0 ? (count / total) * 100 : bucket === "2xx" ? 100 : 0
    return { bucket, count, percent }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Total requests:{" "}
          <span className="font-semibold text-foreground">{total.toLocaleString()}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-emerald-400">
            {successRate.toFixed(2)}% healthy
          </span>
        </span>
      </div>

      <div
        className="relative h-14 w-full overflow-hidden rounded-2xl border border-border bg-[#0a0d10]"
        role="img"
        aria-label={`API response health: ${segments
          .map((s) => `${META[s.bucket].title} ${s.percent.toFixed(1)}%`)
          .join(", ")}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 100%",
          }}
        />

        <div className="relative flex h-full w-full">
          {segments.map((seg, index) => {
            const meta = META[seg.bucket]
            const Icon = meta.icon
            const isFirst = index === 0
            const isLast = index === segments.length - 1
            const isHovered = hovered === seg.bucket
            const showLabel = seg.percent >= 5
            const showCodeOnBar = seg.percent >= 14

            return (
              <motion.div
                key={seg.bucket}
                initial={{ width: 0 }}
                animate={{ width: `${seg.percent}%` }}
                transition={{
                  duration: 0.9,
                  delay: 0.15 + index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onMouseEnter={() => setHovered(seg.bucket)}
                onMouseLeave={() => setHovered(null)}
                className={`group relative h-full bg-gradient-to-r ${meta.gradient} ${meta.shadow} ${
                  isFirst ? "rounded-l-2xl" : ""
                } ${isLast ? "rounded-r-2xl" : ""} cursor-pointer transition-[filter] duration-200 ${
                  isHovered ? "brightness-110" : ""
                }`}
                style={{ minWidth: seg.percent > 0 ? 4 : 0 }}
              >
                {seg.bucket === "2xx" && seg.percent > 0 && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-1/3"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                    }}
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 1.2,
                    }}
                  />
                )}

                {seg.bucket !== "2xx" && seg.count > 0 && (
                  <motion.span
                    aria-hidden
                    className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {showLabel && (
                  <div
                    className={`relative flex h-full justify-center px-2 ${
                      showCodeOnBar ? "flex-col py-1" : "items-center"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/95">
                      <Icon className="h-3.5 w-3.5 shrink-0 drop-shadow" />
                      <span className="truncate drop-shadow">{meta.title}</span>
                      <span className="shrink-0 text-white/75">
                        · {seg.percent.toFixed(1)}%
                      </span>
                    </div>
                    {showCodeOnBar && (
                      <span className="mt-0.5 pl-5 text-[9px] font-medium uppercase tracking-wide text-white/50">
                        HTTP {meta.code}
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max min-w-[140px] -translate-x-1/2 rounded-lg border ${meta.border} bg-[#111419] px-3 py-2 text-xs text-foreground shadow-xl transition-opacity duration-150 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <p className={`font-semibold ${meta.text}`}>{meta.title}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-500">
                    HTTP {meta.code}
                  </p>
                  <p className="mt-1 text-muted-foreground">{meta.description}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <span className="text-gray-400">Count</span>
                    <span className="font-medium">{seg.count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-400">Share</span>
                    <span className="font-medium">{seg.percent.toFixed(2)}%</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {segments.map((seg) => {
          const meta = META[seg.bucket]
          const Icon = meta.icon
          const isHovered = hovered === seg.bucket
          return (
            <motion.div
              key={seg.bucket}
              onMouseEnter={() => setHovered(seg.bucket)}
              onMouseLeave={() => setHovered(null)}
              animate={{ scale: isHovered ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className={`rounded-xl border ${meta.border} bg-card/60 p-4 transition-colors ${
                isHovered ? "bg-card" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center gap-2 ${meta.text}`}>
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{meta.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {seg.percent.toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {seg.count.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                HTTP {meta.code} · {meta.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
