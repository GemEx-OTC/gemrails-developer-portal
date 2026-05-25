import { getApiKeys, regenerateApiKeys } from "./developer"
import type { ApiKeyEnvironment, DeveloperApiKeys } from "./types"

function createMockKeys(environment: ApiKeyEnvironment, rotated = false): DeveloperApiKeys {
  const tag = environment === "sandbox" ? "test" : "live"
  const base = environment === "sandbox" ? "7f3a9c1b4e7d" : "9k2m8p4q1w6x"
  const suffix = rotated ? `${base}_${Date.now().toString(36).slice(-6)}` : base
  return {
    environment,
    publicKey: `pk_${tag}_${suffix}pub`,
    secretKey: `sk_${tag}_${suffix}sec`,
    createdAt: new Date().toISOString(),
  }
}

export async function fetchApiKeys(
  environment: ApiKeyEnvironment
): Promise<{ keys: DeveloperApiKeys; source: "api" | "mock" }> {
  try {
    const keys = await getApiKeys(environment)
    return { keys, source: "api" }
  } catch {
    return { keys: createMockKeys(environment), source: "mock" }
  }
}

export function maskSecret(secret: string): string {
  return "•".repeat(Math.min(Math.max(secret.length, 32), 48))
}

export async function regenerateKeys(
  environment: ApiKeyEnvironment
): Promise<{ keys: DeveloperApiKeys; source: "api" | "mock" }> {
  try {
    const keys = await regenerateApiKeys({ environment })
    return { keys, source: "api" }
  } catch {
    await new Promise((r) => setTimeout(r, 1400))
    return { keys: createMockKeys(environment, true), source: "mock" }
  }
}
