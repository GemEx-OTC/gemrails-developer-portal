import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import type { ApiError } from "./types"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_GEMRAILS_API_BASE_URL || "http://localhost:4000"
export const API_PREFIX = "/api/v1"

const ACCESS_TOKEN_KEY = "token"
const REFRESH_TOKEN_KEY = "refreshToken"

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json",
  },
})

let accessToken: string | null = null
let refreshToken: string | null = null

export const setTokens = (access: string, refresh: string) => {
  accessToken = access
  refreshToken = refresh
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  }
}

export const getTokens = () => {
  if (typeof window !== "undefined" && !accessToken) {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return { accessToken, refreshToken }
}

export const clearTokens = () => {
  accessToken = null
  refreshToken = null
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export const isAuthenticated = () => !!getTokens().accessToken

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken: token } = getTokens()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (
    error: AxiosError<{
      error?: { message?: string; code?: string; name?: string }
      message?: string
    }>
  ) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url || ""
      if (
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/refresh-token")
      ) {
        return Promise.reject(transformError(error))
      }

      originalRequest._retry = true
      const { refreshToken: refresh } = getTokens()

      if (refresh) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}${API_PREFIX}/auth/refresh-token`,
            { refreshToken: refresh }
          )

          const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data
          setTokens(newAccess, newRefresh)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
          }
          return apiClient(originalRequest)
        } catch {
          clearTokens()
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login"
          }
        }
      }
    }

    return Promise.reject(transformError(error))
  }
)

function transformError(
  error: AxiosError<{
    error?: { message?: string; code?: string; name?: string }
    message?: string
  }>
): ApiError {
  const errorData = error.response?.data?.error
  let message =
    errorData?.message ||
    error.response?.data?.message ||
    error.message ||
    "An error occurred"

  if (errorData?.name === "ZodError" && errorData?.message) {
    try {
      const zodErrors = JSON.parse(errorData.message) as { message: string }[]
      if (Array.isArray(zodErrors) && zodErrors.length > 0) {
        message = zodErrors[0].message
      }
    } catch {
      message = errorData.message
    }
  }

  return {
    message,
    code: errorData?.code,
    statusCode: error.response?.status,
  }
}

export default apiClient
