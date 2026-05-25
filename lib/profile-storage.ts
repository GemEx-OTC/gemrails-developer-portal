import type {
  BankAccount,
  DeveloperNotificationSettings,
  UpdateProfileInput,
  User,
} from "@/lib/api/types"
import { DEFAULT_NOTIFICATION_SETTINGS } from "@/lib/api/types"
import { DEMO_KYC_USER } from "@/lib/hooks/use-kyc-profile"

const PROFILE_KEY = "gemrails_dev_profile"
const LOGO_KEY = "gemrails_dev_logo"
const BANK_KEY = "gemrails_dev_bank"
const NOTIFICATIONS_KEY = "gemrails_dev_notifications"

export type StoredProfileFields = UpdateProfileInput

export function loadDemoProfile(): StoredProfileFields | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as StoredProfileFields) : null
  } catch {
    return null
  }
}

export function saveDemoProfile(fields: StoredProfileFields) {
  if (typeof window === "undefined") return
  localStorage.setItem(PROFILE_KEY, JSON.stringify(fields))
}

export function loadDemoLogo(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LOGO_KEY)
}

export function saveDemoLogo(dataUrl: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(LOGO_KEY, dataUrl)
}

export function clearDemoLogo() {
  if (typeof window === "undefined") return
  localStorage.removeItem(LOGO_KEY)
}

export function loadDemoBank(): BankAccount | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(BANK_KEY)
    return raw ? (JSON.parse(raw) as BankAccount) : null
  } catch {
    return null
  }
}

export function saveDemoBank(account: BankAccount) {
  if (typeof window === "undefined") return
  localStorage.setItem(BANK_KEY, JSON.stringify(account))
}

export function loadDemoNotificationSettings(): DeveloperNotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    return raw
      ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...(JSON.parse(raw) as DeveloperNotificationSettings) }
      : DEFAULT_NOTIFICATION_SETTINGS
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

export function saveDemoNotificationSettings(settings: DeveloperNotificationSettings) {
  if (typeof window === "undefined") return
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(settings))
}

/** Merge demo defaults with saved profile + logo for unsigned sessions. */
export function buildDemoUser(): User {
  const stored = loadDemoProfile()
  const logo = loadDemoLogo()
  const bank = loadDemoBank()
  const settings = loadDemoNotificationSettings()
  return {
    ...DEMO_KYC_USER,
    contactName: "Ada Developer",
    businessAddress: "12 Marina Road, Lagos Island, Lagos",
    phone: "+2348012345678",
    ...stored,
    businessLogo: logo ?? undefined,
    bankAccount: bank ?? undefined,
    settings,
  }
}

export function dataUrlToFile(dataUrl: string, filename = "logo.jpg"): File {
  const [header, base64] = dataUrl.split(",")
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg"
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}
