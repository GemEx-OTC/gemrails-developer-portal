"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Loader2, X } from "lucide-react"

const CONFIRM_WORD = "REGENERATE"

interface RegenerateKeysModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  environment: "sandbox" | "live"
}

export function RegenerateKeysModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  environment,
}: RegenerateKeysModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const canConfirm = confirmText === CONFIRM_WORD && !isLoading

  useEffect(() => {
    if (!open) setConfirmText("")
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={isLoading ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-red-500/20 bg-card p-6 shadow-2xl"
            role="dialog"
            aria-labelledby="regenerate-keys-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/15 p-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h2 id="regenerate-keys-title" className="text-lg font-semibold text-foreground">
                  Regenerate secret key?
                </h2>
              </div>
              {!isLoading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              All requests using the old secret key will fail immediately. This action is
              irreversible.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Regenerating {environment === "sandbox" ? "sandbox" : "live"} credentials. Your
              public key may also change.
            </p>

            <div className="mt-5">
              <label className="text-xs font-medium text-gray-500">
                Type <span className="font-mono text-red-400">{CONFIRM_WORD}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isLoading}
                placeholder={CONFIRM_WORD}
                className="gemrails-input mt-2 font-mono text-sm uppercase"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="gemrails-button-outline text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!canConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Regenerating…
                  </>
                ) : (
                  "Regenerate keys"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
