"use client"

import { Clock } from "lucide-react"
import { MerchantStatusBadge } from "@/components/merchant-status-badge"

interface KycVerificationPendingBannerProps {
  message?: string
}

export function KycVerificationPendingBanner({
  message = "CAC validation is still running in the background. We will update your status when SmileID completes the check.",
}: KycVerificationPendingBannerProps) {
  return (
    <div className="gemrails-card flex flex-col gap-4 border-amber-500/30 bg-amber-500/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-500/15 p-2.5">
          <Clock className="h-5 w-5 text-amber-300" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Verification in progress</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      <MerchantStatusBadge status="pending" />
    </div>
  )
}
