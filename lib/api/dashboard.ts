import apiClient, { isAuthenticated } from "./client"
import { getDashboardStats } from "./developer"
import type { ApiResponse, DeveloperDashboardStats } from "./types"

export const DEMO_DEVELOPER_STATS: DeveloperDashboardStats = {
  totalVolumeNgn: 12_450_000,
  totalVolumeUsdtEquivalent: 7540,
  apiSuccessRate: 99.2,
  activeWebhooks: 1,
  averageSettlementSeconds: 38,
  apiLive: true,
  uptimePercent: 99.98,
}

interface MerchantDashboardPayload {
  stats?: {
    totalReceived?: number
    totalTransactions?: number
    pendingPayments?: number
  }
}

function mapMerchantToDeveloper(data: MerchantDashboardPayload): DeveloperDashboardStats {
  const totalReceived = data.stats?.totalReceived ?? 0
  const totalTx = data.stats?.totalTransactions ?? 0
  const pending = data.stats?.pendingPayments ?? 0
  const completed = Math.max(0, totalTx - pending)
  const successRate = totalTx > 0 ? (completed / totalTx) * 100 : 100

  return {
    totalVolumeNgn: totalReceived,
    totalVolumeUsdtEquivalent: totalReceived > 0 ? Math.round(totalReceived / 1650) : 0,
    apiSuccessRate: Math.min(Math.round(successRate * 10) / 10, 100),
    activeWebhooks: 0,
    averageSettlementSeconds: 42,
    apiLive: true,
    uptimePercent: 99.98,
  }
}

export type DashboardStatsSource = "developer" | "merchant" | "demo"

export async function fetchDeveloperDashboardStats(): Promise<{
  stats: DeveloperDashboardStats
  source: DashboardStatsSource
}> {
  if (!isAuthenticated()) {
    return { stats: DEMO_DEVELOPER_STATS, source: "demo" }
  }

  try {
    const stats = await getDashboardStats()
    return { stats, source: "developer" }
  } catch {
    try {
      const response = await apiClient.get<ApiResponse<MerchantDashboardPayload>>("/dashboard")
      return {
        stats: mapMerchantToDeveloper(response.data.data),
        source: "merchant",
      }
    } catch {
      return { stats: DEMO_DEVELOPER_STATS, source: "demo" }
    }
  }
}
