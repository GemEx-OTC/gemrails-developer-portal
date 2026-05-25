"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react"
import { resetPassword } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/error"
import { getPasswordRules, isPasswordComplex } from "@/lib/password-validation"
import { cn } from "@/lib/utils"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const rules = getPasswordRules(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!token) {
      setFormError("Reset link is invalid or expired. Request a new link.")
      return
    }
    if (!isPasswordComplex(password)) {
      setFormError("Password must meet all complexity requirements.")
      return
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword({ token, newPassword: password })
      router.replace("/auth/login?reset=success")
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not reset password. Request a new link."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15">
          <KeyRound className="h-7 w-7 text-amber-400" />
        </div>
        <h1 className="text-xl font-semibold">Invalid reset link</h1>
        <p className="text-sm text-muted-foreground">
          Open the link from your email, or request a new password reset.
        </p>
        <Link href="/auth/forgot-password" className="gemrails-button inline-flex text-sm">
          Request new link
        </Link>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold sm:text-3xl">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a strong password for your developer account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
            New password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setFormError(null)
              }}
              disabled={isSubmitting}
              autoComplete="new-password"
              className="gemrails-input pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {password.length > 0 && (
            <ul className="mt-2 space-y-1">
              {rules.map((rule) => (
                <li
                  key={rule.id}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    rule.passed ? "text-emerald-400" : "text-gray-500"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      rule.passed ? "bg-emerald-400" : "bg-gray-600"
                    )}
                  />
                  {rule.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="confirm" className="mb-2 block text-sm font-medium text-gray-300">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              id="confirm"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setFormError(null)
              }}
              disabled={isSubmitting}
              autoComplete="new-password"
              className="gemrails-input pl-11"
            />
          </div>
        </div>

        {formError && (
          <p
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300"
            role="alert"
          >
            {formError}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="gemrails-button flex w-full items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Updating…
            </>
          ) : (
            <>
              Update password
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
