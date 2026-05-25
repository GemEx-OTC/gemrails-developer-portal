"use client"

import { useEffect, useState } from "react"
import { Bell, Loader2, Save } from "lucide-react"
import { SettingsToggle } from "@/components/settings-toggle"
import type { DeveloperNotificationSettings } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface NotificationSettingsFormProps {
  settings: DeveloperNotificationSettings
  disabled?: boolean
  isSaving?: boolean
  onSave: (settings: DeveloperNotificationSettings) => Promise<void>
}

export function NotificationSettingsForm({
  settings,
  disabled,
  isSaving,
  onSave,
}: NotificationSettingsFormProps) {
  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications)
  const [webhookFailureWarnings, setWebhookFailureWarnings] = useState(
    settings.webhookFailureWarnings
  )
  const [settlementAlerts, setSettlementAlerts] = useState(settings.settlementAlerts)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setEmailNotifications(settings.emailNotifications)
    setWebhookFailureWarnings(settings.webhookFailureWarnings)
    setSettlementAlerts(settings.settlementAlerts)
  }, [settings])

  const dirty =
    emailNotifications !== settings.emailNotifications ||
    webhookFailureWarnings !== settings.webhookFailureWarnings ||
    settlementAlerts !== settings.settlementAlerts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    try {
      await onSave({
        emailNotifications,
        webhookFailureWarnings,
        settlementAlerts,
      })
    } catch {
      /* parent */
    }
  }

  const locked = disabled || isSaving

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2.5">
          <Bell className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Choose which developer alerts we send to your inbox.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <SettingsToggle
          checked={emailNotifications}
          onChange={(v) => {
            setEmailNotifications(v)
            setFormError(null)
          }}
          disabled={locked}
          label="Email notifications"
          description="Payment confirmations, API activity digests, and account updates."
        />
        <SettingsToggle
          checked={webhookFailureWarnings}
          onChange={(v) => {
            setWebhookFailureWarnings(v)
            setFormError(null)
          }}
          disabled={locked}
          label="Webhook failure warnings"
          description="Immediate email when a webhook delivery fails or retries are exhausted."
        />
        <SettingsToggle
          checked={settlementAlerts}
          onChange={(v) => {
            setSettlementAlerts(v)
            setFormError(null)
          }}
          disabled={locked}
          label="Settlement alerts"
          description="Notify when crypto is received and Naira settlement completes."
        />
      </div>

      {formError && (
        <p className="text-sm text-red-400" role="alert">
          {formError}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-6">
        <button
          type="submit"
          disabled={locked || !dirty}
          className={cn("gemrails-button gap-2 text-sm", (locked || !dirty) && "opacity-50")}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save notifications
            </>
          )}
        </button>
      </div>
    </form>
  )
}
