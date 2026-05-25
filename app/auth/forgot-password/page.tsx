"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"
import { requestPasswordReset } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/error"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!email.includes("@")) {
      setFormError("Enter a valid email address.")
      return
    }

    setIsSubmitting(true)
    try {
      await requestPasswordReset({ email: email.trim() })
      setSubmittedEmail(email.trim())
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not send reset link. Try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Reset your password</h1>
        <p className="mt-2 text-sm text-gray-400">
          {submittedEmail
            ? "Check your inbox for reset instructions."
            : "Enter the email you signed up with and we&apos;ll send you a reset link."}
        </p>
      </div>

      {submittedEmail ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">Email sent</h3>
            <p className="text-sm text-gray-400">
              Reset instructions are on the way to{" "}
              <span className="font-medium text-white">{submittedEmail}</span>. Check your inbox
              and spam folder.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmittedEmail(null)
              setEmail("")
            }}
            className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            Try a different email
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-medium text-gray-400">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFormError(null)
                }}
                placeholder="developer@example.com"
                disabled={isSubmitting}
                className="gemrails-input pl-11 text-sm"
              />
            </div>
          </div>

          {formError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300" role="alert">
              {formError}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="gemrails-button w-full gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending link…
              </>
            ) : (
              "Send reset link"
            )}
          </motion.button>
        </form>
      )}
    </div>
  )
}
