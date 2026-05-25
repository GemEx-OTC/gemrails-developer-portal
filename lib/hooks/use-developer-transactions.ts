"use client"

import { useCallback, useEffect, useState } from "react"
import {
  fetchAllDeveloperTransactions,
  fetchDeveloperTransactions,
  type TransactionsSource,
} from "@/lib/api/transactions"
import type {
  DeveloperTransaction,
  DeveloperTransactionsResponse,
  DeveloperTxNetwork,
  DeveloperTxStatus,
} from "@/lib/api/types"

export interface TxFilters {
  status: DeveloperTxStatus | "all"
  network: DeveloperTxNetwork | "all"
  minAmount: number | null
  startDate: string
  endDate: string
}

export const INITIAL_FILTERS: TxFilters = {
  status: "all",
  network: "all",
  minAmount: null,
  startDate: "",
  endDate: "",
}

const PAGE_SIZE = 10

export function useDeveloperTransactions() {
  const [filters, setFilters] = useState<TxFilters>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const [response, setResponse] = useState<DeveloperTransactionsResponse | null>(null)
  const [source, setSource] = useState<TransactionsSource>("demo")
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchDeveloperTransactions({
        page,
        limit: PAGE_SIZE,
        status: filters.status,
        network: filters.network,
        minAmount: filters.minAmount ?? undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      setResponse(result.response)
      setSource(result.source)
    } finally {
      setIsLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    load()
  }, [load])

  const updateFilters = useCallback((next: Partial<TxFilters>) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, ...next }))
  }, [])

  const resetFilters = useCallback(() => {
    setPage(1)
    setFilters(INITIAL_FILTERS)
  }, [])

  const fetchAllForExport = useCallback(async (): Promise<DeveloperTransaction[]> => {
    const result = await fetchAllDeveloperTransactions({
      status: filters.status,
      network: filters.network,
      minAmount: filters.minAmount ?? undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    })
    return result.transactions
  }, [filters])

  return {
    filters,
    updateFilters,
    resetFilters,
    response,
    source,
    isLoading,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    refetch: load,
    fetchAllForExport,
  }
}
