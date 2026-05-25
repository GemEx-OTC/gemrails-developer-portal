import type { User } from "@/lib/api/types"

export type KycTierLevel = 0 | 1 | 2

export type TierStepState = "completed" | "current" | "upcoming" | "locked"

export interface KycTierDefinition {
  level: KycTierLevel
  title: string
  subtitle: string
  limits: string
  upgradeCta?: string
  upgradeHint?: string
}

export const KYC_TIERS: KycTierDefinition[] = [
  {
    level: 0,
    title: "Tier 0 — Registered",
    subtitle: "Account created",
    limits: "Sandbox mode only. Zero live payouts.",
    upgradeCta: "Verify phone (Tier 1)",
    upgradeHint: "Unlock live payments with SMS verification.",
  },
  {
    level: 1,
    title: "Tier 1 — Phone verified",
    subtitle: "SMS OTP completed",
    limits: "Live transactions up to ₦100,000 daily limit.",
    upgradeCta: "Submit CAC documents (Tier 2)",
    upgradeHint: "Business verification for unlimited volume.",
  },
  {
    level: 2,
    title: "Tier 2 — Business verified",
    subtitle: "CAC verified (SmileID)",
    limits: "Unlimited live transactions & settlements.",
  },
]

/** Highest tier achieved from profile flags */
export function resolveAchievedTier(user: Pick<User, "phoneVerified" | "cacVerified" | "tier">): KycTierLevel {
  if (user.cacVerified || (user.tier ?? 0) >= 2) return 2
  if (user.phoneVerified || (user.tier ?? 0) >= 1) return 1
  return 0
}

export function getTierStepState(
  tierLevel: KycTierLevel,
  achieved: KycTierLevel,
  merchantSuspended: boolean
): TierStepState {
  if (tierLevel <= achieved) return "completed"
  if (merchantSuspended) return "locked"
  if (tierLevel === achieved + 1) return "current"
  return "upcoming"
}

export function getNextTier(achieved: KycTierLevel): KycTierLevel | null {
  if (achieved >= 2) return null
  return (achieved + 1) as KycTierLevel
}
