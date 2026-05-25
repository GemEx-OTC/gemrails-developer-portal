"use client"

import { useEffect, useRef, useState } from "react"
import { resolveBankAccountName } from "@/lib/api/bank-verify"

const DEBOUNCE_MS = 450

interface UseDebouncedBankVerifyOptions {
  bankCode: string
  accountNumber: string
  businessName?: string
  enabled?: boolean
}

export function useDebouncedBankVerify({
  bankCode,
  accountNumber,
  businessName,
  enabled = true,
}: UseDebouncedBankVerifyOptions) {
  const [accountName, setAccountName] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const digits = accountNumber.replace(/\D/g, "")
    if (!bankCode || digits.length !== 10) {
      setAccountName(null)
      setError(null)
      setIsVerifying(false)
      return
    }

    setAccountName(null)
    setError(null)
    setIsVerifying(true)

    const requestId = ++requestIdRef.current
    const timer = setTimeout(async () => {
      try {
        const result = await resolveBankAccountName(
          { bankCode, accountNumber: digits },
          businessName
        )
        if (requestId !== requestIdRef.current) return
        setAccountName(result.accountName)
        setError(null)
      } catch (e) {
        if (requestId !== requestIdRef.current) return
        setAccountName(null)
        setError(e instanceof Error ? e.message : "Verification failed")
      } finally {
        if (requestId === requestIdRef.current) setIsVerifying(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [bankCode, accountNumber, businessName, enabled])

  return { accountName, isVerifying, error }
}
