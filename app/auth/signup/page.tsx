"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react"
import { AuthFormAlert } from "@/components/auth-form-alert"
import { register } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/error"
import { getPasswordRules, isPasswordComplex } from "@/lib/password-validation"
import { cn } from "@/lib/utils"

export default function SignupPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rules = getPasswordRules(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!businessName.trim()) {
      setError("Business name is required.")
      return
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.")
      return
    }
    if (!isPasswordComplex(password)) {
      setError("Password must meet all complexity requirements below.")
      return
    }

    setIsLoading(true)
    try {
      await register({
        businessName: businessName.trim(),
        email: email.trim(),
        password,
        contactName: contactName.trim() || undefined,
        accountType: "merchant",
      })
      router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`)
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold sm:text-3xl">Create your account</h1>
        <p className="mt-2 text-muted-foreground">
          Register to get sandbox API keys and start integrating
        </p>
      </div>

      {error && <AuthFormAlert variant="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="business-name" className="mb-2 block text-sm font-medium text-gray-300">
            Business name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value)
                setError(null)
              }}
              placeholder="Acme Payments Ltd"
              disabled={isLoading}
              className="gemrails-input pl-11"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-gray-300">
            Contact name <span className="text-gray-500">(optional)</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              id="contact-name"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ada Developer"
              disabled={isLoading}
              className="gemrails-input pl-11"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
            Work email
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
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
            Password
          </label>
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
              placeholder="Create a strong password"
              disabled={isLoading}
              autoComplete="new-password"
              className="gemrails-input pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
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
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </motion.button>
      </form>

      <p className="text-center text-xs text-gray-500">
        By signing up you agree to verify your email before accessing live features.
      </p>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-4 text-muted-foreground">Already registered?</span>
        </div>
      </div>

      <Link
        href="/auth/login"
        className="gemrails-button-outline inline-flex w-full items-center justify-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Sign in
      </Link>
    </div>
  )
}
