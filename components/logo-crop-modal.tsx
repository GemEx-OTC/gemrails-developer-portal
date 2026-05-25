"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, X, ZoomIn } from "lucide-react"
import { cropImageToSquare } from "@/lib/image-crop"

interface LogoCropModalProps {
  open: boolean
  imageSrc: string | null
  onClose: () => void
  onApply: (croppedDataUrl: string) => Promise<void>
}

export function LogoCropModal({ open, imageSrc, onClose, onApply }: LogoCropModalProps) {
  const [scale, setScale] = useState(1)
  const [preview, setPreview] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    if (!open || !imageSrc) {
      setPreview(null)
      setScale(1)
      return
    }

    let cancelled = false
    cropImageToSquare(imageSrc, 256, scale).then((url) => {
      if (!cancelled) setPreview(url)
    })
    return () => {
      cancelled = true
    }
  }, [open, imageSrc, scale])

  const handleApply = async () => {
    if (!imageSrc) return
    setIsApplying(true)
    try {
      const cropped = await cropImageToSquare(imageSrc, 256, scale)
      await onApply(cropped)
      onClose()
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <AnimatePresence>
      {open && imageSrc && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md rounded-2xl border border-border bg-card shadow-2xl md:inset-x-auto"
            role="dialog"
            aria-labelledby="logo-crop-title"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 id="logo-crop-title" className="text-lg font-semibold">
                Crop logo
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:bg-muted hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-muted">
                {preview ? (
                  <img src={preview} alt="Crop preview" className="h-full w-full object-cover" />
                ) : (
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                  <ZoomIn className="h-3.5 w-3.5" />
                  Zoom
                </div>
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <p className="text-center text-xs text-gray-500">
                Square crop · saved as JPEG for your dashboard avatar
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="gemrails-button-outline flex-1 text-sm"
                  disabled={isApplying}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isApplying || !preview}
                  className="gemrails-button flex-1 text-sm"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Apply logo"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
