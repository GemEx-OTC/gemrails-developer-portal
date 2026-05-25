"use client"

import { useCallback, useState } from "react"
import { RefreshCw } from "lucide-react"
import {
  CacVerificationPanel,
  type CacSubmissionDraft,
} from "@/components/cac-verification-panel"
import { KycTierProgress } from "@/components/kyc-tier-progress"
import { PhoneVerificationModal } from "@/components/phone-verification-modal"
import { SuccessToast } from "@/components/success-toast"
import { useKycProfile } from "@/lib/hooks/use-kyc-profile"
import { isAuthenticated } from "@/lib/api/client"
import { setLocalOnboardingFlag } from "@/lib/onboarding-tasks"
import type { KycTierLevel } from "@/lib/kyc-tiers"

const SOURCE_HINT: Record<string, string> = {
  api: "Profile loaded from GET /auth/profile",
  demo: "Sample tier state — sign in to load your verification status",
}

export default function KycPage() {
  const { user, source, isLoading, error, refetch, setUser } = useKycProfile()
  const [phoneModalOpen, setPhoneModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const scrollToTier2 = useCallback(() => {
    document.getElementById("tier-2-cac")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleUpgrade = (tier: KycTierLevel) => {
    if (tier === 1) {
      setPhoneModalOpen(true)
    } else if (tier === 2) {
      scrollToTier2()
    }
  }

  const handlePhoneVerified = (e164: string) => {
    setLocalOnboardingFlag("phone", true)
    if (user) {
      setUser({
        ...user,
        phone: e164,
        phoneVerified: true,
        tier: Math.max(user.tier ?? 0, 1),
      })
    }
    setToast("Phone verified — Tier 1 unlocked.")
    setTimeout(() => setToast(null), 5000)
  }

  const applyDraft = (draft: CacSubmissionDraft) => ({
    rcNumber: draft.rcNumber,
    businessCategory: draft.businessCategory,
    businessAddress: draft.businessAddress,
  })

  const handleCacVerified = (draft: CacSubmissionDraft) => {
    setLocalOnboardingFlag("cac", true)
    if (user) {
      setUser({
        ...user,
        ...applyDraft(draft),
        cacVerified: true,
        tier: 2,
        merchantStatus: user.merchantStatus === "suspended" ? "suspended" : "verified",
      })
    }
    setToast("CAC verified — Tier 2 business verification complete.")
    setTimeout(() => setToast(null), 5000)
  }

  const handleCacPending = (draft: CacSubmissionDraft) => {
    if (user) {
      setUser({
        ...user,
        ...applyDraft(draft),
        cacVerified: false,
        tier: Math.max(user.tier ?? 0, 1),
        merchantStatus: "pending",
      })
    }
    setToast(
      "Verification is still in progress. Your profile shows Pending until SmileID completes."
    )
    setTimeout(() => setToast(null), 6000)
  }

  const handleCacError = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 6000)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">KYC & Verification</h1>
          <p className="mt-1 text-muted-foreground">
            Track compliance tiers and unlock higher transaction limits
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={isLoading}
          className="gemrails-button-outline inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="gemrails-card flex min-h-[320px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : user ? (
        <>
          <KycTierProgress user={user} onUpgrade={handleUpgrade} />
          <CacVerificationPanel
            user={user}
            onVerified={handleCacVerified}
            onPendingReview={handleCacPending}
            onError={handleCacError}
          />
          <p className="text-xs text-gray-500">{SOURCE_HINT[source]}</p>
          {error && <p className="text-xs text-amber-400/90">{error}</p>}
          {!isAuthenticated() && (
            <p className="text-xs text-gray-500">
              Demo CAC flow: polling succeeds after ~9s. Use job flow in code with{" "}
              <code className="text-emerald-400/80">demo_cac_fail</code> to test failure.
            </p>
          )}
        </>
      ) : (
        <div className="gemrails-card py-12 text-center text-sm text-muted-foreground">
          Unable to load verification status.
        </div>
      )}

      <div id="tier-1-phone" className="scroll-mt-24" aria-hidden />

      <PhoneVerificationModal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onVerified={handlePhoneVerified}
        initialLocalNumber={user?.phone ?? ""}
      />

      <SuccessToast message={toast ?? ""} open={!!toast} onClose={() => setToast(null)} />
    </div>
  )
}
