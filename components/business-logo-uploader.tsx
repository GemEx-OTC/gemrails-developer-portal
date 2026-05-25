"use client"

import { useRef, useState } from "react"
import { Loader2, Upload, X } from "lucide-react"
import { LogoCropModal } from "@/components/logo-crop-modal"
import { getImageUrl } from "@/lib/utils/image"

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp"

interface BusinessLogoUploaderProps {
  logo?: string | null
  businessName?: string
  disabled?: boolean
  busy?: boolean
  onSave: (croppedDataUrl: string) => Promise<void>
  onRemove: () => Promise<void>
}

export function BusinessLogoUploader({
  logo,
  businessName,
  disabled,
  busy,
  onSave,
  onRemove,
}: BusinessLogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const src = getImageUrl(logo ?? null)
  const initials = (businessName?.trim() || "G").charAt(0).toUpperCase()

  const handleFile = (file: File) => {
    setFileError(null)
    if (file.size > MAX_BYTES) {
      setFileError("File too large. Maximum size is 5MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result as string)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-500/20">
          {src ? (
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
              {initials}
            </span>
          )}
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Business logo</p>
          <p className="text-xs text-muted-foreground">PNG or JPG, max 5MB. Shown on your dashboard.</p>
          {fileError && (
            <p className="text-xs text-red-400" role="alert">
              {fileError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <label
              className={`gemrails-button-outline inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm ${
                disabled || busy ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <Upload className="h-4 w-4" />
              {logo ? "Change logo" : "Upload logo"}
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                accept={ACCEPT}
                disabled={disabled || busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ""
                }}
              />
            </label>
            {logo && (
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => onRemove()}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <LogoCropModal
        open={cropOpen}
        imageSrc={cropSrc}
        onClose={() => {
          setCropOpen(false)
          setCropSrc(null)
        }}
        onApply={onSave}
      />
    </>
  )
}
