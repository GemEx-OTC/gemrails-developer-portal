import { setTokens } from "./client"
import { clearDemoAuthSession, markDemoAuthSession } from "@/lib/demo-auth-config"
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  ResendOtpInput,
  ResetPasswordInput,
  User,
  VerifyEmailInput,
  VerifyEmailResponse,
} from "./types"
import { DEMO_AUTH_OTP } from "@/lib/demo-auth-config"
import { buildDemoUser } from "@/lib/profile-storage"

const PENDING_SIGNUP_KEY = "gemrails_demo_auth_pending"

export interface DemoPendingSignup {
  email: string
  businessName: string
  contactName?: string
}

function delay(ms = 700) {
  return new Promise((r) => setTimeout(r, ms))
}

function demoTokens() {
  return {
    accessToken: "demo_access_token",
    refreshToken: "demo_refresh_token",
    expiresIn: 86400,
  }
}

function demoUser(overrides: Partial<User> = {}): User {
  return {
    ...buildDemoUser(),
    emailVerified: true,
    ...overrides,
  }
}

export function saveDemoPendingSignup(data: DemoPendingSignup) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(data))
}

export function loadDemoPendingSignup(): DemoPendingSignup | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY)
    return raw ? (JSON.parse(raw) as DemoPendingSignup) : null
  } catch {
    return null
  }
}

export function clearDemoPendingSignup() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(PENDING_SIGNUP_KEY)
}

export async function demoRegister(data: RegisterInput): Promise<RegisterResponse> {
  await delay(900)
  saveDemoPendingSignup({
    email: data.email,
    businessName: data.businessName,
    contactName: data.contactName,
  })
  return {
    user: demoUser({
      email: data.email,
      businessName: data.businessName,
      contactName: data.contactName,
      emailVerified: false,
    }),
    message: `Demo signup — use OTP ${DEMO_AUTH_OTP} on the next screen.`,
  }
}

export async function demoLogin(data: LoginInput): Promise<LoginResponse> {
  await delay(700)
  const pending = loadDemoPendingSignup()
  const tokens = demoTokens()
  setTokens(tokens.accessToken, tokens.refreshToken)
  markDemoAuthSession()
  return {
    user: demoUser({
      email: data.email,
      businessName: pending?.businessName,
      contactName: pending?.contactName,
      emailVerified: true,
    }),
    tokens,
  }
}

export async function demoVerifyEmail(data: VerifyEmailInput): Promise<VerifyEmailResponse> {
  await delay(700)
  if (data.otp !== DEMO_AUTH_OTP) {
    throw { message: `Demo OTP is ${DEMO_AUTH_OTP}.`, code: "INVALID_OTP" }
  }
  const pending = loadDemoPendingSignup()
  const tokens = demoTokens()
  setTokens(tokens.accessToken, tokens.refreshToken)
  markDemoAuthSession()
  clearDemoPendingSignup()
  return {
    user: demoUser({
      email: data.email,
      businessName: pending?.businessName,
      contactName: pending?.contactName,
      emailVerified: true,
    }),
    tokens,
  }
}

export async function demoResendVerificationOtp(
  _data: ResendOtpInput
): Promise<{ message: string }> {
  await delay(500)
  return { message: `Demo mode — verification code is ${DEMO_AUTH_OTP}.` }
}

export async function demoRequestPasswordReset(
  _data: ForgotPasswordInput
): Promise<{ message: string }> {
  await delay(600)
  return { message: "Demo mode — reset link simulated. Use login with any password (8+ chars)." }
}

export async function demoResetPassword(
  _data: ResetPasswordInput
): Promise<{ message: string }> {
  await delay(600)
  return { message: "Demo mode — password updated (simulated)." }
}

export async function demoChangePassword(
  _data: ChangePasswordInput
): Promise<{ message: string }> {
  await delay(500)
  return { message: "Demo mode — password updated (simulated)." }
}
