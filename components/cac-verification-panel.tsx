"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, ShieldCheck } from "lucide-react"
import { CacVerificationForm } from "@/components/cac-verification-form"
import { CacPollingScreen } from "@/components/cac-polling-screen"
import { CacVerificationSuccess } from "@/components/cac-verification-success"
import { KycVerificationPendingBanner } from "@/components/kyc-verification-pending-banner"
import { useKycPolling } from "@/lib/hooks/use-kyc-polling"
import type { KycVerifyResponse } from "@/lib/api/kyc"
import type { User } from "@/lib/api/types"

export interface CacSubmissionDraft {
  rcNumber: string
  businessCategory: string
  businessAddress: string
}

type PanelPhase = "form" | "polling" | "success" | "pending" | "verified"

interface CacVerificationPanelProps {
  user: User
  onVerified: (draft: CacSubmissionDraft) => void
  onPendingReview: (draft: CacSubmissionDraft) => void
  onError: (message: string) => void
}

export function CacVerificationPanel({
  user,
  onVerified,
  onPendingReview,
  onError,
}: CacVerificationPanelProps) {
  const [phase, setPhase] = useState<PanelPhase>(user.cacVerified ? "verified" : "form")
  const [jobId, setJobId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CacSubmissionDraft | null>(null)

  const polling = useKycPolling(jobId, phase === "polling")

  useEffect(() => {
    if (user.cacVerified) setPhase("verified")
  }, [user.cacVerified])

  useEffect(() => {
    if (phase !== "polling") return

    if (polling.phase === "success") {
      setPhase("success")
      return
    }

    if (polling.phase === "failed") {
      setPhase("form")
      onError(polling.errorMessage ?? "CAC verification failed.")
      setJobId(null)
      return
    }

    if (polling.phase === "timeout" && draft) {
      setPhase("pending")
      onPendingReview(draft)
      setJobId(null)
    }
  }, [polling.phase, polling.errorMessage, phase, draft, onError, onPendingReview])

  useEffect(() => {
    if (phase !== "success" || !draft) return
    const timer = setTimeout(() => {
      onVerified(draft)
      setPhase("verified")
    }, 1800)
    return () => clearTimeout(timer)
  }, [phase, draft, onVerified])

  const handleFormSubmitted = (
    submission: CacSubmissionDraft,
    result: KycVerifyResponse
  ) => {
    setDraft(submission)

    if (result.status === "success" && !result.jobId) {
      setPhase("success")
      return
    }

    const id = result.jobId ?? "demo_cac_job"
    setJobId(id)
    setPhase("polling")
  }

  if (phase === "verified") {
    return (
      <div className="gemrails-card flex items-center gap-3 border-emerald-500/30 bg-emerald-500/5">
        <ShieldCheck className="h-8 w-8 text-emerald-400" />
        <div>
          <p className="font-semibold text-foreground">Business verified</p>
          <p className="text-sm text-muted-foreground">
            CAC on file{user.rcNumber ? `: ${user.rcNumber}` : ""}. Tier 2 limits apply.
          </p>
        </div>
      </div>
    )
  }

  if (phase === "pending") {
    return <KycVerificationPendingBanner />
  }

  return (
    <motion.section
      id="tier-2-cac"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="scroll-mt-24 gemrails-card overflow-hidden"
    >
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/10 p-2.5">
            <Building2 className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Tier 2 — Business verification</h3>
            <p className="text-sm text-muted-foreground">
              Submit CAC details for SmileID registry validation.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6"
          >
            <CacVerificationForm
              user={user}
              embedded
              onSubmitted={handleFormSubmitted}
            />
          </motion.div>
        )}

        {phase === "polling" && (
          <motion.div key="polling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CacPollingScreen
              attempt={polling.attempt}
              maxAttempts={polling.maxAttempts}
              message={polling.lastResult?.message}
            />
          </motion.div>
        )}

        {phase === "success" && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CacVerificationSuccess />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
