"use client"

import { useEffect, useState } from "react"
import { CreditCard, Loader2, Save, ShieldCheck } from "lucide-react"
import { BankSelector } from "@/components/bank-selector"
import { VerifiedAccountNameBadge } from "@/components/verified-account-name-badge"
import { useDebouncedBankVerify } from "@/lib/hooks/use-debounced-bank-verify"
import { NIGERIAN_BANKS, getBankByCode } from "@/lib/nigerian-banks"
import type { BankAccount, User } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface BankAccountSettingsFormProps {
  user: User
  disabled?: boolean
  isSaving?: boolean
  onSave: (account: BankAccount) => Promise<void>
}

export function BankAccountSettingsForm({
  user,
  disabled,
  isSaving,
  onSave,
}: BankAccountSettingsFormProps) {
  const existing = user.bankAccount
  const [bankCode, setBankCode] = useState(existing?.bankCode ?? "")
  const [bankName, setBankName] = useState(existing?.bankName ?? "")
  const [accountNumber, setAccountNumber] = useState(existing?.accountNumber ?? "")
  const [formError, setFormError] = useState<string | null>(null)

  const digits = accountNumber.replace(/\D/g, "")
  const { accountName: resolvedName, isVerifying, error: verifyError } = useDebouncedBankVerify({
    bankCode,
    accountNumber: digits,
    businessName: user.businessName,
  })

  const matchesSaved =
    existing &&
    existing.bankCode === bankCode &&
    existing.accountNumber === digits &&
    digits.length === 10

  const accountName = resolvedName ?? (matchesSaved ? existing.accountName : null)

  useEffect(() => {
    if (existing) {
      setBankCode(existing.bankCode)
      setBankName(existing.bankName)
      setAccountNumber(existing.accountNumber)
    }
  }, [existing?.bankCode, existing?.accountNumber, existing?.bankName])

  const handleBankChange = (code: string, name: string) => {
    setBankCode(code)
    setBankName(name)
    setFormError(null)
  }

  const handleAccountChange = (value: string) => {
    setAccountNumber(value.replace(/\D/g, "").slice(0, 10))
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!bankCode) {
      setFormError("Select a bank.")
      return
    }
    if (digits.length !== 10) {
      setFormError("Account number must be exactly 10 digits.")
      return
    }
    if (!accountName) {
      setFormError(verifyError ?? "Wait for account name verification before saving.")
      return
    }

    const resolvedBankName = bankName || getBankByCode(bankCode)?.name || ""
    try {
      await onSave({
        bankCode,
        bankName: resolvedBankName,
        accountNumber: digits,
        accountName,
        isVerified: true,
      })
    } catch {
      /* parent handles */
    }
  }

  const locked = disabled || isSaving
  const canSubmit = !!bankCode && digits.length === 10 && !!accountName && !isVerifying

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {existing?.isVerified && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-foreground">Settlement account on file</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {existing.bankName} · {existing.accountNumber} · {existing.accountName}
            </p>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Naira settlements are sent to this account. The name must match your registered business.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500">Bank</label>
          <div className="mt-1.5">
            <BankSelector
              value={bankCode}
              onChange={handleBankChange}
              banks={[...NIGERIAN_BANKS]}
              disabled={locked}
            />
          </div>
        </div>

        <div>
          <label htmlFor="account-number" className="text-xs font-medium text-gray-500">
            Account number
          </label>
          <div className="relative mt-1.5">
            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              id="account-number"
              type="text"
              inputMode="numeric"
              value={accountNumber}
              disabled={locked}
              onChange={(e) => handleAccountChange(e.target.value)}
              placeholder="10-digit NUBAN"
              className="gemrails-input pl-10 font-mono text-sm tracking-wider"
              autoComplete="off"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            {digits.length}/10 digits
            {digits.length === 10 && bankCode ? " — verifying…" : ""}
          </p>
        </div>

        <VerifiedAccountNameBadge
          accountName={accountName}
          isVerifying={isVerifying}
          error={verifyError}
        />
      </div>

      {formError && (
        <p className="text-sm text-red-400" role="alert">
          {formError}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-6">
        <button
          type="submit"
          disabled={locked || !canSubmit}
          className={cn("gemrails-button gap-2 text-sm", (locked || !canSubmit) && "opacity-50")}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save bank account
            </>
          )}
        </button>
      </div>
    </form>
  )
}
