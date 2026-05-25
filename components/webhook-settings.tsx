"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  Webhook,
} from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import { maskSecret } from "@/lib/api/keys"
import {
  fetchWebhookConfigData,
  fetchWebhookLogsList,
  retryWebhookLog,
  saveWebhookUrl,
  validateWebhookUrl,
} from "@/lib/api/webhooks"
import type { ApiKeyEnvironment, WebhookLogEntry } from "@/lib/api/types"
import { setLocalOnboardingFlag } from "@/lib/onboarding-tasks"
import { cn } from "@/lib/utils"

interface WebhookSettingsProps {
  environment: ApiKeyEnvironment
  onToast: (message: string) => void
}

function formatLogTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function eventBadgeClass(eventType: string) {
  if (eventType.includes("failed")) return "bg-red-500/15 text-red-400"
  if (eventType.includes("settled")) return "bg-emerald-500/15 text-emerald-400"
  return "bg-blue-500/15 text-blue-400"
}

export function WebhookSettings({ environment, onToast }: WebhookSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [secretRevealed, setSecretRevealed] = useState(false)
  const [logs, setLogs] = useState<WebhookLogEntry[]>([])
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [configSource, setConfigSource] = useState<"api" | "mock">("mock")

  const isSandbox = environment === "sandbox"

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [configRes, logsRes] = await Promise.all([
        fetchWebhookConfigData(),
        fetchWebhookLogsList(),
      ])
      setWebhookUrl(configRes.config.url ?? "")
      setSecret(configRes.config.secret)
      setConfigSource(configRes.config.url ? configRes.source : "mock")
      setLogs(logsRes.logs)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, environment])

  const handleSave = async () => {
    const err = validateWebhookUrl(webhookUrl, isSandbox)
    setUrlError(err)
    if (err) return

    setIsSaving(true)
    try {
      const result = await saveWebhookUrl(webhookUrl.trim(), environment)
      setSecret(result.config.secret)
      setConfigSource(result.source)
      setLocalOnboardingFlag("webhook", true)
      onToast("Webhook URL saved successfully.")
      await load()
    } catch {
      onToast("Failed to save webhook URL.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetry = async (logId: string) => {
    setRetryingId(logId)
    try {
      const result = await retryWebhookLog(logId)
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                ...result.log,
                retryCount: log.retryCount + 1,
                success: true,
                statusCode: 200,
              }
            : log
        )
      )
      onToast("Webhook delivery retry queued.")
    } catch {
      onToast("Retry failed.")
    } finally {
      setRetryingId(null)
    }
  }

  return (
    <section className="space-y-6 border-t border-border pt-10">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-teal-500/10 p-2.5">
          <Webhook className="h-5 w-5 text-teal-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Webhooks</h2>
          <p className="text-sm text-muted-foreground">
            Receive signed event callbacks at your endpoint (
            <code className="text-xs text-emerald-400/90">X-GemRails-Signature</code>
            ).
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="gemrails-card flex min-h-[160px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          <div className="gemrails-card space-y-5">
            <div>
              <label htmlFor="webhook-url" className="text-sm font-medium text-muted-foreground">
                Webhook URL
              </label>
              <input
                id="webhook-url"
                type="url"
                value={webhookUrl}
                onChange={(e) => {
                  setWebhookUrl(e.target.value)
                  setUrlError(null)
                }}
                placeholder={
                  isSandbox
                    ? "https://api.example.com/webhooks or http://localhost:3000/hooks"
                    : "https://api.example.com/webhooks/gemrails"
                }
                className={cn("gemrails-input mt-2 font-mono text-sm", urlError && "border-red-500")}
              />
              {urlError && <p className="mt-1.5 text-xs text-red-400">{urlError}</p>}
              <p className="mt-2 text-xs text-gray-500">
                {isSandbox
                  ? "Sandbox allows http://localhost for local testing."
                  : "Live mode requires a valid HTTPS URL."}
              </p>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Webhook secret
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSecretRevealed((v) => !v)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    {secretRevealed ? "Hide" : "Reveal"}
                  </button>
                  {secretRevealed && secret && <CopyButton value={secret} label="Copy" />}
                </div>
              </div>
              <input
                readOnly
                value={secretRevealed ? secret : maskSecret(secret || "whsec_placeholder")}
                className="gemrails-input font-mono text-sm text-gray-300"
                type={secretRevealed ? "text" : "password"}
              />
              <p className="mt-2 text-xs text-gray-500">
                Use this secret to verify{" "}
                <code className="text-emerald-400/80">X-GemRails-Signature</code> on incoming
                requests.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="gemrails-button text-sm disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save webhook URL"
              )}
            </button>

            {configSource === "mock" && (
              <p className="text-xs text-gray-500">
                Sample config until <code className="text-emerald-400/80">/developer/webhooks</code>{" "}
                API is live.
              </p>
            )}
          </div>

          <div className="gemrails-card">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">Delivery logs</h3>
              <button
                type="button"
                onClick={load}
                className="text-xs text-gray-400 hover:text-emerald-400"
              >
                Refresh
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No webhook deliveries yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#1f2937] text-xs text-gray-500">
                      <th className="pb-3 pr-4 font-medium">Timestamp</th>
                      <th className="pb-3 pr-4 font-medium">Event</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">Retries</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <Fragment key={log.id}>
                        <tr className="border-b border-[#1f2937]/80 hover:bg-muted/20">
                          <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                            {formatLogTime(log.timestamp)}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                eventBadgeClass(log.eventType)
                              )}
                            >
                              {log.eventType}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={cn(
                                "font-mono font-medium",
                                log.success ? "text-emerald-400" : "text-red-400"
                              )}
                            >
                              {log.statusCode ?? "—"} {log.success ? "OK" : "Error"}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{log.retryCount}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(expandedId === log.id ? null : log.id)
                                }
                                className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                                aria-label="Toggle payload"
                              >
                                {expandedId === log.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              {!log.success && (
                                <button
                                  type="button"
                                  onClick={() => handleRetry(log.id)}
                                  disabled={retryingId === log.id}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
                                >
                                  {retryingId === log.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                  Retry
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedId === log.id && (
                          <tr>
                            <td colSpan={5} className="pb-4">
                              <motion.pre
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="overflow-x-auto rounded-lg border border-[#1f2937] bg-[#0d1117] p-4 font-mono text-xs text-teal-300/90"
                              >
                                {JSON.stringify(log.payload, null, 2)}
                              </motion.pre>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
