export const BUSINESS_CATEGORIES = [
  { value: "restaurant", label: "Restaurant & Food Service" },
  { value: "retail", label: "Retail & Shopping" },
  { value: "hospitality", label: "Hotels & Hospitality" },
  { value: "entertainment", label: "Entertainment & Events" },
  { value: "healthcare", label: "Healthcare & Pharmacy" },
  { value: "education", label: "Education & Training" },
  { value: "professional", label: "Professional Services" },
  { value: "other", label: "Other" },
] as const

export type BusinessCategoryValue = (typeof BUSINESS_CATEGORIES)[number]["value"]
