"use client"

import { useCallback, useRef, useState } from "react"
import { FileText, ImageIcon, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_BYTES = 20 * 1024 * 1024
const ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf"

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isAllowedType(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase()
  return (
    file.type === "application/pdf" ||
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    ext === "pdf" ||
    ext === "png" ||
    ext === "jpg" ||
    ext === "jpeg"
  )
}

interface CacDocumentUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
  error?: string | null
}

export function CacDocumentUpload({
  file,
  onFileChange,
  disabled,
  error,
}: CacDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const validateAndSet = useCallback(
    (next: File | null) => {
      setLocalError(null)
      if (!next) {
        onFileChange(null)
        return
      }
      if (!isAllowedType(next)) {
        setLocalError("Use PDF, PNG, or JPG only.")
        return
      }
      if (next.size > MAX_BYTES) {
        setLocalError("File must be 20MB or smaller.")
        return
      }
      onFileChange(next)
    },
    [onFileChange]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSet(dropped)
  }

  const displayError = error ?? localError

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500">CAC document</label>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 transition-colors",
          dragOver && !disabled
            ? "border-emerald-500 bg-emerald-500/10"
            : displayError
            ? "border-red-500/50 bg-red-500/5"
            : "border-[#1f2937] bg-[#0d1117]/50 hover:border-gray-600",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            validateAndSet(f)
            e.target.value = ""
          }}
        />

        {!file ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 text-center"
          >
            <div className="rounded-full bg-emerald-500/15 p-3">
              <Upload className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drag &amp; drop your CAC certificate
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF, PNG, or JPG — max 20MB
              </p>
            </div>
            <span className="gemrails-button-secondary text-xs">Browse files</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/15 p-2.5">
              {file.type === "application/pdf" ? (
                <FileText className="h-6 w-6 text-teal-400" />
              ) : (
                <ImageIcon className="h-6 w-6 text-teal-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => validateAndSet(null)}
              disabled={disabled}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {displayError && <p className="text-xs text-red-400">{displayError}</p>}
    </div>
  )
}
