"use client"

import { useCallback, useEffect, useState } from "react"
import {
  fetchDeveloperDashboardStats,
  type DashboardStatsSource,
} from "@/lib/api/dashboard"
import type { DeveloperDashboardStats } from "@/lib/api/types"
import type { ApiError } from "@/lib/api/types"

export function useDeveloperDashboard() {
  const [stats, setStats] = useState<DeveloperDashboardStats | null>(null)
  const [source, setSource] = useState<DashboardStatsSource>("demo")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchDeveloperDashboardStats()
      setStats(result.stats)
      setSource(result.source)
    } catch (e) {
      setError(e as ApiError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { stats, source, isLoading, error, refetch }
}
