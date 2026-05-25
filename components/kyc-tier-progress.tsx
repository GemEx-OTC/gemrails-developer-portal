"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Building2,
  Check,
  Lock,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { MerchantStatusBadge } from "@/components/merchant-status-badge"
import {
  getNextTier,
  getTierStepState,
  KYC_TIERS,
  resolveAchievedTier,
  type KycTierLevel,
} from "@/lib/kyc-tiers"
import type { User } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface KycTierProgressProps {
  user: User
  onUpgrade?: (tier: KycTierLevel) => void
}

const TIER_ICONS: Record<KycTierLevel, typeof UserRound> = {
  0: UserRound,
  1: Phone,
  2: Building2,
}

export function KycTierProgress({ user, onUpgrade }: KycTierProgressProps) {
  const achieved = resolveAchievedTier(user)
  const suspended = user.merchantStatus === "suspended"
  const nextTier = getNextTier(achieved)

  return (
    <div className="space-y-6">
      <div className="gemrails-card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Account</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            {user.businessName ?? user.contactName ?? user.email}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <MerchantStatusBadge status={user.merchantStatus} />
          <p className="text-xs text-gray-500">
            Current tier:{" "}
            <span className="font-semibold text-emerald-400">Tier {achieved}</span>
          </p>
        </div>
      </div>

      {suspended && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Your merchant account is suspended. Tier upgrades and live payouts are paused until
          compliance review completes.
        </div>
      )}

      <div className="gemrails-card">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Verification tiers</h3>
            <p className="text-sm text-muted-foreground">
              Complete each step to unlock higher limits and live settlement.
            </p>
          </div>
        </div>

        <ol className="relative space-y-0">
          {KYC_TIERS.map((tier, index) => {
            const state = getTierStepState(tier.level, achieved, suspended)
            const Icon = TIER_ICONS[tier.level]
            const isLast = index === KYC_TIERS.length - 1
            const showUpgrade =
              !suspended && state === "current" && tier.upgradeCta && nextTier === tier.level

            const connectorDone = tier.level < achieved || tier.level <= achieved

            return (
              <li key={tier.level} className="relative flex gap-4 pb-10 last:pb-0">
                {!isLast && (
                  <span
                    className={cn(
                      "absolute left-[1.125rem] top-10 bottom-0 w-0.5 -translate-x-1/2",
                      connectorDone ? "bg-emerald-500/50" : "bg-[#1f2937]"
                    )}
                    aria-hidden
                  />
                )}

                <div
                  className={cn(
                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
                    state === "completed" &&
                      "border-emerald-500 bg-emerald-500/20 text-emerald-400",
                    state === "current" &&
                      "border-emerald-400 bg-emerald-500/15 text-emerald-300 ring-4 ring-emerald-500/20",
                    state === "upcoming" && "border-[#1f2937] bg-muted text-gray-500",
                    state === "locked" && "border-red-500/40 bg-red-500/10 text-red-400"
                  )}
                >
                  {state === "completed" ? (
                    <Check className="h-4 w-4" />
                  ) : state === "locked" ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border p-4 md:p-5",
                    state === "current"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-[#1f2937] bg-[#0d1117]/40"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{tier.title}</h4>
                      <p className="text-xs text-gray-500">{tier.subtitle}</p>
                    </div>
                    <TierStatePill state={state} />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {tier.limits}
                  </p>

                  {showUpgrade && (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <span className="text-xs text-gray-500">{tier.upgradeHint}</span>
                      {onUpgrade ? (
                        <button
                          type="button"
                          onClick={() => onUpgrade(tier.level)}
                          className="gemrails-button-secondary inline-flex shrink-0 items-center gap-1.5 text-sm"
                        >
                          {tier.upgradeCta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <Link
                          href={
                            tier.level === 1
                              ? "/dashboard/kyc#tier-1-phone"
                              : "/dashboard/kyc#tier-2-cac"
                          }
                          className="gemrails-button-secondary inline-flex shrink-0 items-center gap-1.5 text-sm"
                        >
                          {tier.upgradeCta}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  )}

                  {achieved === 2 && tier.level === 2 && state === "completed" && (
                    <p className="mt-3 text-xs text-emerald-400/90">
                      Maximum verification level reached.
                    </p>
                  )}
                </motion.div>
              </li>
            )
          })}
        </ol>
      </div>

      <p className="text-xs text-gray-500">
        Phone verification (DEV-502) and CAC upload (DEV-503) will connect to the upgrade actions
        above.
      </p>
    </div>
  )
}

function TierStatePill({ state }: { state: ReturnType<typeof getTierStepState> }) {
  const labels: Record<typeof state, { text: string; className: string }> = {
    completed: { text: "Complete", className: "bg-emerald-500/15 text-emerald-400" },
    current: { text: "Next step", className: "bg-teal-500/15 text-teal-400" },
    upcoming: { text: "Upcoming", className: "bg-gray-500/15 text-gray-400" },
    locked: { text: "Locked", className: "bg-red-500/15 text-red-400" },
  }
  const cfg = labels[state]
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.className
      )}
    >
      {cfg.text}
    </span>
  )
}
