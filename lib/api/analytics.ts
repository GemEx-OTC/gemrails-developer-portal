import { isAuthenticated } from "./client"
import { getAnalytics } from "./developer"
import type { DeveloperAnalytics, DeveloperAnalyticsParams } from "./types"

function parseISODate(iso: string): Date {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.max(1, Math.floor(ms / 86_400_000) + 1)
}

export function resolveAnalyticsWindow(params: DeveloperAnalyticsParams): {
  start: Date
  end: Date
  dayCount: number
} {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  let start = new Date(end)

  if (params.range === "today") {
    start.setHours(0, 0, 0, 0)
    return { start, end, dayCount: 1 }
  }

  if (params.range === "7d") {
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return { start, end, dayCount: 7 }
  }

  if (params.range === "30d") {
    start.setDate(start.getDate() - 29)
    start.setHours(0, 0, 0, 0)
    return { start, end, dayCount: 30 }
  }

  if (params.range === "custom" && params.startDate && params.endDate) {
    const s = parseISODate(params.startDate)
    const e = parseISODate(params.endDate)
    if (s <= e) {
      return { start: s, end: e, dayCount: daysBetween(s, e) }
    }
  }

  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  return { start, end, dayCount: 7 }
}

/** Deterministic pseudo-random from seed string */
function seeded(seed: string, i: number): number {
  let h = 0
  const s = `${seed}-${i}`
  for (let j = 0; j < s.length; j++) h = (h << 5) - h + s.charCodeAt(j)
  return (Math.abs(h) % 1000) / 1000
}

export function createDemoAnalytics(params: DeveloperAnalyticsParams): DeveloperAnalytics {
  const { start, dayCount } = resolveAnalyticsWindow(params)
  const volumeByDay: DeveloperAnalytics["volumeByDay"] = []

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const r = seeded("vol", i)
    const ngn = Math.round(400_000 + r * 2_800_000 + (i % 5) * 120_000)
    const usd = Math.round(ngn / (1620 + r * 80))
    volumeByDay.push({
      date: formatDayKey(d),
      ngn,
      usd,
    })
  }

  const totalRequests = volumeByDay.reduce((s, d) => s + Math.round(d.ngn / 50_000), 0) || 120

  return {
    volumeByDay,
    statusCodeDistribution: [
      { bucket: "2xx", count: Math.round(totalRequests * 0.91) },
      { bucket: "4xx", count: Math.round(totalRequests * 0.06) },
      { bucket: "5xx", count: Math.max(1, Math.round(totalRequests * 0.03)) },
    ],
    networkSplit: [
      { network: "TRC-20", count: Math.round(totalRequests * 0.64) },
      { network: "BSC", count: Math.round(totalRequests * 0.36) },
    ],
    currencySplit: [
      { currency: "USDT", count: Math.round(totalRequests * 0.71) },
      { currency: "USDC", count: Math.round(totalRequests * 0.29) },
    ],
  }
}

export type AnalyticsSource = "api" | "demo"

export async function fetchDeveloperAnalytics(
  params: DeveloperAnalyticsParams
): Promise<{ analytics: DeveloperAnalytics; source: AnalyticsSource }> {
  if (!isAuthenticated()) {
    return { analytics: createDemoAnalytics(params), source: "demo" }
  }

  try {
    const analytics = await getAnalytics(params)
    const hasVolume = analytics.volumeByDay?.length > 0
    if (!hasVolume) {
      return { analytics: createDemoAnalytics(params), source: "demo" }
    }
    return { analytics, source: "api" }
  } catch {
    return { analytics: createDemoAnalytics(params), source: "demo" }
  }
}
