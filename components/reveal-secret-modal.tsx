"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"

interface RevealSecretModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  environment: "sandbox" | "live"
}

export function RevealSecretModal({
  open,
  onClose,
  onConfirm,
  environment,
}: RevealSecretModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl"
            role="dialog"
            aria-labelledby="reveal-secret-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/15 p-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <h2 id="reveal-secret-title" className="text-lg font-semibold text-foreground">
                  Reveal secret key?
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your {environment === "sandbox" ? "sandbox" : "live"} secret key grants full API
              access. Do not share it or commit it to source control. Anyone with this key can
              act on your behalf.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="gemrails-button-outline text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="gemrails-button text-sm"
              >
                Reveal key
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
