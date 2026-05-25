export interface CountryCode {
  code: string
  iso: string
  label: string
  flag: string
  /** Local subscriber length without country code (used for soft validation) */
  localLength: number
}

/** Common country dial codes. Nigeria first since GemRails is NGN-native. */
export const COUNTRY_CODES: CountryCode[] = [
  { code: "+234", iso: "NG", label: "Nigeria", flag: "🇳🇬", localLength: 10 },
  { code: "+233", iso: "GH", label: "Ghana", flag: "🇬🇭", localLength: 9 },
  { code: "+254", iso: "KE", label: "Kenya", flag: "🇰🇪", localLength: 9 },
  { code: "+27", iso: "ZA", label: "South Africa", flag: "🇿🇦", localLength: 9 },
  { code: "+1", iso: "US", label: "United States", flag: "🇺🇸", localLength: 10 },
  { code: "+44", iso: "GB", label: "United Kingdom", flag: "🇬🇧", localLength: 10 },
  { code: "+91", iso: "IN", label: "India", flag: "🇮🇳", localLength: 10 },
  { code: "+971", iso: "AE", label: "UAE", flag: "🇦🇪", localLength: 9 },
]

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]

/** Returns just digits, stripped of leading zero. */
export function sanitizeLocalNumber(input: string): string {
  return input.replace(/\D/g, "").replace(/^0+/, "")
}

export function buildE164(country: CountryCode, localNumber: string): string {
  const local = sanitizeLocalNumber(localNumber)
  return `${country.code}${local}`
}

export function maskPhoneNumber(country: CountryCode, localNumber: string): string {
  const local = sanitizeLocalNumber(localNumber)
  if (local.length < 6) return `${country.code} ${local}`
  return `${country.code} ${local.slice(0, 3)}***${local.slice(-3)}`
}
