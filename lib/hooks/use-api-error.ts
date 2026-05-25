"use client"

import { useCallback } from "react"
import type { ApiError } from "@/lib/api/types"

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as ApiError).message)
  }
  if (error instanceof Error) return error.message
  return fallback
}

/** Normalize rejected API calls for UI toasts and forms */
export function useApiError() {
  return useCallback((error: unknown, fallback?: string) => getErrorMessage(error, fallback), [])
}
