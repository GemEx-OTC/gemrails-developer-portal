"use client"

import { motion } from "framer-motion"

interface ApiStatusBadgeProps {
  apiLive: boolean
  uptimePercent?: number
}

export function ApiStatusBadge({ apiLive, uptimePercent = 99.98 }: ApiStatusBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#1f2937] bg-[#111419] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {apiLive && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          )}
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              apiLive ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </span>
        <span className="text-sm font-medium text-foreground">
          {apiLive ? "API Live" : "API Degraded"}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        Uptime{" "}
        <motion.span
          key={uptimePercent}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold tabular-nums text-emerald-400"
        >
          {uptimePercent.toFixed(2)}%
        </motion.span>
      </span>
    </div>
  )
}
