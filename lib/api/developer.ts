import apiClient from "./client"
import type {
  ApiResponse,
  DeveloperAnalytics,
  DeveloperAnalyticsParams,
  DeveloperApiKeys,
  DeveloperDashboardStats,
  DeveloperWebhookConfig,
  IntegrationHealth,
  RegenerateApiKeysInput,
  UpdateWebhookInput,
  WebhookLogsParams,
  WebhookLogsResponse,
} from "./types"

export const getDashboardStats = async (): Promise<DeveloperDashboardStats> => {
  const response = await apiClient.get<ApiResponse<DeveloperDashboardStats>>(
    "/developer/dashboard/stats"
  )
  return response.data.data
}

export const getAnalytics = async (
  params?: DeveloperAnalyticsParams
): Promise<DeveloperAnalytics> => {
  const response = await apiClient.get<ApiResponse<DeveloperAnalytics>>(
    "/developer/dashboard/analytics",
    { params }
  )
  return response.data.data
}

export const getApiKeys = async (
  environment: "sandbox" | "live" = "sandbox"
): Promise<DeveloperApiKeys> => {
  const response = await apiClient.get<ApiResponse<DeveloperApiKeys>>("/developer/keys", {
    params: { environment },
  })
  return response.data.data
}

export const regenerateApiKeys = async (
  data: RegenerateApiKeysInput
): Promise<DeveloperApiKeys> => {
  const response = await apiClient.post<ApiResponse<DeveloperApiKeys>>(
    "/developer/keys/regenerate",
    data
  )
  return response.data.data
}

export const getWebhookConfig = async (): Promise<DeveloperWebhookConfig> => {
  const response = await apiClient.get<ApiResponse<DeveloperWebhookConfig>>(
    "/developer/webhooks"
  )
  return response.data.data
}

export const updateWebhookConfig = async (
  data: UpdateWebhookInput
): Promise<DeveloperWebhookConfig> => {
  const response = await apiClient.post<ApiResponse<DeveloperWebhookConfig>>(
    "/developer/webhooks",
    data
  )
  return response.data.data
}

export const getWebhookLogs = async (
  params?: WebhookLogsParams
): Promise<WebhookLogsResponse> => {
  const response = await apiClient.get<ApiResponse<WebhookLogsResponse>>(
    "/developer/webhooks/logs",
    { params }
  )
  return response.data.data
}

/** DEV-202 — integration health widget data */
export const getIntegrationHealth = async (): Promise<IntegrationHealth> => {
  const response = await apiClient.get<ApiResponse<IntegrationHealth>>(
    "/developer/dashboard/integration-health"
  )
  return response.data.data
}

export const retryWebhookDelivery = async (
  logId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<
    ApiResponse<{ success: boolean; message: string }>
  >(`/developer/webhooks/logs/${logId}/retry`)
  return response.data.data
}

export const testWebhookPing = async (): Promise<{
  success: boolean
  statusCode?: number
  latencyMs?: number
  message: string
}> => {
  const response = await apiClient.post<
    ApiResponse<{
      success: boolean
      statusCode?: number
      latencyMs?: number
      message: string
    }>
  >("/developer/webhooks/test-ping")
  return response.data.data
}
