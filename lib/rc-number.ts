/** Normalize RC/BN: uppercase, trim, prepend RC when value starts with a digit. */
export function normalizeRcNumber(input: string): string {
  let raw = input.trim().toUpperCase().replace(/\s+/g, "")
  if (/^\d/.test(raw)) {
    raw = `RC${raw}`
  }
  return raw
}

export function validateRcNumber(input: string): string | null {
  const value = normalizeRcNumber(input)
  if (!value) return "RC or BN registration number is required"
  if (!/^(RC|BN)[A-Z0-9]+$/.test(value)) {
    return "Number must start with RC or BN (e.g. RC1234567 or BN9876543)"
  }
  if (value.length < 4) return "Registration number is too short"
  return null
}
