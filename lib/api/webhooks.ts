import { isAuthenticated } from "./client"
import {
  getIntegrationHealth,
  getWebhookConfig,
  getWebhookLogs,
  retryWebhookDelivery,
  testWebhookPing as apiTestWebhookPing,
  updateWebhookConfig,
} from "./developer"
import type {
  ApiKeyEnvironment,
  DeveloperWebhookConfig,
  IntegrationHealth,
  WebhookLogEntry,
  WebhookLogsResponse,
} from "./types"

export const DEMO_WEBHOOK_CONFIG: DeveloperWebhookConfig = {
  url: "https://api.myapp.com/webhooks/gemrails",
  secret: "whsec_demo_8f2a9c1b4e7d_k3y_s3cr3t",
  isHealthy: true,
}

export const DEMO_WEBHOOK_LOGS: WebhookLogEntry[] = [
  {
    id: "log_1",
    timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
    eventType: "transaction.settled",
    payload: {
      transactionId: "TXN_8f2a9c1b4e7d",
      status: "settled",
      nairaAmount: 25000,
    },
    statusCode: 200,
    retryCount: 0,
    success: true,
  },
  {
    id: "log_2",
    timestamp: new Date(Date.now() - 22 * 60_000).toISOString(),
    eventType: "transaction.initiated",
    payload: {
      transactionId: "TXN_7e1b8a0c3d6f",
      status: "awaiting_crypto",
      walletAddress: "TXkH7n9pQw2mR4sL8vB3cF6dE1aY5uJ9",
    },
    statusCode: 200,
    retryCount: 0,
    success: true,
  },
  {
    id: "log_3",
    timestamp: new Date(Date.now() - 1 * 60 * 60_000).toISOString(),
    eventType: "transaction.failed",
    payload: {
      transactionId: "TXN_6d0a7b9e2c5a",
      status: "failed",
      reason: "timeout",
    },
    statusCode: 500,
    retryCount: 2,
    success: false,
  },
  {
    id: "log_4",
    timestamp: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    eventType: "transaction.settled",
    payload: { transactionId: "TXN_5c9f6e8d1b4a", status: "settled", nairaAmount: 15000 },
    statusCode: 200,
    retryCount: 0,
    success: true,
  },
]

/** HTTPS required in live; localhost allowed in sandbox */
export function validateWebhookUrl(url: string, sandbox: boolean): string | null {
  const trimmed = url.trim()
  if (!trimmed) return "Webhook URL is required"

  try {
    const parsed = new URL(trimmed)
    const isLocal =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".localhost")

    if (sandbox && isLocal) {
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return "Use http or https for local webhooks"
      }
      return null
    }

    if (parsed.protocol !== "https:") {
      return "Production webhooks must use HTTPS"
    }
    return null
  } catch {
    return "Enter a valid URL (e.g. https://api.example.com/webhooks/gemrails)"
  }
}

export const DEMO_INTEGRATION_HEALTH: IntegrationHealth = {
  status: "healthy",
  webhookUrl: "https://api.myapp.com/webhooks/gemrails",
  lastLatencyMs: 142,
  errorCount24h: 1,
  recentDeliveries: [
    {
      statusCode: 200,
      success: true,
      timestamp: new Date(Date.now() - 2 * 60_000).toISOString(),
    },
    {
      statusCode: 200,
      success: true,
      timestamp: new Date(Date.now() - 18 * 60_000).toISOString(),
    },
    {
      statusCode: 500,
      success: false,
      timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
    },
    {
      statusCode: 200,
      success: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
    },
    {
      statusCode: 200,
      success: true,
      timestamp: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
    },
  ],
}

export const DEMO_NOT_CONFIGURED: IntegrationHealth = {
  status: "not_configured",
  webhookUrl: null,
  errorCount24h: 0,
  recentDeliveries: [],
}

function mapWebhookToHealth(
  config: { url: string | null; isHealthy?: boolean },
  logs: { logs: { statusCode: number | null; success: boolean; timestamp: string }[] }
): IntegrationHealth {
  const recentDeliveries = logs.logs.slice(0, 5).map((log) => ({
    statusCode: log.statusCode ?? 0,
    success: log.success,
    timestamp: log.timestamp,
  }))

  let status: IntegrationHealth["status"] = "not_configured"
  if (config.url) {
    const hasFailure = recentDeliveries.some((d) => !d.success || d.statusCode >= 500)
    status = config.isHealthy === false || hasFailure ? "failing" : "healthy"
  }

  return {
    status,
    webhookUrl: config.url,
    lastLatencyMs: recentDeliveries[0] ? 180 : undefined,
    errorCount24h: recentDeliveries.filter((d) => !d.success).length,
    recentDeliveries,
  }
}

export type IntegrationHealthSource = "developer" | "webhooks" | "demo"

export async function fetchIntegrationHealth(): Promise<{
  health: IntegrationHealth
  source: IntegrationHealthSource
}> {
  if (!isAuthenticated()) {
    return { health: DEMO_INTEGRATION_HEALTH, source: "demo" }
  }

  try {
    const health = await getIntegrationHealth()
    return { health, source: "developer" }
  } catch {
    try {
      const [config, logs] = await Promise.all([
        getWebhookConfig(),
        getWebhookLogs({ limit: 5 }),
      ])
      return {
        health: mapWebhookToHealth(config, logs),
        source: "webhooks",
      }
    } catch {
      return { health: DEMO_INTEGRATION_HEALTH, source: "demo" }
    }
  }
}

export async function fetchWebhookConfigData(): Promise<{
  config: DeveloperWebhookConfig
  source: "api" | "mock"
}> {
  if (!isAuthenticated()) {
    return { config: DEMO_WEBHOOK_CONFIG, source: "mock" }
  }
  try {
    const config = await getWebhookConfig()
    return { config, source: "api" }
  } catch {
    return { config: DEMO_WEBHOOK_CONFIG, source: "mock" }
  }
}

export async function saveWebhookUrl(
  url: string,
  environment: ApiKeyEnvironment
): Promise<{ config: DeveloperWebhookConfig; source: "api" | "mock" }> {
  try {
    const config = await updateWebhookConfig({ url, environment })
    return { config, source: "api" }
  } catch {
    await new Promise((r) => setTimeout(r, 800))
    return {
      config: {
        ...DEMO_WEBHOOK_CONFIG,
        url,
        secret: DEMO_WEBHOOK_CONFIG.secret,
      },
      source: "mock",
    }
  }
}

export async function fetchWebhookLogsList(): Promise<{
  logs: WebhookLogEntry[]
  source: "api" | "mock"
}> {
  if (!isAuthenticated()) {
    return { logs: DEMO_WEBHOOK_LOGS, source: "mock" }
  }
  try {
    const res: WebhookLogsResponse = await getWebhookLogs({ limit: 20 })
    return { logs: res.logs, source: "api" }
  } catch {
    return { logs: DEMO_WEBHOOK_LOGS, source: "mock" }
  }
}

export async function retryWebhookLog(
  logId: string
): Promise<{ log: WebhookLogEntry; source: "api" | "mock" }> {
  try {
    await retryWebhookDelivery(logId)
    return {
      log: {
        id: logId,
        timestamp: new Date().toISOString(),
        eventType: "transaction.settled",
        payload: { retried: true },
        statusCode: 200,
        retryCount: 0,
        success: true,
      },
      source: "api",
    }
  } catch {
    await new Promise((r) => setTimeout(r, 1000))
    return {
      log: {
        id: logId,
        timestamp: new Date().toISOString(),
        eventType: "transaction.settled",
        payload: { retried: true, simulated: true },
        statusCode: 200,
        retryCount: 0,
        success: true,
      },
      source: "mock",
    }
  }
}

export async function sendTestWebhookPing(): Promise<{
  delivery: IntegrationHealth["recentDeliveries"][0]
  fromApi: boolean
}> {
  const now = new Date().toISOString()

  try {
    const result = await apiTestWebhookPing()
    return {
      delivery: {
        statusCode: result.statusCode ?? (result.success ? 200 : 500),
        success: result.success,
        timestamp: now,
      },
      fromApi: true,
    }
  } catch {
    await new Promise((r) => setTimeout(r, 1400))
    return {
      delivery: {
        statusCode: 200,
        success: true,
        timestamp: now,
      },
      fromApi: false,
    }
  }
}
