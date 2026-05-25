"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { AuthFormAlert } from "@/components/auth-form-alert"
import { login } from "@/lib/api/auth"
import { getErrorCode, getErrorMessage } from "@/lib/api/error"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccess("Password updated. Sign in with your new password.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError("Please enter your email and password.")
      return
    }

    setIsLoading(true)
    try {
      await login({ email: email.trim(), password })
      const next = searchParams.get("next")
      router.push(next && next.startsWith("/dashboard") ? next : "/dashboard")
    } catch (err) {
      if (getErrorCode(err) === "EMAIL_NOT_VERIFIED") {
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(email.trim())}&resend=true`
        )
        return
      }
      setError(getErrorMessage(err, "Invalid credentials. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to your developer account</p>
      </div>

      {success && <AuthFormAlert variant="success" message={success} />}
      {error && <AuthFormAlert variant="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="you@company.com"
              disabled={isLoading}
              autoComplete="email"
              className="gemrails-input pl-11"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
              className="gemrails-input pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.99 }}
          className="gemrails-button flex w-full items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </motion.button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-4 text-muted-foreground">New developer?</span>
        </div>
      </div>

      <Link href="/auth/signup" className="gemrails-button-outline block w-full text-center">
        Create developer account
      </Link>

      <p className="text-center text-xs text-gray-500">
        <Link href="/" className="text-emerald-400/80 hover:text-emerald-400">
          ← Back to developer portal
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
    </div>
  )
}
