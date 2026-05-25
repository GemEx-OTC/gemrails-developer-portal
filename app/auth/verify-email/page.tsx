"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Loader2, Mail } from "lucide-react"
import { OtpInput } from "@/components/otp-input"
import { resendVerificationOtp, verifyEmail } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/error"

const RESEND_SECONDS = 60

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const shouldAutoResend = searchParams.get("resend") === "true"

  const [otp, setOtp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS)
  const [formError, setFormError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const autoResendTriggered = useRef(false)

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendTimer])

  useEffect(() => {
    if (!shouldAutoResend || !email || autoResendTriggered.current) return
    autoResendTriggered.current = true

    const runAutoResend = async () => {
      setIsResending(true)
      setFormError(null)
      try {
        await resendVerificationOtp({ email })
        setResendTimer(RESEND_SECONDS)
        setInfo("Verification code sent to your email.")
      } catch (err) {
        setFormError(getErrorMessage(err, "Could not resend the code. Try again shortly."))
      } finally {
        setIsResending(false)
      }
    }

    runAutoResend()
  }, [shouldAutoResend, email])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (otp.length !== 6) {
      setFormError("Enter the full 6-digit verification code.")
      return
    }

    setIsSubmitting(true)
    try {
      await verifyEmail({ email, otp })
      router.replace("/dashboard")
    } catch (err) {
      setFormError(getErrorMessage(err, "Verification failed. Try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async (silent = false) => {
    if (!email || resendTimer > 0 || isResending) return
    setIsResending(true)
    setFormError(null)
    try {
      await resendVerificationOtp({ email })
      setResendTimer(RESEND_SECONDS)
      setOtp("")
      if (!silent) setInfo("New verification code sent.")
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not resend the code. Try again shortly."))
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-semibold text-white">Verification link is incomplete</h1>
        <p className="text-sm text-gray-400">
          We couldn&apos;t find an email to verify. Sign up or sign in to continue.
        </p>
        <Link href="/auth/login" className="gemrails-button-outline inline-block text-sm">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
          <Mail className="h-7 w-7 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-400">
          We sent a 6-digit code to <span className="text-white">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} error={!!formError} />

        {formError && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300" role="alert">
            {formError}
          </p>
        )}

        {info && !formError && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
            {info}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting || otp.length !== 6}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="gemrails-button w-full gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              Verify and continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>

        <div className="text-center text-sm">
          {resendTimer > 0 ? (
            <p className="text-gray-500">
              Resend code in{" "}
              <span className="font-semibold text-white">{resendTimer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => handleResend()}
              disabled={isResending}
              className="inline-flex items-center gap-2 font-medium text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-50"
            >
              {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isResending ? "Sending…" : "Resend code"}
            </button>
          )}
        </div>
      </form>

      <p className="text-center text-xs text-gray-500">
        Wrong email?{" "}
        <Link href="/auth/signup" className="font-medium text-emerald-400 hover:text-emerald-300">
          Start over
        </Link>
      </p>
    </motion.div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
    </div>
  )
}
