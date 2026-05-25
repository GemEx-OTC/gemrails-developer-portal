"use client"

import { useCallback, useEffect, useState } from "react"
import { getProfile } from "@/lib/api/auth"
import { shouldCallLiveApi } from "@/lib/demo-auth-config"
import { loadDemoPendingSignup } from "@/lib/api/auth-demo"
import { buildDemoUser } from "@/lib/profile-storage"
import type { User } from "@/lib/api/types"

export const DEMO_KYC_USER: User = {
  id: "demo_dev",
  email: "developer@example.com",
  emailVerified: true,
  phoneVerified: false,
  cacVerified: false,
  tier: 0,
  businessName: "Acme Payments Ltd",
  merchantStatus: "pending",
}

export type KycProfileSource = "api" | "demo"

export function useKycProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [source, setSource] = useState<KycProfileSource>("demo")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    if (!shouldCallLiveApi()) {
      const pending = loadDemoPendingSignup()
      setUser(
        pending
          ? {
              ...DEMO_KYC_USER,
              email: pending.email,
              businessName: pending.businessName,
              contactName: pending.contactName,
            }
          : DEMO_KYC_USER
      )
      setSource("demo")
      setIsLoading(false)
      return
    }

    try {
      const profile = await getProfile()
      setUser(profile)
      setSource("api")
    } catch {
      setUser(DEMO_KYC_USER)
      setSource("demo")
      setError("Could not load profile — showing sample tier state.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { user, setUser, source, isLoading, error, refetch: load }
}
