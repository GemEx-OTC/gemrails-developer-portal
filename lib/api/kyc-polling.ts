import { isAuthenticated } from "./client"
import { getKycStatus } from "./kyc"

export type KycJobStatus = "pending" | "success" | "failed"

export interface KycJobStatusResult {
  status: KycJobStatus
  message?: string
  tier?: number
}

const demoAttemptCounts = new Map<string, number>()

/** Demo: succeeds after 3 polls; use jobId `demo_cac_fail` to simulate failure. */
async function fetchDemoKycStatus(jobId: string, attempt: number): Promise<KycJobStatusResult> {
  await new Promise((r) => setTimeout(r, 400))

  if (jobId === "demo_cac_fail") {
    if (attempt >= 2) {
      return {
        status: "failed",
        message: "RC number could not be matched in the CAC registry.",
      }
    }
    return { status: "pending", message: "Checking registry…" }
  }

  if (attempt >= 3) {
    return {
      status: "success",
      tier: 2,
      message: "Business verified with CAC registry.",
    }
  }

  return { status: "pending", message: "Authenticating with CAC registry…" }
}

export async function fetchKycJobStatus(
  jobId: string,
  attempt: number
): Promise<KycJobStatusResult> {
  if (!isAuthenticated()) {
    demoAttemptCounts.set(jobId, attempt)
    return fetchDemoKycStatus(jobId, attempt)
  }

  try {
    const result = await getKycStatus(jobId)
    return {
      status: result.status,
      message: result.message,
      tier: result.tier,
    }
  } catch {
    if (attempt >= 20) {
      return {
        status: "pending",
        message: "Still processing — check back shortly.",
      }
    }
    return { status: "pending" }
  }
}

export const KYC_POLL_INTERVAL_MS = 3000
export const KYC_POLL_MAX_ATTEMPTS = 20
