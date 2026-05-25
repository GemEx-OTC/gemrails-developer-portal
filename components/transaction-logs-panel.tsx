"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Loader2, ScrollText } from "lucide-react"
import { ExportDataDropdown, type ExportFormat } from "@/components/export-data-dropdown"
import { TransactionFilters } from "@/components/transaction-filters"
import { useDeveloperTransactions } from "@/lib/hooks/use-developer-transactions"
import type { DeveloperTransaction, DeveloperTxStatus } from "@/lib/api/types"
import { downloadFile, toCsv } from "@/lib/csv"
import { formatNgn } from "@/lib/format"
import { cn } from "@/lib/utils"

const STATUS_BADGES: Record<DeveloperTxStatus, { label: string; className: string }> = {
  initiated: { label: "Initiated", className: "bg-blue-500/15 text-blue-400" },
  awaiting_crypto: {
    label: "Awaiting crypto",
    className: "bg-amber-500/15 text-amber-300",
  },
  settled: { label: "Settled", className: "bg-emerald-500/15 text-emerald-400" },
  failed: { label: "Failed", className: "bg-red-500/15 text-red-400" },
}

const SOURCE_HINT: Record<string, string> = {
  developer: "Live transactions from developer API",
  merchant: "Mapped from merchant dashboard until /developer/transactions ships",
  demo: "Demo transactions — sign in or connect API for live data",
}

function formatRowTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function shortAddress(addr: string) {
  if (!addr || addr.length <= 14) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function buildExportRows(rows: DeveloperTransaction[]) {
  return rows.map((t) => ({
    transactionId: t.transactionId,
    status: t.status,
    network: t.network,
    cryptoAsset: t.cryptoAsset,
    nairaAmount: t.nairaAmount,
    cryptoAmount: t.cryptoAmount,
    walletAddress: t.walletAddress,
    reference: t.reference ?? "",
    createdAt: t.createdAt,
    settledAt: t.settledAt ?? "",
  }))
}

const EXPORT_COLUMNS: { key: keyof ReturnType<typeof buildExportRows>[number]; header: string }[] = [
  { key: "transactionId", header: "Transaction ID" },
  { key: "status", header: "Status" },
  { key: "network", header: "Network" },
  { key: "cryptoAsset", header: "Asset" },
  { key: "nairaAmount", header: "Amount (NGN)" },
  { key: "cryptoAmount", header: "Amount (Crypto)" },
  { key: "walletAddress", header: "Wallet Address" },
  { key: "reference", header: "Reference" },
  { key: "createdAt", header: "Created At" },
  { key: "settledAt", header: "Settled At" },
]

function timestampedFilename(prefix: string, ext: string) {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`
  return `${prefix}_${stamp}.${ext}`
}

export function TransactionLogsPanel() {
  const {
    filters,
    updateFilters,
    resetFilters,
    response,
    source,
    isLoading,
    page,
    setPage,
    pageSize,
    fetchAllForExport,
  } = useDeveloperTransactions()

  const [exportError, setExportError] = useState<string | null>(null)
  const [exportToast, setExportToast] = useState<string | null>(null)

  const totalRecords = response?.pagination.total ?? 0
  const totalPages = response?.pagination.totalPages ?? 1
  const rangeStart = response ? (page - 1) * pageSize + 1 : 0
  const rangeEnd = response ? Math.min(page * pageSize, totalRecords) : 0

  const handleExport = async (format: ExportFormat) => {
    setExportError(null)
    setExportToast(null)
    try {
      const all = await fetchAllForExport()
      if (all.length === 0) {
        setExportError("No transactions match the current filters.")
        return
      }
      const rows = buildExportRows(all)

      if (format === "csv") {
        const csv = toCsv(rows, EXPORT_COLUMNS)
        downloadFile(timestampedFilename("gemrails_transactions", "csv"), csv, "text/csv")
      } else {
        const json = JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            filters,
            count: rows.length,
            transactions: rows,
          },
          null,
          2
        )
        downloadFile(
          timestampedFilename("gemrails_transactions", "json"),
          json,
          "application/json"
        )
      }

      setExportToast(`Exported ${all.length} record${all.length === 1 ? "" : "s"} as ${format.toUpperCase()}.`)
      setTimeout(() => setExportToast(null), 4000)
    } catch {
      setExportError("Export failed. Try again.")
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/10 p-2.5">
            <ScrollText className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Transaction logs</h2>
            <p className="text-sm text-muted-foreground">
              Filter by status, network, amount, or date — then export your dataset.
            </p>
          </div>
        </div>
        <ExportDataDropdown
          onExport={handleExport}
          disabled={isLoading || totalRecords === 0}
          recordCount={totalRecords}
        />
      </div>

      <div className="gemrails-card">
        <TransactionFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          disabled={isLoading}
        />
      </div>

      <div className="gemrails-card">
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : !response || response.transactions.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No transactions match the current filters.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937] text-xs text-gray-500">
                    <th className="pb-3 pr-4 font-medium">Transaction</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Network</th>
                    <th className="pb-3 pr-4 font-medium">Asset</th>
                    <th className="pb-3 pr-4 text-right font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Wallet</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {response.transactions.map((tx) => {
                    const badge = STATUS_BADGES[tx.status]
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-[#1f2937]/80 last:border-0 hover:bg-muted/20"
                      >
                        <td className="py-3 pr-4">
                          <p className="font-mono text-xs text-gray-300">{tx.transactionId}</p>
                          {tx.reference && (
                            <p className="mt-0.5 text-xs text-gray-500">ref: {tx.reference}</p>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                              badge.className
                            )}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-300">{tx.network}</td>
                        <td className="py-3 pr-4 text-gray-300">{tx.cryptoAsset}</td>
                        <td className="py-3 pr-4 text-right">
                          <p className="font-medium tabular-nums text-foreground">
                            {formatNgn(tx.nairaAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tx.cryptoAmount} {tx.cryptoAsset}
                          </p>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-emerald-400/90">
                          {shortAddress(tx.walletAddress)}
                        </td>
                        <td className="py-3 whitespace-nowrap text-xs text-gray-400">
                          {formatRowTime(tx.createdAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Showing <span className="font-medium text-foreground">{rangeStart}</span>–
                <span className="font-medium text-foreground">{rangeEnd}</span> of{" "}
                <span className="font-medium text-foreground">{totalRecords}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || isLoading}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <span className="text-xs text-gray-500">
                  Page <span className="font-medium text-foreground">{page}</span> of{" "}
                  <span className="font-medium text-foreground">{totalPages}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500">{SOURCE_HINT[source]}</p>
      {exportError && <p className="text-xs text-red-400">{exportError}</p>}
      {exportToast && <p className="text-xs text-emerald-400/90">{exportToast}</p>}
    </motion.section>
  )
}
