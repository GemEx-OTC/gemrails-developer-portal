"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/animated-number"

interface DashboardStatCardProps {
  label: string
  value: number
  format: (n: number) => string
  subValue?: string
  icon: LucideIcon
  index: number
}

export function DashboardStatCard({
  label,
  value,
  format,
  subValue,
  icon: Icon,
  index,
}: DashboardStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ scale: 1.02 }}
      className="gemrails-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
            <AnimatedNumber value={value} format={format} />
          </p>
          {subValue && (
            <p className="mt-1 truncate text-xs text-gray-500">{subValue}</p>
          )}
        </div>
        <div className="shrink-0 rounded-lg bg-emerald-500/10 p-2.5">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>
      </div>
    </motion.div>
  )
}
