import { isAuthenticated } from "./client"
import { verifyCac, verifyCacDocument, type KycVerifyResponse } from "./kyc"

export type CacSubmitSource = "api" | "demo"

export async function submitCacVerification(
  formData: FormData
): Promise<{ result: KycVerifyResponse; source: CacSubmitSource }> {
  if (!isAuthenticated()) {
    await new Promise((r) => setTimeout(r, 1200))
    const rc = formData.get("rcNumber")
    const doc = formData.get("document")
    if (!rc || typeof rc !== "string") {
      throw new Error("RC/BN number is required")
    }
    if (!doc) {
      throw new Error("CAC document is required")
    }
    return {
      result: {
        message: "Submitted — checking CAC registry…",
        status: "pending",
        jobId: "demo_cac_job",
      },
      source: "demo",
    }
  }

  try {
    const result = await verifyCacDocument(formData)
    return { result, source: "api" }
  } catch {
    const result = await verifyCac(formData)
    return { result, source: "api" }
  }
}
