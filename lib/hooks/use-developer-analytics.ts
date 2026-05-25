"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchDeveloperAnalytics, type AnalyticsSource } from "@/lib/api/analytics"
import type { DeveloperAnalytics, DeveloperAnalyticsParams } from "@/lib/api/types"

export type AnalyticsRange = "today" | "7d" | "30d" | "custom"

export function useDeveloperAnalytics() {
  const [range, setRange] = useState<AnalyticsRange>("7d")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [analytics, setAnalytics] = useState<DeveloperAnalytics | null>(null)
  const [source, setSource] = useState<AnalyticsSource>("demo")
  const [isLoading, setIsLoading] = useState(true)
  const [customError, setCustomError] = useState<string | null>(null)

  const buildParams = useCallback((): DeveloperAnalyticsParams | null => {
    if (range === "custom") {
      if (!customStart || !customEnd) {
        return null
      }
      const start = new Date(customStart)
      const end = new Date(customEnd)
      if (start > end) {
        return null
      }
      return { range: "custom", startDate: customStart, endDate: customEnd }
    }
    return { range }
  }, [range, customStart, customEnd])

  const load = useCallback(async () => {
    const params = buildParams()
    if (!params) {
      setCustomError(
        range === "custom"
          ? !customStart || !customEnd
            ? "Select start and end dates"
            : "Start date must be before end date"
          : null
      )
      if (range === "custom") {
        setIsLoading(false)
      }
      return
    }

    setCustomError(null)
    setIsLoading(true)
    try {
      const result = await fetchDeveloperAnalytics(params)
      setAnalytics(result.analytics)
      setSource(result.source)
    } finally {
      setIsLoading(false)
    }
  }, [buildParams, range, customStart, customEnd])

  useEffect(() => {
    if (range !== "custom") {
      load()
      return
    }
    if (customStart && customEnd) {
      load()
    } else {
      setIsLoading(false)
      setCustomError("Select start and end dates")
    }
  }, [range, customStart, customEnd, load])

  return {
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
    refetch: load,
  }
}
