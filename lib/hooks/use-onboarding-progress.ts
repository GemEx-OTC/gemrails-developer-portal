"use client"

import { useCallback, useEffect, useState } from "react"
import { getProfile } from "@/lib/api/auth"
import { isAuthenticated } from "@/lib/api/client"
import apiClient from "@/lib/api/client"
import { fetchIntegrationHealth } from "@/lib/api/webhooks"
import type { ApiResponse } from "@/lib/api/types"
import {
  DEMO_ONBOARDING,
  ONBOARDING_TASKS,
  type OnboardingCompletion,
  countCompleted,
  progressPercent,
  readLocalOnboardingFlags,
} from "@/lib/onboarding-tasks"

function buildCompletion(
  partial: Partial<OnboardingCompletion>
): OnboardingCompletion {
  return {
    phone: partial.phone ?? false,
    cac: partial.cac ?? false,
    sandbox_keys: partial.sandbox_keys ?? false,
    test_transaction: partial.test_transaction ?? false,
    webhook: partial.webhook ?? false,
  }
}

export function useOnboardingProgress() {
  const [completion, setCompletion] = useState<OnboardingCompletion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)

    if (!isAuthenticated()) {
      setCompletion(DEMO_ONBOARDING)
      setIsDemo(true)
      setIsLoading(false)
      return
    }

    const local = readLocalOnboardingFlags()
    let phone = false
    let cac = false
    let testTx = local.test_transaction ?? false
    let webhook = local.webhook ?? false
    let sandboxKeys = local.sandbox_keys ?? false

    try {
      const user = await getProfile()
      phone = !!user.phoneVerified
      cac = !!user.cacVerified
    } catch {
      /* keep defaults */
    }

    try {
      const { health } = await fetchIntegrationHealth()
      webhook = !!health.webhookUrl
    } catch {
      /* keep local/default */
    }

    try {
      const res = await apiClient.get<
        ApiResponse<{ stats?: { totalTransactions?: number } }>
      >("/dashboard")
      const total = res.data.data?.stats?.totalTransactions ?? 0
      if (total > 0) testTx = true
    } catch {
      /* keep local */
    }

    setCompletion(
      buildCompletion({
        phone,
        cac,
        sandbox_keys: sandboxKeys,
        test_transaction: testTx,
        webhook,
      })
    )
    setIsDemo(false)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const completed = completion ? countCompleted(completion) : 0
  const total = ONBOARDING_TASKS.length
  const percent = completion ? progressPercent(completion) : 0

  return {
    completion,
    isLoading,
    isDemo,
    completed,
    total,
    percent,
    refetch: load,
  }
}
