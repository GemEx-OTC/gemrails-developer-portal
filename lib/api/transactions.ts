import apiClient, { isAuthenticated } from "./client"
import type {
  ApiResponse,
  DeveloperTransaction,
  DeveloperTransactionsParams,
  DeveloperTransactionsResponse,
  DeveloperTxNetwork,
  DeveloperTxStatus,
} from "./types"

const STATUSES: DeveloperTxStatus[] = ["initiated", "awaiting_crypto", "settled", "failed"]
const NETWORKS: DeveloperTxNetwork[] = ["TRON", "BSC"]
const ASSETS: ("USDT" | "USDC")[] = ["USDT", "USDC"]

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10_000
  return x - Math.floor(x)
}

function hex(seed: number, length: number): string {
  const chars = "0123456789abcdef"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(pseudoRandom(seed + i) * chars.length)]
  }
  return out
}

function generateMockTransactions(count: number): DeveloperTransaction[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 1
    const status = STATUSES[i % STATUSES.length]
    const network = NETWORKS[Math.floor(pseudoRandom(seed) * NETWORKS.length)]
    const asset = ASSETS[Math.floor(pseudoRandom(seed + 0.5) * ASSETS.length)]
    const nairaAmount = Math.round(2_500 + pseudoRandom(seed + 1) * 247_500) // ₦2.5k–₦250k
    const rate = 1_620 + pseudoRandom(seed + 2) * 80
    const cryptoAmount = Math.round((nairaAmount / rate) * 100) / 100
    const createdAt = new Date(
      now - Math.floor(pseudoRandom(seed + 3) * 30 * 24 * 60 * 60 * 1000)
    ).toISOString()
    const settledAt =
      status === "settled"
        ? new Date(new Date(createdAt).getTime() + 35_000 + pseudoRandom(seed + 4) * 90_000).toISOString()
        : undefined

    return {
      id: `txr_${hex(seed, 12)}`,
      transactionId: `TXN_${hex(seed * 7, 16).toUpperCase()}`,
      status,
      network,
      cryptoAsset: asset,
      nairaAmount,
      cryptoAmount,
      walletAddress:
        network === "TRON"
          ? `T${hex(seed * 11, 33).toUpperCase()}`
          : `0x${hex(seed * 13, 40)}`,
      reference: i % 3 === 0 ? `order_${hex(seed * 17, 8)}` : undefined,
      createdAt,
      settledAt,
    }
  })
}

const MOCK_POOL: DeveloperTransaction[] = generateMockTransactions(48)

function filterMock(
  pool: DeveloperTransaction[],
  params: DeveloperTransactionsParams
): DeveloperTransaction[] {
  return pool.filter((t) => {
    if (params.status && params.status !== "all" && t.status !== params.status) return false
    if (params.network && params.network !== "all" && t.network !== params.network) return false
    if (params.minAmount && t.nairaAmount < params.minAmount) return false
    if (params.startDate) {
      const start = new Date(params.startDate).getTime()
      if (new Date(t.createdAt).getTime() < start) return false
    }
    if (params.endDate) {
      const end = new Date(params.endDate).getTime() + 86_400_000 - 1
      if (new Date(t.createdAt).getTime() > end) return false
    }
    return true
  })
}

function buildMockResponse(
  params: DeveloperTransactionsParams
): DeveloperTransactionsResponse {
  const filtered = filterMock(MOCK_POOL, params)
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const start = (page - 1) * limit
  const slice = filtered.slice(start, start + limit)

  const totalVolume = filtered.reduce((s, t) => s + t.nairaAmount, 0)
  const settledCount = filtered.filter((t) => t.status === "settled").length
  const failedCount = filtered.filter((t) => t.status === "failed").length

  return {
    transactions: slice,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
    summary: { totalVolume, settledCount, failedCount },
  }
}

interface MerchantTransactionsRaw {
  transactions?: {
    id: string
    transactionId?: string
    amount?: number
    nairaAmount?: number
    cryptoAmount?: number
    currency?: string
    status?: string
    reference?: string
    walletAddress?: string
    createdAt?: string
    updatedAt?: string
    network?: string
    cryptoAsset?: string
  }[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function mapMerchantStatus(s?: string): DeveloperTxStatus {
  switch (s) {
    case "completed":
      return "settled"
    case "failed":
    case "expired":
      return "failed"
    case "processing":
      return "awaiting_crypto"
    default:
      return "initiated"
  }
}

function mapMerchantToDeveloper(raw: MerchantTransactionsRaw): DeveloperTransactionsResponse {
  const transactions: DeveloperTransaction[] = (raw.transactions ?? []).map((t) => ({
    id: t.id,
    transactionId: t.transactionId ?? t.id,
    status: mapMerchantStatus(t.status),
    network: (t.network === "BSC" ? "BSC" : "TRON") as DeveloperTxNetwork,
    cryptoAsset: (t.cryptoAsset === "USDC" ? "USDC" : "USDT") as "USDT" | "USDC",
    nairaAmount: t.nairaAmount ?? t.amount ?? 0,
    cryptoAmount: t.cryptoAmount ?? 0,
    walletAddress: t.walletAddress ?? "",
    reference: t.reference,
    createdAt: t.createdAt ?? new Date().toISOString(),
  }))

  return {
    transactions,
    pagination:
      raw.pagination ?? {
        page: 1,
        limit: transactions.length,
        total: transactions.length,
        totalPages: 1,
      },
  }
}

export type TransactionsSource = "developer" | "merchant" | "demo"

function buildQuery(params: DeveloperTransactionsParams): string {
  const q = new URLSearchParams()
  if (params.page) q.set("page", String(params.page))
  if (params.limit) q.set("limit", String(params.limit))
  if (params.status && params.status !== "all") q.set("status", params.status)
  if (params.network && params.network !== "all") q.set("network", params.network)
  if (params.minAmount) q.set("minAmount", String(params.minAmount))
  if (params.startDate) q.set("startDate", params.startDate)
  if (params.endDate) q.set("endDate", params.endDate)
  return q.toString()
}

export async function fetchDeveloperTransactions(
  params: DeveloperTransactionsParams
): Promise<{ response: DeveloperTransactionsResponse; source: TransactionsSource }> {
  if (!isAuthenticated()) {
    return { response: buildMockResponse(params), source: "demo" }
  }

  const qs = buildQuery(params)

  try {
    const res = await apiClient.get<ApiResponse<DeveloperTransactionsResponse>>(
      `/developer/transactions${qs ? `?${qs}` : ""}`
    )
    return { response: res.data.data, source: "developer" }
  } catch {
    try {
      const res = await apiClient.get<ApiResponse<MerchantTransactionsRaw>>(
        `/dashboard/transactions${qs ? `?${qs}` : ""}`
      )
      const mapped = mapMerchantToDeveloper(res.data.data)
      // re-apply portal-specific filters (status/network/minAmount/date) client-side
      const filtered = filterMock(mapped.transactions, params)
      return {
        response: {
          transactions: filtered,
          pagination: mapped.pagination,
          summary: {
            totalVolume: filtered.reduce((s, t) => s + t.nairaAmount, 0),
            settledCount: filtered.filter((t) => t.status === "settled").length,
            failedCount: filtered.filter((t) => t.status === "failed").length,
          },
        },
        source: "merchant",
      }
    } catch {
      return { response: buildMockResponse(params), source: "demo" }
    }
  }
}

/** Fetch ALL pages for export. Caps at `maxRecords` to prevent runaway requests. */
export async function fetchAllDeveloperTransactions(
  params: Omit<DeveloperTransactionsParams, "page" | "limit">,
  maxRecords = 5_000
): Promise<{ transactions: DeveloperTransaction[]; source: TransactionsSource }> {
  if (!isAuthenticated()) {
    return {
      transactions: filterMock(MOCK_POOL, params),
      source: "demo",
    }
  }

  const limit = 100
  const all: DeveloperTransaction[] = []
  let page = 1
  let source: TransactionsSource = "demo"

  while (all.length < maxRecords) {
    const { response, source: s } = await fetchDeveloperTransactions({
      ...params,
      page,
      limit,
    })
    source = s
    all.push(...response.transactions)
    if (response.transactions.length < limit || page >= response.pagination.totalPages) break
    page += 1
  }

  return { transactions: all, source }
}
