"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react"
import {
  getPasswordRules,
  validatePasswordChange,
} from "@/lib/password-validation"
import { cn } from "@/lib/utils"

interface ChangePasswordFormProps {
  disabled?: boolean
  isSaving?: boolean
  onChangePassword: (input: {
    currentPassword: string
    newPassword: string
  }) => Promise<void>
}

export function ChangePasswordForm({
  disabled,
  isSaving,
  onChangePassword,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const rules = getPasswordRules(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const validationError = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmPassword,
    })
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      await onChangePassword({ currentPassword, newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      /* parent */
    }
  }

  const locked = disabled || isSaving
  const inputType = showPasswords ? "text" : "password"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2.5">
          <Shield className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Password</h3>
          <p className="text-sm text-muted-foreground">
            Update your developer account password.
          </p>
        </div>
      </div>

      {disabled && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          Sign in to change your password. Demo mode does not store credentials.
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="current-password" className="text-xs font-medium text-gray-500">
            Current password
          </label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              id="current-password"
              type={inputType}
              value={currentPassword}
              disabled={locked}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                setFormError(null)
              }}
              className="gemrails-input pl-10 text-sm"
              autoComplete="current-password"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="new-password" className="text-xs font-medium text-gray-500">
              New password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                id="new-password"
                type={inputType}
                value={newPassword}
                disabled={locked}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setFormError(null)
                }}
                className="gemrails-input pl-10 text-sm"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-xs font-medium text-gray-500">
              Confirm new password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                id="confirm-password"
                type={inputType}
                value={confirmPassword}
                disabled={locked}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setFormError(null)
                }}
                className="gemrails-input pl-10 text-sm"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={locked}
          onClick={() => setShowPasswords((v) => !v)}
          className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-50"
        >
          {showPasswords ? "Hide passwords" : "Show passwords"}
        </button>

        {newPassword.length > 0 && (
          <ul className="space-y-1.5 rounded-xl border border-border bg-muted/20 px-4 py-3">
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

      {formError && (
        <p className="text-sm text-red-400" role="alert">
          {formError}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-6">
        <button
          type="submit"
          disabled={locked}
          className={cn("gemrails-button gap-2 text-sm", locked && "opacity-50")}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Update password
            </>
          )}
        </button>
      </div>
    </form>
  )
}
