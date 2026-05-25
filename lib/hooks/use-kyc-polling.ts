"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  fetchKycJobStatus,
  KYC_POLL_INTERVAL_MS,
  KYC_POLL_MAX_ATTEMPTS,
  type KycJobStatusResult,
} from "@/lib/api/kyc-polling"

export type KycPollingPhase = "idle" | "polling" | "success" | "failed" | "timeout"

export function useKycPolling(jobId: string | null, active: boolean) {
  const [phase, setPhase] = useState<KycPollingPhase>("idle")
  const [attempt, setAttempt] = useState(0)
  const [lastResult, setLastResult] = useState<KycJobStatusResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const cancelledRef = useRef(false)

  const reset = useCallback(() => {
    cancelledRef.current = true
    setPhase("idle")
    setAttempt(0)
    setLastResult(null)
    setErrorMessage(null)
  }, [])

  useEffect(() => {
    if (!active || !jobId) {
      reset()
      cancelledRef.current = false
      return
    }

    cancelledRef.current = false
    setPhase("polling")
    setAttempt(0)
    setErrorMessage(null)

    let currentAttempt = 0

    const runPoll = async () => {
      if (cancelledRef.current) return

      currentAttempt += 1
      setAttempt(currentAttempt)

      try {
        const result = await fetchKycJobStatus(jobId, currentAttempt)
        if (cancelledRef.current) return

        setLastResult(result)

        if (result.status === "success") {
          setPhase("success")
          return
        }

        if (result.status === "failed") {
          setPhase("failed")
          setErrorMessage(result.message ?? "CAC verification failed.")
          return
        }

        if (currentAttempt >= KYC_POLL_MAX_ATTEMPTS) {
          setPhase("timeout")
          return
        }

        setTimeout(runPoll, KYC_POLL_INTERVAL_MS)
      } catch (e) {
        if (cancelledRef.current) return
        setPhase("failed")
        setErrorMessage(e instanceof Error ? e.message : "Status check failed.")
      }
    }

    runPoll()

    return () => {
      cancelledRef.current = true
    }
  }, [jobId, active, reset])

  return {
    phase,
    attempt,
    maxAttempts: KYC_POLL_MAX_ATTEMPTS,
    lastResult,
    errorMessage,
    reset,
  }
}
