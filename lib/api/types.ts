/** Standard API envelope from gemrails-api */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  data?: Record<string, unknown>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

// ——— Auth (shared with merchant API) ———

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn?: number
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  businessName: string
  email: string
  password: string
  contactName?: string
  accountType?: "merchant" | "enterprise"
}

export interface RegisterResponse {
  user: User
  tokens?: AuthTokens
  message?: string
}

export interface VerifyEmailInput {
  email: string
  otp: string
}

export interface VerifyEmailResponse {
  user: User
  tokens: AuthTokens
}

export interface ResendOtpInput {
  email: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}

export interface User {
  id: string
  email: string
  emailVerified?: boolean
  phoneVerified?: boolean
  cacVerified?: boolean
  tier?: number
  businessName?: string
  businessCategory?: string
  businessAddress?: string
  businessLogo?: string
  contactName?: string
  phone?: string
  rcNumber?: string
  bankAccount?: BankAccount
  settings?: DeveloperNotificationSettings
  merchantStatus?: "pending" | "verified" | "suspended"
  createdAt?: string
  updatedAt?: string
}

export interface DeveloperNotificationSettings {
  emailNotifications: boolean
  webhookFailureWarnings: boolean
  settlementAlerts: boolean
}

export interface UpdateSettingsInput {
  emailNotifications?: boolean
  webhookFailureWarnings?: boolean
  settlementAlerts?: boolean
  /** Legacy API field — mapped from settlementAlerts when calling merchant API */
  smsNotifications?: boolean
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export const DEFAULT_NOTIFICATION_SETTINGS: DeveloperNotificationSettings = {
  emailNotifications: true,
  webhookFailureWarnings: true,
  settlementAlerts: true,
}

export interface UpdateProfileInput {
  businessName?: string
  businessAddress?: string
  contactName?: string
  phone?: string
}

export interface BankAccount {
  bankCode: string
  bankName: string
  accountNumber: string
  accountName: string
  isVerified?: boolean
}

export interface UpdateBankAccountInput {
  bankCode: string
  bankName: string
  accountNumber: string
  accountName: string
  otp?: string
}

export interface VerifyBankAccountInput {
  bankCode: string
  accountNumber: string
}

export interface VerifyBankAccountResult {
  accountName: string
  accountNumber: string
  bankCode: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

// ——— Developer dashboard (DEV-201, DEV-401) ———

export interface DeveloperDashboardStats {
  totalVolumeNgn: number
  totalVolumeUsdtEquivalent: number
  apiSuccessRate: number
  activeWebhooks: number
  averageSettlementSeconds: number
  apiLive: boolean
  uptimePercent?: number
}

export interface DeveloperAnalyticsParams {
  range?: "today" | "7d" | "30d" | "custom"
  startDate?: string
  endDate?: string
}

export interface DeveloperAnalytics {
  volumeByDay: { date: string; ngn: number; usd: number }[]
  statusCodeDistribution: { bucket: "2xx" | "4xx" | "5xx"; count: number }[]
  networkSplit: { network: string; count: number }[]
  currencySplit: { currency: string; count: number }[]
}

// ——— Transactions (DEV-402) ———

export type DeveloperTxStatus =
  | "initiated"
  | "awaiting_crypto"
  | "settled"
  | "failed"

export type DeveloperTxNetwork = "BSC" | "TRON"

export interface DeveloperTransaction {
  id: string
  transactionId: string
  status: DeveloperTxStatus
  network: DeveloperTxNetwork
  cryptoAsset: "USDT" | "USDC"
  nairaAmount: number
  cryptoAmount: number
  walletAddress: string
  reference?: string
  createdAt: string
  settledAt?: string
}

export interface DeveloperTransactionsParams {
  page?: number
  limit?: number
  status?: DeveloperTxStatus | "all"
  network?: DeveloperTxNetwork | "all"
  minAmount?: number
  startDate?: string
  endDate?: string
}

export interface DeveloperTransactionsResponse {
  transactions: DeveloperTransaction[]
  pagination: PaginationMeta
  summary?: {
    totalVolume: number
    settledCount: number
    failedCount: number
  }
}

// ——— API keys (DEV-301, DEV-302) ———

export type ApiKeyEnvironment = "sandbox" | "live"

export interface DeveloperApiKeys {
  environment: ApiKeyEnvironment
  publicKey: string
  secretKey: string
  createdAt?: string
}

export interface RegenerateApiKeysInput {
  environment: ApiKeyEnvironment
}

// ——— Webhooks (DEV-303) ———

export interface DeveloperWebhookConfig {
  url: string | null
  secret: string
  isHealthy?: boolean
}

export interface WebhookLogEntry {
  id: string
  timestamp: string
  eventType:
    | "transaction.initiated"
    | "transaction.settled"
    | "transaction.failed"
    | string
  payload: Record<string, unknown>
  statusCode: number | null
  retryCount: number
  success: boolean
}

export interface WebhookLogsParams {
  page?: number
  limit?: number
  eventType?: string
}

export interface WebhookLogsResponse {
  logs: WebhookLogEntry[]
  pagination: PaginationMeta
}

export interface UpdateWebhookInput {
  url: string
  environment?: ApiKeyEnvironment
}

export interface IntegrationHealth {
  status: "healthy" | "failing" | "not_configured"
  webhookUrl: string | null
  lastLatencyMs?: number
  errorCount24h?: number
  recentDeliveries: {
    statusCode: number
    success: boolean
    timestamp: string
  }[]
}
