"use client"

import type { DeveloperAnalytics } from "@/lib/api/types"
import { SplitDonutChart } from "@/components/split-donut-chart"
import { SplitsCarousel } from "@/components/splits-carousel"
import { StatusCodeBar } from "@/components/status-code-bar"
import { TransactionVolumeChart } from "@/components/transaction-volume-chart"

interface AnalyticsChartsPanelProps {
  analytics: DeveloperAnalytics
}

export function AnalyticsChartsPanel({ analytics }: AnalyticsChartsPanelProps) {
  const statusData = analytics.statusCodeDistribution

  const networkData = analytics.networkSplit.map((n) => ({
    name: n.network,
    value: n.count,
  }))

  const currencyData = analytics.currencySplit.map((c) => ({
    name: c.currency,
    value: c.count,
  }))

  return (
    <div className="space-y-6">
      <div className="gemrails-card">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Transaction volume</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              NGN processed and USD equivalent over the selected period
            </p>
          </div>
        </div>
        <div className="mt-6">
          <TransactionVolumeChart data={analytics.volumeByDay} />
        </div>
      </div>

      <div className="gemrails-card">
        <h3 className="text-lg font-semibold text-foreground">API response health</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Success vs client and server errors in the period (grouped by HTTP status)
        </p>
        <div className="mt-6">
          <StatusCodeBar data={statusData} />
        </div>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-2">
        <div className="gemrails-card">
          <h3 className="text-lg font-semibold text-foreground">Network split</h3>
          <p className="mt-1 text-sm text-muted-foreground">TRC-20 vs BSC transaction share</p>
          <div className="mt-6">
            <SplitDonutChart data={networkData} variant="network" />
          </div>
        </div>

        <div className="gemrails-card">
          <h3 className="text-lg font-semibold text-foreground">Currency split</h3>
          <p className="mt-1 text-sm text-muted-foreground">USDT vs USDC volume share</p>
          <div className="mt-6">
            <SplitDonutChart data={currencyData} variant="currency" />
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <SplitsCarousel
          slides={[
            {
              id: "network",
              title: "Network split",
              description: "TRC-20 vs BSC transaction share",
              data: networkData,
            },
            {
              id: "currency",
              title: "Currency split",
              description: "USDT vs USDC volume share",
              data: currencyData,
            },
          ]}
        />
      </div>
    </div>
  )
}
