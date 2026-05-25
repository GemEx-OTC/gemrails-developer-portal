"use client"

import { motion } from "framer-motion"
import { Loader2, ShieldCheck } from "lucide-react"

interface CacPollingScreenProps {
  attempt: number
  maxAttempts: number
  message?: string
}

export function CacPollingScreen({ attempt, maxAttempts, message }: CacPollingScreenProps) {
  const progress = Math.min(100, Math.round((attempt / maxAttempts) * 100))

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20"
      >
        <ShieldCheck className="h-8 w-8 text-emerald-400" />
      </motion.div>

      <h3 className="text-lg font-semibold text-foreground">
        Authenticating with CAC Registry…
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {message ?? "SmileID is validating your business registration. This usually takes under a minute."}
      </p>

      <div className="mt-8 w-full max-w-xs">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Checking status</span>
          <span>
            Attempt {attempt} / {maxAttempts}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
        Do not close this page
      </div>
    </div>
  )
}
