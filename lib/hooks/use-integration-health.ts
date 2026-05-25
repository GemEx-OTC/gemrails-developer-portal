"use client"

import { useCallback, useEffect, useState } from "react"
import {
  fetchIntegrationHealth,
  sendTestWebhookPing,
  type IntegrationHealthSource,
} from "@/lib/api/webhooks"
import type { IntegrationHealth } from "@/lib/api/types"

export function useIntegrationHealth() {
  const [health, setHealth] = useState<IntegrationHealth | null>(null)
  const [source, setSource] = useState<IntegrationHealthSource>("demo")
  const [isLoading, setIsLoading] = useState(true)
  const [isPinging, setIsPinging] = useState(false)
  const [pingMessage, setPingMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setPingMessage(null)
    try {
      const result = await fetchIntegrationHealth()
      setHealth(result.health)
      setSource(result.source)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const testPing = useCallback(async () => {
    if (!health?.webhookUrl && health?.status === "not_configured") {
      setPingMessage("Configure a webhook URL in API Keys first.")
      return
    }

    setIsPinging(true)
    setPingMessage(null)
    try {
      const { delivery, fromApi } = await sendTestWebhookPing()
      setHealth((prev) => {
        if (!prev) return prev
        const recentDeliveries = [delivery, ...prev.recentDeliveries].slice(0, 5)
        return {
          ...prev,
          status: delivery.success ? "healthy" : "failing",
          lastLatencyMs: 128,
          recentDeliveries,
        }
      })
      setPingMessage(
        fromApi
          ? `Test delivered — ${delivery.statusCode} ${delivery.success ? "OK" : "Error"}`
          : `Simulated ping — ${delivery.statusCode} OK (demo until API ships)`
      )
    } catch {
      setPingMessage("Ping failed. Try again.")
    } finally {
      setIsPinging(false)
    }
  }, [health?.webhookUrl, health?.status])

  return {
    health,
    source,
    isLoading,
    isPinging,
    pingMessage,
    refetch: load,
    testPing,
  }
}
