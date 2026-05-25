"use client"

import { useLiveAuth, DEMO_AUTH_OTP } from "@/lib/demo-auth-config"

export function AuthDemoBanner() {
  if (useLiveAuth()) return null

  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
      <p className="font-medium text-amber-100">Demo auth — no API connected</p>
      <p className="mt-1 text-xs text-amber-200/80">
        Walk through the full flow locally. Email verification OTP:{" "}
        <code className="font-mono text-emerald-300">{DEMO_AUTH_OTP}</code>. Set{" "}
        <code className="font-mono text-emerald-300/90">NEXT_PUBLIC_USE_LIVE_AUTH=true</code> when
        the backend is ready.
      </p>
    </div>
  )
}
