"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface CacVerificationSuccessProps {
  title?: string
  description?: string
}

export function CacVerificationSuccess({
  title = "Business verified",
  description = "Tier 2 unlocked — unlimited live transactions and settlements.",
}: CacVerificationSuccessProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
        >
          <Check className="h-10 w-10 text-emerald-400" strokeWidth={2.5} />
        </motion.div>
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-xl font-semibold text-foreground"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-2 max-w-sm text-sm text-muted-foreground"
      >
        {description}
      </motion.p>
    </div>
  )
}
