import type { ApiError } from "./types"

/** Extract a user-facing message from an unknown error from axios/apiClient. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as ApiError).message
    if (typeof message === "string" && message.length > 0) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as ApiError).code
    if (typeof code === "string") return code
  }
  return undefined
}
