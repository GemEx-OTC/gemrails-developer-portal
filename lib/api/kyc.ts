import apiClient from "./client"
import type { ApiResponse } from "./types"

export type KycVerifyResponse = {
  message: string
  tier?: number
  jobId?: string
  status?: "pending" | "success" | "failed"
}

export const verifyCacDocument = async (data: FormData): Promise<KycVerifyResponse> => {
  const response = await apiClient.post<ApiResponse<KycVerifyResponse>>(
    "/kyc/verify-cac-document",
    data,
    {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data.data
}

/** Legacy path — same handler on API */
export const verifyCac = async (data: FormData): Promise<KycVerifyResponse> => {
  const response = await apiClient.post<ApiResponse<KycVerifyResponse>>(
    "/kyc/verify/cac",
    data,
    {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data.data
}

export const getKycStatus = async (
  jobId: string
): Promise<{ status: "pending" | "success" | "failed"; message?: string; tier?: number }> => {
  const response = await apiClient.get<
    ApiResponse<{ status: "pending" | "success" | "failed"; message?: string; tier?: number }>
  >(`/kyc/status/${jobId}`)
  return response.data.data
}
