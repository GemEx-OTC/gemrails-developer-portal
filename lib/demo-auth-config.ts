import { getTokens } from "@/lib/api/client"

const DEMO_SESSION_KEY = "gemrails_demo_auth_session"

/**
 * Auth runs in demo mode unless NEXT_PUBLIC_USE_LIVE_AUTH=true.
 * Use demo mode to walk through signup / login / verify without the API.
 */
export function useLiveAuth(): boolean {
  return process.env.NEXT_PUBLIC_USE_LIVE_AUTH === "true"
}

export const DEMO_AUTH_OTP = "123456"

export function isDemoAuthSession(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(DEMO_SESSION_KEY) === "1"
}

export function markDemoAuthSession() {
  if (typeof window === "undefined") return
  localStorage.setItem(DEMO_SESSION_KEY, "1")
}

export function clearDemoAuthSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem(DEMO_SESSION_KEY)
}

/** True when dashboard hooks should call the real API (live auth + real tokens). */
export function shouldCallLiveApi(): boolean {
  return useLiveAuth() && !!getTokens().accessToken && !isDemoAuthSession()
}

/** Signed in for UI (demo or live). */
export function hasAuthSession(): boolean {
  return !!getTokens().accessToken
}
