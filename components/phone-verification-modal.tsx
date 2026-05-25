"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Loader2, Phone, RotateCcw, X } from "lucide-react"
import { CountryCodeSelect } from "@/components/country-code-select"
import { OtpInput } from "@/components/otp-input"
import { createPhoneOtpService, DEMO_OTP } from "@/lib/api/auth"
import { isAuthenticated } from "@/lib/api/client"
import {
  buildE164,
  DEFAULT_COUNTRY,
  maskPhoneNumber,
  sanitizeLocalNumber,
  type CountryCode,
} from "@/lib/country-codes"
import { cn } from "@/lib/utils"

const RESEND_COOLDOWN_SECONDS = 60

interface PhoneVerificationModalProps {
  open: boolean
  onClose: () => void
  onVerified: (e164Phone: string) => void
  initialCountry?: CountryCode
  initialLocalNumber?: string
}

type Step = "phone" | "otp" | "success"

export function PhoneVerificationModal({
  open,
  onClose,
  onVerified,
  initialCountry = DEFAULT_COUNTRY,
  initialLocalNumber = "",
}: PhoneVerificationModalProps) {
  const [country, setCountry] = useState<CountryCode>(initialCountry)
  const [localNumber, setLocalNumber] = useState(sanitizeLocalNumber(initialLocalNumber))
  const [step, setStep] = useState<Step>("phone")
  const [otpValue, setOtpValue] = useState("")
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [demoMode, setDemoMode] = useState(false)

  const service = useMemo(() => createPhoneOtpService(isAuthenticated()), [open])

  const resetState = useCallback(() => {
    setStep("phone")
    setOtpValue("")
    setPhoneError(null)
    setOtpError(null)
    setStatusMessage(null)
    setIsSending(false)
    setIsVerifying(false)
    setCooldown(0)
    setDemoMode(false)
    setCountry(initialCountry)
    setLocalNumber(sanitizeLocalNumber(initialLocalNumber))
  }, [initialCountry, initialLocalNumber])

  useEffect(() => {
    if (!open) {
      const t = setTimeout(resetState, 200)
      return () => clearTimeout(t)
    }
  }, [open, resetState])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const e164 = buildE164(country, localNumber)
  const maskedPhone = maskPhoneNumber(country, localNumber)

  const validatePhone = (): string | null => {
    const local = sanitizeLocalNumber(localNumber)
    if (!local) return "Phone number is required"
    if (local.length < country.localLength - 1)
      return `Enter a valid ${country.localLength}-digit number for ${country.label}`
    if (local.length > country.localLength + 1)
      return `Number is too long for ${country.label}`
    return null
  }

  const handleSendOtp = async () => {
    setStatusMessage(null)
    const err = validatePhone()
    setPhoneError(err)
    if (err) return

    setIsSending(true)
    try {
      const res = await service.send(e164)
      setDemoMode(!!res.demo)
      setStatusMessage(res.message ?? "Code sent.")
      setStep("otp")
      setOtpValue("")
      setOtpError(null)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (e) {
      setPhoneError(
        e instanceof Error ? e.message : "Failed to send code. Please try again."
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return
    setIsSending(true)
    setOtpError(null)
    try {
      const res = await service.send(e164)
      setDemoMode(!!res.demo)
      setStatusMessage(res.message ?? "Code resent.")
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setOtpValue("")
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Failed to resend code.")
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async () => {
    if (otpValue.length !== 6) {
      setOtpError("Enter the 6-digit code")
      return
    }
    setIsVerifying(true)
    setOtpError(null)
    try {
      await service.verify(e164, otpValue)
      setStep("success")
      setTimeout(() => {
        onVerified(e164)
        onClose()
      }, 1500)
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Invalid verification code")
    } finally {
      setIsVerifying(false)
    }
  }

  const cooldownLabel =
    cooldown > 0 ? `Resend in ${cooldown.toString().padStart(2, "0")}s` : "Resend code"

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={isVerifying || isSending ? undefined : onClose}
          />
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            role="dialog"
            aria-labelledby="phone-verify-title"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/15 p-2.5">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 id="phone-verify-title" className="text-lg font-semibold text-foreground">
                    Verify phone number
                  </h2>
                  <p className="text-sm text-muted-foreground">Tier 1 verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isVerifying || isSending}
                className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {step === "phone" && (
                <>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll send a 6-digit verification code by SMS. Standard rates apply.
                  </p>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Phone number</label>
                    <div className="mt-1.5 flex items-stretch">
                      <CountryCodeSelect
                        value={country}
                        onChange={(c) => {
                          setCountry(c)
                          setPhoneError(null)
                        }}
                        disabled={isSending}
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={localNumber}
                        onChange={(e) => {
                          setLocalNumber(sanitizeLocalNumber(e.target.value))
                          setPhoneError(null)
                        }}
                        placeholder={
                          country.iso === "NG" ? "8012345678" : "Local number"
                        }
                        disabled={isSending}
                        className={cn(
                          "h-[52px] w-full rounded-r-xl border border-l-0 border-gray-700 bg-gray-800/60 px-4 font-mono text-white placeholder-gray-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60",
                          phoneError && "border-red-500/50"
                        )}
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-1.5 text-xs text-red-400">{phoneError}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSending}
                    className="gemrails-button w-full text-sm"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4" />
                        Send verification code
                      </>
                    )}
                  </button>

                  {!isAuthenticated() && (
                    <p className="text-xs text-gray-500">
                      Demo mode — any number works, the OTP will be{" "}
                      <code className="text-emerald-400/80">{DEMO_OTP}</code>.
                    </p>
                  )}
                </>
              )}

              {step === "otp" && (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium text-foreground">{maskedPhone}</span>
                  </p>

                  <OtpInput
                    value={otpValue}
                    onChange={(v) => {
                      setOtpValue(v)
                      if (otpError) setOtpError(null)
                    }}
                    disabled={isVerifying}
                    error={!!otpError}
                  />

                  {otpError && (
                    <p className="text-center text-xs text-red-400">{otpError}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone")
                        setOtpValue("")
                        setOtpError(null)
                      }}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Change number
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || isSending}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw className={cn("h-3.5 w-3.5", isSending && "animate-spin")} />
                      {cooldownLabel}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying || otpValue.length !== 6}
                    className="gemrails-button w-full text-sm"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Verify &amp; continue
                      </>
                    )}
                  </button>

                  {demoMode && (
                    <p className="text-center text-xs text-gray-500">
                      Demo OTP: <code className="text-emerald-400/80">{DEMO_OTP}</code>
                    </p>
                  )}
                  {statusMessage && !demoMode && (
                    <p className="text-center text-xs text-gray-500">{statusMessage}</p>
                  )}
                </>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30"
                  >
                    <motion.span
                      initial={{ pathLength: 0, scale: 0.6 }}
                      animate={{ pathLength: 1, scale: 1 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                    >
                      <Check className="h-8 w-8 text-emerald-400" />
                    </motion.span>
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Phone verified</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tier 1 unlocked — you can accept live transactions up to ₦100,000/day.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
