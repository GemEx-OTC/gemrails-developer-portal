"use client"

import { motion } from "framer-motion"
import { BadgeCheck, Loader2 } from "lucide-react"

interface VerifiedAccountNameBadgeProps {
  accountName: string | null
  isVerifying?: boolean
  error?: string | null
}

export function VerifiedAccountNameBadge({
  accountName,
  isVerifying,
  error,
}: VerifiedAccountNameBadgeProps) {
  if (isVerifying) {
    return (
      <div className="flex min-h-[72px] items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-400" />
        <p className="text-sm text-muted-foreground">Resolving account name…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-[72px] rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
        role="alert"
      >
        <p className="text-xs font-medium text-red-400/90">Verification failed</p>
        <p className="mt-1 text-sm text-red-300/90">{error}</p>
      </div>
    )
  }

  if (!accountName) {
    return (
      <div className="flex min-h-[72px] flex-col justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Enter a 10-digit account number to verify the account holder name.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[72px] items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
    >
      <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
      <div>
        <p className="text-xs font-medium text-emerald-400/90">Account name</p>
        <p className="mt-0.5 text-sm font-semibold tracking-wide text-foreground uppercase">
          {accountName}
        </p>
      </div>
    </motion.div>
  )
}
