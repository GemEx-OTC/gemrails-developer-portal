"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Activity, Gauge, RefreshCw, Webhook, Zap } from "lucide-react"
import { ApiStatusBadge } from "@/components/api-status-badge"
import { DashboardBusinessAvatar } from "@/components/dashboard-business-avatar"
import { DashboardStatCard } from "@/components/dashboard-stat-card"
import { IntegrationHealthWidget } from "@/components/integration-health-widget"
import { QuickstartChecklist } from "@/components/quickstart-checklist"
import { useDeveloperDashboard } from "@/lib/hooks/use-developer-dashboard"
import { formatDuration, formatNgn, formatPercent, formatUsdt } from "@/lib/format"
import { hasAuthSession } from "@/lib/demo-auth-config"

const SOURCE_HINT: Record<string, string> = {
  developer: "Live metrics from developer API",
  merchant: "Mapped from merchant dashboard until /developer/dashboard/stats ships",
  demo: "Demo data — sign in to load your account metrics",
}

export default function DashboardPage() {
  const { stats, source, isLoading, error, refetch } = useDeveloperDashboard()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="gemrails-card text-center">
        <p className="text-muted-foreground">{error?.message ?? "Unable to load dashboard"}</p>
        <button type="button" onClick={refetch} className="gemrails-button mt-4 text-sm">
          Retry
        </button>
      </div>
    )
  }

  const statCards = [
    {
      label: "Volume processed (NGN)",
      value: stats.totalVolumeNgn,
      format: formatNgn,
      subValue:
        stats.totalVolumeUsdtEquivalent > 0
          ? `≈ ${formatUsdt(stats.totalVolumeUsdtEquivalent)} USDT equivalent`
          : undefined,
      icon: Zap,
    },
    {
      label: "API success rate",
      value: stats.apiSuccessRate,
      format: formatPercent,
      subValue: "Last 30 days",
      icon: Gauge,
    },
    {
      label: "Active webhooks",
      value: stats.activeWebhooks,
      format: (n: number) => n.toString(),
      subValue: stats.activeWebhooks === 0 ? "Configure in API Keys" : "Endpoints receiving events",
      icon: Webhook,
    },
    {
      label: "Avg. settlement speed",
      value: stats.averageSettlementSeconds,
      format: formatDuration,
      subValue: "Crypto received → Naira settled",
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <DashboardBusinessAvatar size="md" />
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Integration performance at a glance
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            className="gemrails-button-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {!hasAuthSession() && (
            <Link href="/auth/login" className="gemrails-button text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>

      <ApiStatusBadge apiLive={stats.apiLive} uptimePercent={stats.uptimePercent} />

      <p className="text-xs text-gray-500">{SOURCE_HINT[source]}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <DashboardStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            format={card.format}
            subValue={card.subValue}
            icon={card.icon}
            index={i}
          />
        ))}
      </div>

      <IntegrationHealthWidget />

      <QuickstartChecklist />
    </div>
  )
}
