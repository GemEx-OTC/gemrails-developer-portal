export interface PasswordRule {
  id: string
  label: string
  passed: boolean
}

const HAS_UPPERCASE = /[A-Z]/
const HAS_NUMBER = /\d/
const HAS_SPECIAL = /[^A-Za-z0-9]/

export function getPasswordRules(password: string): PasswordRule[] {
  return [
    { id: "length", label: "At least 8 characters", passed: password.length >= 8 },
    { id: "upper", label: "One uppercase letter", passed: HAS_UPPERCASE.test(password) },
    { id: "number", label: "One number", passed: HAS_NUMBER.test(password) },
    { id: "special", label: "One special character", passed: HAS_SPECIAL.test(password) },
  ]
}

export function isPasswordComplex(password: string): boolean {
  return getPasswordRules(password).every((r) => r.passed)
}

export function validatePasswordChange(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): string | null {
  if (!input.currentPassword.trim()) return "Enter your current password."
  if (!input.newPassword) return "Enter a new password."
  if (!isPasswordComplex(input.newPassword)) {
    return "New password must meet all complexity requirements."
  }
  if (input.newPassword !== input.confirmPassword) return "New passwords do not match."
  if (input.currentPassword === input.newPassword) {
    return "New password must be different from your current password."
  }
  return null
}
