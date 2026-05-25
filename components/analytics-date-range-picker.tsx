"use client"

import { Calendar } from "lucide-react"
import type { AnalyticsRange } from "@/lib/hooks/use-developer-analytics"
import { cn } from "@/lib/utils"

const RANGES: { id: AnalyticsRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "custom", label: "Custom range" },
]

interface AnalyticsDateRangePickerProps {
  range: AnalyticsRange
  onRangeChange: (range: AnalyticsRange) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
  customError?: string | null
  disabled?: boolean
}

export function AnalyticsDateRangePicker({
  range,
  onRangeChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  customError,
  disabled,
}: AnalyticsDateRangePickerProps) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-emerald-400" aria-hidden />
        <span className="text-sm font-medium text-muted-foreground">Date range</span>
      </div>

      <div className="inline-flex flex-wrap rounded-xl border border-[#1f2937] bg-[#111419] p-1">
        {RANGES.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onRangeChange(item.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
              range === item.id
                ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {range === "custom" && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="analytics-start" className="text-xs font-medium text-gray-500">
              Start date
            </label>
            <input
              id="analytics-start"
              type="date"
              max={customEnd || today}
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              disabled={disabled}
              className="gemrails-input mt-1.5 text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="analytics-end" className="text-xs font-medium text-gray-500">
              End date
            </label>
            <input
              id="analytics-end"
              type="date"
              min={customStart}
              max={today}
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              disabled={disabled}
              className="gemrails-input mt-1.5 text-sm"
            />
          </div>
        </div>
      )}

      {customError && range === "custom" && (
        <p className="text-xs text-red-400">{customError}</p>
      )}
    </div>
  )
}
