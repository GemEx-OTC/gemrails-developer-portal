"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Radio,
  Send,
  XCircle,
} from "lucide-react"
import { useIntegrationHealth } from "@/lib/hooks/use-integration-health"
import type { IntegrationHealth } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  IntegrationHealth["status"],
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  healthy: {
    label: "Healthy",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  failing: {
    label: "Failing",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: XCircle,
  },
  not_configured: {
    label: "Not Configured",
    className: "bg-gray-500/15 text-gray-400 border-gray-600",
    icon: AlertCircle,
  },
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function statusLabel(code: number, success: boolean) {
  if (success && code >= 200 && code < 300) return `${code} OK`
  if (code >= 500) return `${code} Error`
  if (code >= 400) return `${code} Client Error`
  return `${code}`
}

export function IntegrationHealthWidget() {
  const { health, source, isLoading, isPinging, pingMessage, testPing } =
    useIntegrationHealth()

  if (isLoading || !health) {
    return (
      <div className="gemrails-card flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[health.status]
  const StatusIcon = statusCfg.icon

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="gemrails-card"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <Radio className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Integration health</h2>
            <p className="text-sm text-muted-foreground">Webhook endpoint status & deliveries</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
            statusCfg.className
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {statusCfg.label}
        </span>
      </div>

      <div className="mt-6 rounded-xl border border-[#1f2937] bg-[#0d1117] p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Webhook URL
        </p>
        {health.webhookUrl ? (
          <p className="mt-2 break-all font-mono text-sm text-emerald-400/95">
            {health.webhookUrl}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No endpoint registered</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {health.lastLatencyMs != null && (
            <span>
              Last latency:{" "}
              <span className="font-medium text-foreground">{health.lastLatencyMs}ms</span>
            </span>
          )}
          {health.errorCount24h != null && (
            <span>
              Errors (24h):{" "}
              <span
                className={cn(
                  "font-medium",
                  health.errorCount24h > 0 ? "text-amber-400" : "text-emerald-400"
                )}
              >
                {health.errorCount24h}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-foreground">Recent deliveries</p>
        {health.recentDeliveries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#1f2937] py-8 text-center text-sm text-gray-500">
            No deliveries yet. Run a test ping or complete a sandbox transaction.
          </p>
        ) : (
          <ul className="space-y-2">
            {health.recentDeliveries.slice(0, 5).map((delivery, i) => (
              <motion.li
                key={`${delivery.timestamp}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-lg border border-[#1f2937] bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {delivery.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={cn(
                      "font-mono text-sm font-medium",
                      delivery.success ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {statusLabel(delivery.statusCode, delivery.success)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(delivery.timestamp)}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={testPing}
            disabled={isPinging || health.status === "not_configured"}
            className="gemrails-button inline-flex gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPinging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending ping…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Test Ping
              </>
            )}
          </button>
          <Link
            href="/dashboard/api-keys"
            className="gemrails-button-outline inline-flex items-center gap-2 text-sm"
          >
            Configure webhook
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
        {pingMessage && (
          <p className="text-sm text-emerald-400/90">{pingMessage}</p>
        )}
      </div>

      {source === "demo" && (
        <p className="mt-4 text-xs text-gray-500">
          Demo deliveries shown until{" "}
          <code className="text-emerald-400/80">/developer/dashboard/integration-health</code> is
          available.
        </p>
      )}
    </motion.section>
  )
}
