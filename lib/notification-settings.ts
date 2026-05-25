import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type DeveloperNotificationSettings,
  type UpdateSettingsInput,
  type User,
} from "@/lib/api/types"

type ApiSettingsShape = {
  emailNotifications?: boolean
  smsNotifications?: boolean
  webhookFailureWarnings?: boolean
  settlementAlerts?: boolean
}

export function parseNotificationSettings(user: User): DeveloperNotificationSettings {
  const raw = user.settings as ApiSettingsShape | undefined
  if (!raw) return DEFAULT_NOTIFICATION_SETTINGS

  return {
    emailNotifications: raw.emailNotifications ?? DEFAULT_NOTIFICATION_SETTINGS.emailNotifications,
    webhookFailureWarnings:
      raw.webhookFailureWarnings ?? DEFAULT_NOTIFICATION_SETTINGS.webhookFailureWarnings,
    settlementAlerts:
      raw.settlementAlerts ?? raw.smsNotifications ?? DEFAULT_NOTIFICATION_SETTINGS.settlementAlerts,
  }
}

export function toApiSettingsPayload(
  settings: DeveloperNotificationSettings
): UpdateSettingsInput {
  return {
    emailNotifications: settings.emailNotifications,
    webhookFailureWarnings: settings.webhookFailureWarnings,
    settlementAlerts: settings.settlementAlerts,
    smsNotifications: settings.settlementAlerts,
  }
}

export function mergeUserSettings(
  user: User,
  settings: DeveloperNotificationSettings
): User {
  return { ...user, settings }
}
