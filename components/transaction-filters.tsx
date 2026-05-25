"use client"

import { RotateCcw } from "lucide-react"
import type { TxFilters } from "@/lib/hooks/use-developer-transactions"
import type {
  DeveloperTxNetwork,
  DeveloperTxStatus,
} from "@/lib/api/types"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: { id: DeveloperTxStatus | "all"; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: "initiated", label: "Initiated" },
  { id: "awaiting_crypto", label: "Awaiting crypto" },
  { id: "settled", label: "Settled" },
  { id: "failed", label: "Failed" },
]

const NETWORK_OPTIONS: { id: DeveloperTxNetwork | "all"; label: string }[] = [
  { id: "all", label: "All networks" },
  { id: "TRON", label: "TRON (TRC-20)" },
  { id: "BSC", label: "BSC" },
]

interface TransactionFiltersProps {
  filters: TxFilters
  onChange: (next: Partial<TxFilters>) => void
  onReset: () => void
  disabled?: boolean
}

export function TransactionFilters({
  filters,
  onChange,
  onReset,
  disabled,
}: TransactionFiltersProps) {
  const today = new Date().toISOString().slice(0, 10)
  const hasActive =
    filters.status !== "all" ||
    filters.network !== "all" ||
    filters.minAmount !== null ||
    !!filters.startDate ||
    !!filters.endDate

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="tx-status" className="text-xs font-medium text-gray-500">
            Status
          </label>
          <select
            id="tx-status"
            value={filters.status}
            disabled={disabled}
            onChange={(e) => onChange({ status: e.target.value as TxFilters["status"] })}
            className="gemrails-input mt-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-card">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-network" className="text-xs font-medium text-gray-500">
            Network
          </label>
          <select
            id="tx-network"
            value={filters.network}
            disabled={disabled}
            onChange={(e) => onChange({ network: e.target.value as TxFilters["network"] })}
            className="gemrails-input mt-1.5 text-sm"
          >
            {NETWORK_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-card">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tx-min-amount" className="text-xs font-medium text-gray-500">
            Min amount (NGN)
          </label>
          <input
            id="tx-min-amount"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            placeholder="e.g. 25000"
            value={filters.minAmount ?? ""}
            disabled={disabled}
            onChange={(e) => {
              const raw = e.target.value
              onChange({ minAmount: raw === "" ? null : Math.max(0, Number(raw)) })
            }}
            className="gemrails-input mt-1.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="tx-start" className="text-xs font-medium text-gray-500">
              From
            </label>
            <input
              id="tx-start"
              type="date"
              max={filters.endDate || today}
              value={filters.startDate}
              disabled={disabled}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="gemrails-input mt-1.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="tx-end" className="text-xs font-medium text-gray-500">
              To
            </label>
            <input
              id="tx-end"
              type="date"
              min={filters.startDate}
              max={today}
              value={filters.endDate}
              disabled={disabled}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="gemrails-input mt-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-xs", hasActive ? "text-emerald-400/90" : "text-gray-500")}>
          {hasActive ? "Filters applied" : "No filters applied"}
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-emerald-400 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        )}
      </div>
    </div>
  )
}
