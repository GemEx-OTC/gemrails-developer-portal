"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"

interface SuccessToastProps {
  message: string
  open: boolean
  onClose: () => void
}

export function SuccessToast({ message, open, onClose }: SuccessToastProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          className="fixed right-4 bottom-4 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-500/30 bg-[#111419] px-4 py-3 shadow-lg shadow-emerald-500/10"
          role="status"
        >
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <p className="flex-1 text-sm text-foreground">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-gray-500 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
