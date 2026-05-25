import apiClient, { clearTokens, setTokens } from "./client"
import { clearDemoAuthSession, useLiveAuth } from "@/lib/demo-auth-config"
import {
  demoChangePassword,
  demoLogin,
  demoRegister,
  demoRequestPasswordReset,
  demoResendVerificationOtp,
  demoResetPassword,
  demoVerifyEmail,
} from "./auth-demo"
import type {
  ApiResponse,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  ResendOtpInput,
  ResetPasswordInput,
  UpdateBankAccountInput,
  UpdateProfileInput,
  UpdateSettingsInput,
  User,
  VerifyBankAccountInput,
  VerifyBankAccountResult,
  VerifyEmailInput,
  VerifyEmailResponse,
} from "./types"

export const login = async (data: LoginInput): Promise<LoginResponse> => {
  if (!useLiveAuth()) return demoLogin(data)
  const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", data)
  const { tokens } = response.data.data
  setTokens(tokens.accessToken, tokens.refreshToken)
  return response.data.data
}

export const register = async (data: RegisterInput): Promise<RegisterResponse> => {
  if (!useLiveAuth()) return demoRegister(data)
  const response = await apiClient.post<ApiResponse<RegisterResponse>>(
    "/auth/register",
    data
  )
  const result = response.data.data
  if (result.tokens) {
    setTokens(result.tokens.accessToken, result.tokens.refreshToken)
  }
  return result
}

export const verifyEmail = async (data: VerifyEmailInput): Promise<VerifyEmailResponse> => {
  if (!useLiveAuth()) return demoVerifyEmail(data)
  const response = await apiClient.post<ApiResponse<VerifyEmailResponse>>(
    "/auth/verify-email",
    data
  )
  const result = response.data.data
  if (result.tokens) {
    setTokens(result.tokens.accessToken, result.tokens.refreshToken)
  }
  return result
}

export const resendVerificationOtp = async (
  data: ResendOtpInput
): Promise<{ message: string }> => {
  if (!useLiveAuth()) return demoResendVerificationOtp(data)
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/resend-otp",
    data
  )
  return response.data.data
}

export const requestPasswordReset = async (
  data: ForgotPasswordInput
): Promise<{ message: string }> => {
  if (!useLiveAuth()) return demoRequestPasswordReset(data)
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/forgot-password",
    data
  )
  return response.data.data
}

export const resetPassword = async (
  data: ResetPasswordInput
): Promise<{ message: string }> => {
  if (!useLiveAuth()) return demoResetPassword(data)
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/reset-password",
    data
  )
  return response.data.data
}

export const logout = async (): Promise<void> => {
  if (!useLiveAuth()) {
    clearDemoAuthSession()
    clearTokens()
    return
  }
  try {
    await apiClient.post("/auth/logout")
  } finally {
    clearTokens()
  }
}

export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>("/auth/profile")
  return response.data.data
}

export const updateProfile = async (data: UpdateProfileInput): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>("/auth/profile", data)
  return response.data.data
}

export const uploadLogo = async (formData: FormData): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>("/auth/upload-logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data.data
}

export const deleteLogo = async (): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>("/auth/logo")
  return response.data.data
}

export const verifyBankAccount = async (
  data: VerifyBankAccountInput
): Promise<VerifyBankAccountResult> => {
  const response = await apiClient.post<ApiResponse<VerifyBankAccountResult>>(
    "/auth/verify-bank",
    data
  )
  return response.data.data
}

export const updateBankAccount = async (data: UpdateBankAccountInput): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>("/auth/bank-account", data)
  return response.data.data
}

export const updateSettings = async (data: UpdateSettingsInput): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>("/auth/settings", data)
  return response.data.data
}

export const changePassword = async (
  data: ChangePasswordInput
): Promise<{ message: string }> => {
  if (!useLiveAuth()) return demoChangePassword(data)
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/change-password",
    data
  )
  return response.data.data
}

/** Tier 1 — lives under enterprise module today (see DEV-001-discovery.md) */
export const sendPhoneOtp = async (phone: string): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/enterprise/phone/send-otp",
    { phone }
  )
  return response.data.data
}

export const verifyPhoneOtp = async (
  phone: string,
  otp: string
): Promise<{ message: string; phoneVerified: boolean }> => {
  const response = await apiClient.post<
    ApiResponse<{ message: string; phoneVerified: boolean }>
  >("/enterprise/phone/verify-otp", { phone, otp })
  return response.data.data
}

/** Wraps the OTP send/verify so the modal can no-op safely in demo mode. */
export interface PhoneOtpService {
  send: (phone: string) => Promise<{ message: string; demo?: boolean }>
  verify: (phone: string, otp: string) => Promise<{ phoneVerified: boolean; demo?: boolean }>
}

const DEMO_OTP = "123456"

export function createPhoneOtpService(authed: boolean): PhoneOtpService {
  if (authed) {
    return {
      send: async (phone) => sendPhoneOtp(phone),
      verify: async (phone, otp) => verifyPhoneOtp(phone, otp),
    }
  }

  return {
    send: async () => {
      await new Promise((r) => setTimeout(r, 700))
      return { message: `Demo mode — use OTP ${DEMO_OTP}.`, demo: true }
    },
    verify: async (_phone, otp) => {
      await new Promise((r) => setTimeout(r, 700))
      if (otp !== DEMO_OTP) {
        const err = new Error(`Demo OTP is ${DEMO_OTP}.`)
        throw err
      }
      return { phoneVerified: true, demo: true }
    },
  }
}

export { DEMO_OTP }
