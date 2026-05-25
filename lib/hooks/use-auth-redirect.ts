"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { hasAuthSession } from "@/lib/demo-auth-config"

/** Push authenticated users back to the dashboard (or `next` query). */
export function useRedirectIfAuthenticated() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!hasAuthSession()) return
    const next = searchParams.get("next")
    router.replace(next && next.startsWith("/") ? next : "/dashboard")
  }, [router, searchParams])
}

/** Returns the validated `next` redirect target, defaulting to /dashboard. */
export function useNextRedirectTarget(): string {
  const searchParams = useSearchParams()
  const next = searchParams.get("next")
  return next && next.startsWith("/") ? next : "/dashboard"
}
