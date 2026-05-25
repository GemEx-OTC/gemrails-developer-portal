"use client"

import { useEffect, useState } from "react"
import { Building2, Loader2, Mail, MapPin, Save, User as UserIcon } from "lucide-react"
import { BusinessLogoUploader } from "@/components/business-logo-uploader"
import type { UpdateProfileInput, User as ProfileUser } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface ProfileSettingsFormProps {
  user: ProfileUser
  disabled?: boolean
  isSaving?: boolean
  isLogoBusy?: boolean
  onSaveProfile: (input: UpdateProfileInput) => Promise<void>
  onSaveLogo: (dataUrl: string) => Promise<void>
  onRemoveLogo: () => Promise<void>
}

function ReadOnlyField({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon: React.ElementType
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <div className="relative mt-1.5">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={value}
          readOnly
          className="gemrails-input cursor-not-allowed bg-muted/40 pl-10 text-muted-foreground"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

export function ProfileSettingsForm({
  user,
  disabled,
  isSaving,
  isLogoBusy,
  onSaveProfile,
  onSaveLogo,
  onRemoveLogo,
}: ProfileSettingsFormProps) {
  const [businessName, setBusinessName] = useState(user.businessName ?? "")
  const [businessAddress, setBusinessAddress] = useState(user.businessAddress ?? "")
  const [contactName, setContactName] = useState(user.contactName ?? "")
  const [phone, setPhone] = useState(user.phone ?? "")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setBusinessName(user.businessName ?? "")
    setBusinessAddress(user.businessAddress ?? "")
    setContactName(user.contactName ?? "")
    setPhone(user.phone ?? "")
  }, [user])

  const locked = disabled || isSaving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!businessName.trim()) {
      setFormError("Business name is required.")
      return
    }
    if (!businessAddress.trim()) {
      setFormError("Business address is required.")
      return
    }
    if (!contactName.trim()) {
      setFormError("Contact name is required.")
      return
    }
    if (!phone.trim()) {
      setFormError("Phone number is required.")
      return
    }

    try {
      await onSaveProfile({
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
      })
    } catch {
      /* parent sets error */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <BusinessLogoUploader
        logo={user.businessLogo}
        businessName={businessName}
        disabled={locked}
        busy={isLogoBusy}
        onSave={onSaveLogo}
        onRemove={onRemoveLogo}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
        <ReadOnlyField
          label="Email"
          value={user.email}
          hint="Account email cannot be changed here."
          icon={Mail}
        />
        {user.rcNumber ? (
          <ReadOnlyField
            label="Registration number"
            value={user.rcNumber}
            hint={user.cacVerified ? "Verified with CAC — not editable." : "Submitted for verification."}
            icon={Building2}
          />
        ) : (
          <div className="flex items-end">
            <p className="text-xs text-gray-500">
              RC/BN number appears here after Tier 2 CAC verification.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Business details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="business-name" className="text-xs font-medium text-gray-500">
              Business name
            </label>
            <div className="relative mt-1.5">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                id="business-name"
                type="text"
                value={businessName}
                disabled={locked}
                onChange={(e) => {
                  setBusinessName(e.target.value)
                  setFormError(null)
                }}
                className="gemrails-input pl-10 text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="business-address" className="text-xs font-medium text-gray-500">
              Business address
            </label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <textarea
                id="business-address"
                rows={3}
                value={businessAddress}
                disabled={locked}
                onChange={(e) => {
                  setBusinessAddress(e.target.value)
                  setFormError(null)
                }}
                className="gemrails-input resize-none pl-10 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="text-xs font-medium text-gray-500">
              Contact name
            </label>
            <div className="relative mt-1.5">
              <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                id="contact-name"
                type="text"
                value={contactName}
                disabled={locked}
                onChange={(e) => {
                  setContactName(e.target.value)
                  setFormError(null)
                }}
                className="gemrails-input pl-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="text-xs font-medium text-gray-500">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              disabled={locked}
              onChange={(e) => {
                setPhone(e.target.value)
                setFormError(null)
              }}
              placeholder="+2348012345678"
              className="gemrails-input mt-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {formError && (
        <p className="text-sm text-red-400" role="alert">
          {formError}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-6">
        <button
          type="submit"
          disabled={locked}
          className={cn("gemrails-button gap-2 text-sm", locked && "opacity-50")}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save profile
            </>
          )}
        </button>
      </div>
    </form>
  )
}
