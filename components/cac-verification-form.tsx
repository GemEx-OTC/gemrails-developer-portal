"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Building2, Loader2 } from "lucide-react"
import { CacDocumentUpload } from "@/components/cac-document-upload"
import { submitCacVerification } from "@/lib/api/kyc-submit"
import type { KycVerifyResponse } from "@/lib/api/kyc"
import { BUSINESS_CATEGORIES } from "@/lib/business-categories"
import { normalizeRcNumber, validateRcNumber } from "@/lib/rc-number"
import type { User } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export interface CacFormSubmission {
  rcNumber: string
  businessCategory: string
  businessAddress: string
}

interface CacVerificationFormProps {
  user: User
  onSubmitted: (payload: CacFormSubmission, result: KycVerifyResponse) => void
  disabled?: boolean
  /** When true, omit outer section wrapper (used inside CacVerificationPanel). */
  embedded?: boolean
}

export function CacVerificationForm({
  user,
  onSubmitted,
  disabled: disabledProp,
  embedded = false,
}: CacVerificationFormProps) {
  const [businessCategory, setBusinessCategory] = useState(user.businessCategory ?? "")
  const [businessAddress, setBusinessAddress] = useState(user.businessAddress ?? "")
  const [rcInput, setRcInput] = useState(user.rcNumber ?? "")
  const [document, setDocument] = useState<File | null>(null)
  const [rcError, setRcError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locked = disabledProp || isSubmitting
  const needsPhone = !user.phoneVerified

  const handleRcChange = (value: string) => {
    setRcInput(value)
    setRcError(null)
  }

  const handleRcBlur = () => {
    const normalized = normalizeRcNumber(rcInput)
    if (normalized !== rcInput) setRcInput(normalized)
    setRcError(validateRcNumber(normalized))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const rcErr = validateRcNumber(rcInput)
    setRcError(rcErr)
    if (rcErr) return

    if (!businessCategory) {
      setFormError("Select a business category.")
      return
    }
    if (!businessAddress.trim()) {
      setFormError("Business address is required.")
      return
    }
    if (!document) {
      setFormError("Upload your CAC certificate (PDF, PNG, or JPG).")
      return
    }

    const rcNumber = normalizeRcNumber(rcInput)
    const formData = new FormData()
    formData.append("rcNumber", rcNumber)
    formData.append("businessAddress", businessAddress.trim())
    formData.append("businessCategory", businessCategory)
    formData.append("document", document)

    setIsSubmitting(true)
    try {
      const { result } = await submitCacVerification(formData)
      onSubmitted(
        {
          rcNumber,
          businessCategory,
          businessAddress: businessAddress.trim(),
        },
        result
      )
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Submission failed. Try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formBody = (
    <div className="space-y-5">
      {needsPhone && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Complete Tier 1 phone verification before submitting CAC documents.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="business-category" className="text-xs font-medium text-gray-500">
              Business category
            </label>
            <select
              id="business-category"
              value={businessCategory}
              disabled={locked || needsPhone}
              onChange={(e) => {
                setBusinessCategory(e.target.value)
                setFormError(null)
              }}
              className="gemrails-input mt-1.5 text-sm"
            >
              <option value="" className="bg-card">
                Select category
              </option>
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-card">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="business-address" className="text-xs font-medium text-gray-500">
              Registered business address
            </label>
            <textarea
              id="business-address"
              rows={3}
              value={businessAddress}
              disabled={locked || needsPhone}
              onChange={(e) => {
                setBusinessAddress(e.target.value)
                setFormError(null)
              }}
              placeholder="Street, city, state — as on CAC certificate"
              className="gemrails-input mt-1.5 resize-none text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="rc-number" className="text-xs font-medium text-gray-500">
              RC / BN registration number
            </label>
            <input
              id="rc-number"
              type="text"
              value={rcInput}
              disabled={locked || needsPhone}
              onChange={(e) => handleRcChange(e.target.value)}
              onBlur={handleRcBlur}
              placeholder="RC1234567 or BN9876543"
              className={cn(
                "gemrails-input mt-1.5 font-mono uppercase text-sm",
                rcError && "border-red-500/50"
              )}
              autoComplete="off"
              spellCheck={false}
            />
            {rcError ? (
              <p className="mt-1.5 text-xs text-red-400">{rcError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-500">
                Must start with <code className="text-emerald-400/80">RC</code> or{" "}
                <code className="text-emerald-400/80">BN</code>. Numbers-only input is auto-prefixed
                with RC.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <CacDocumentUpload
              file={document}
              onFileChange={(f) => {
                setDocument(f)
                setFormError(null)
              }}
              disabled={locked || needsPhone}
            />
          </div>
        </div>

        {formError && (
          <p className="text-sm text-red-400" role="alert">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={locked || needsPhone}
          className="gemrails-button w-full text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting to SmileID…
            </>
          ) : (
            "Submit CAC for verification"
          )}
        </button>
      </form>
    </div>
  )

  if (embedded) {
    return formBody
  }

  return (
    <motion.section
      id="tier-2-cac"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="scroll-mt-24 gemrails-card space-y-6 p-6"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-teal-500/10 p-2.5">
          <Building2 className="h-5 w-5 text-teal-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Tier 2 — Business verification</h3>
          <p className="text-sm text-muted-foreground">
            Submit CAC details for SmileID registry validation.
          </p>
        </div>
      </div>
      {formBody}
    </motion.section>
  )
}
