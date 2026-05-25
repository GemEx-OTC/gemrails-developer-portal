export type OnboardingTaskId =
  | "phone"
  | "cac"
  | "sandbox_keys"
  | "test_transaction"
  | "webhook"

export interface OnboardingTask {
  id: OnboardingTaskId
  title: string
  description: string
  href: string
  cta: string
}

export const ONBOARDING_TASKS: OnboardingTask[] = [
  {
    id: "phone",
    title: "Complete phone verification (Tier 1)",
    description: "Verify your phone number to unlock sandbox and live limits.",
    href: "/dashboard/kyc",
    cta: "Verify phone",
  },
  {
    id: "cac",
    title: "Upload business CAC docs (Tier 2)",
    description: "Submit RC/BN and CAC document for unlimited volume.",
    href: "/dashboard/kyc",
    cta: "Upload CAC",
  },
  {
    id: "sandbox_keys",
    title: "Generate sandbox API keys",
    description: "Create test keys to integrate without touching live money.",
    href: "/dashboard/api-keys",
    cta: "Get keys",
  },
  {
    id: "test_transaction",
    title: "Make a test transaction",
    description: "Run a sandbox payment and confirm the flow end-to-end.",
    href: "/#sdk",
    cta: "Try SDK",
  },
  {
    id: "webhook",
    title: "Set live webhook URL",
    description: "Register your HTTPS endpoint for payment event callbacks.",
    href: "/dashboard/api-keys",
    cta: "Set webhook",
  },
]

export type OnboardingCompletion = Record<OnboardingTaskId, boolean>

export function countCompleted(completion: OnboardingCompletion): number {
  return ONBOARDING_TASKS.filter((t) => completion[t.id]).length
}

export function progressPercent(completion: OnboardingCompletion): number {
  return Math.round((countCompleted(completion) / ONBOARDING_TASKS.length) * 100)
}

const STORAGE_KEY = "gemrails_dev_onboarding"

export function readLocalOnboardingFlags(): Partial<OnboardingCompletion> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<OnboardingCompletion>
  } catch {
    return {}
  }
}

export function setLocalOnboardingFlag(id: OnboardingTaskId, done: boolean) {
  if (typeof window === "undefined") return
  const current = readLocalOnboardingFlags()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, [id]: done }))
}

/** Demo state for signed-out dashboard preview */
export const DEMO_ONBOARDING: OnboardingCompletion = {
  phone: false,
  cac: false,
  sandbox_keys: true,
  test_transaction: false,
  webhook: false,
}
