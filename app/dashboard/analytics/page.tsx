"use client"

import { RefreshCw } from "lucide-react"
import { AnalyticsChartsPanel } from "@/components/analytics-charts-panel"
import { AnalyticsDateRangePicker } from "@/components/analytics-date-range-picker"
import { TransactionLogsPanel } from "@/components/transaction-logs-panel"
import { useDeveloperAnalytics } from "@/lib/hooks/use-developer-analytics"
import { isAuthenticated } from "@/lib/api/client"

const SOURCE_HINT: Record<string, string> = {
  api: "Live analytics from developer API",
  demo: "Demo data — sign in or connect API for your metrics",
}

export default function AnalyticsPage() {
  const {
    range,
    setRange,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    analytics,
    source,
    isLoading,
    customError,
    refetch,
  } = useDeveloperAnalytics()

  const showCharts = analytics && !(range === "custom" && customError)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Historical volume, API health, and payment mix over time
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={isLoading}
          className="gemrails-button-outline inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="gemrails-card">
        <AnalyticsDateRangePicker
          range={range}
          onRangeChange={setRange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          customError={customError}
          disabled={isLoading}
        />
        <p className="mt-4 text-xs text-gray-500">{SOURCE_HINT[source]}</p>
        {!isAuthenticated() && (
          <p className="mt-1 text-xs text-gray-500">
            Sample charts until{" "}
            <code className="text-emerald-400/80">/developer/dashboard/analytics</code> is
            available.
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="gemrails-card flex min-h-[320px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : showCharts ? (
        <AnalyticsChartsPanel analytics={analytics} />
      ) : (
        <div className="gemrails-card py-12 text-center text-sm text-muted-foreground">
          Choose a valid custom date range to load charts.
        </div>
      )}

      <TransactionLogsPanel />
    </div>
  )
}
