import { isAuthenticated } from "./client"
import { verifyBankAccount } from "./auth"
import type { VerifyBankAccountInput, VerifyBankAccountResult } from "./types"

/** Demo: resolves account name from business name; `0000000000` simulates failure. */
export async function resolveBankAccountName(
  input: VerifyBankAccountInput,
  businessName?: string
): Promise<VerifyBankAccountResult> {
  if (!isAuthenticated()) {
    await new Promise((r) => setTimeout(r, 550))
    if (input.accountNumber === "0000000000") {
      throw new Error("Could not resolve account name for this account number.")
    }
    const base = (businessName?.trim() || "ACME PAYMENTS LTD").toUpperCase()
    return {
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      accountName: base.endsWith("LTD") ? base : `${base} LTD`,
    }
  }

  return verifyBankAccount(input)
}
