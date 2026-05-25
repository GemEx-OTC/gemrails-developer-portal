"use client"

import { useState } from "react"
import { Bell, CreditCard, RefreshCw, Shield, User } from "lucide-react"
import { BankAccountSettingsForm } from "@/components/bank-account-settings-form"
import { ChangePasswordForm } from "@/components/change-password-form"
import { NotificationSettingsForm } from "@/components/notification-settings-form"
import { ProfileSettingsForm } from "@/components/profile-settings-form"
import { SuccessToast } from "@/components/success-toast"
import { useProfileSettings } from "@/lib/hooks/use-profile-settings"
import { hasAuthSession, shouldCallLiveApi } from "@/lib/demo-auth-config"
import { cn } from "@/lib/utils"

type SettingsTab = "profile" | "bank" | "security"

const SOURCE_HINT: Record<string, string> = {
  api: "Loaded from GET /auth/profile",
  demo: "Demo mode — profile, bank, and notifications persist in this browser",
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("profile")
  const {
    user,
    source,
    isLoading,
    isSaving,
    isLogoBusy,
    isBankSaving,
    isNotificationsSaving,
    isPasswordSaving,
    notificationSettings,
    error,
    refetch,
    saveProfile,
    saveLogo,
    removeLogo,
    saveBank,
    saveNotifications,
    updatePassword,
  } = useProfileSettings()
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 5000)
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Business profile", icon: User },
    { id: "bank", label: "Bank account", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Profile, settlements, notifications, and password
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={isLoading}
          className="gemrails-button-outline inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-transparent text-gray-400 hover:bg-muted/50 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="gemrails-card flex min-h-[320px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : user ? (
        <section className="gemrails-card max-w-3xl">
          {tab === "profile" && (
            <ProfileSettingsForm
              user={user}
              isSaving={isSaving}
              isLogoBusy={isLogoBusy}
              onSaveProfile={async (input) => {
                const result = await saveProfile(input)
                showToast(
                  result.demo
                    ? "Profile saved (demo — stored locally)."
                    : "Business profile updated."
                )
              }}
              onSaveLogo={async (dataUrl) => {
                const result = await saveLogo(dataUrl)
                showToast(
                  result.demo ? "Logo saved (demo — stored locally)." : "Logo uploaded."
                )
              }}
              onRemoveLogo={async () => {
                const result = await removeLogo()
                showToast(result.demo ? "Logo removed (demo)." : "Logo removed.")
              }}
            />
          )}

          {tab === "bank" && (
            <BankAccountSettingsForm
              user={user}
              isSaving={isBankSaving}
              onSave={async (account) => {
                const result = await saveBank(account)
                showToast(
                  result.demo
                    ? "Bank account saved (demo — stored locally)."
                    : "Bank account updated for Naira settlements."
                )
              }}
            />
          )}

          {tab === "security" && (
            <div className="space-y-10">
              <NotificationSettingsForm
                settings={notificationSettings}
                isSaving={isNotificationsSaving}
                onSave={async (settings) => {
                  const result = await saveNotifications(settings)
                  showToast(
                    result.demo
                      ? "Notification preferences saved (demo)."
                      : "Notification preferences updated."
                  )
                }}
              />

              <div className="border-t border-border pt-10">
                <ChangePasswordForm
                  disabled={!hasAuthSession()}
                  isSaving={isPasswordSaving}
                  onChangePassword={async (input) => {
                    await updatePassword(input)
                    showToast("Password updated successfully.")
                  }}
                />
              </div>

              {!shouldCallLiveApi() && (
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <Bell className="h-3.5 w-3.5" />
                  Notifications work in demo; password change requires sign-in.
                </p>
              )}
            </div>
          )}

          <p className="mt-6 text-xs text-gray-500">{SOURCE_HINT[source]}</p>
          {error && <p className="mt-2 text-xs text-amber-400/90">{error}</p>}
          {!shouldCallLiveApi() && tab === "bank" && (
            <p className="mt-2 text-xs text-gray-500">
              Demo: name resolves from your business name after 10 digits. Use account{" "}
              <code className="text-emerald-400/80">0000000000</code> to test failure.
            </p>
          )}
          {!shouldCallLiveApi() && tab === "profile" && (
            <p className="mt-2 text-xs text-gray-500">
              Signed-out demo: logo is cropped to JPEG and stored as Base64 in localStorage.
            </p>
          )}
        </section>
      ) : (
        <div className="gemrails-card py-12 text-center text-sm text-muted-foreground">
          Unable to load profile.
        </div>
      )}

      <SuccessToast message={toast ?? ""} open={!!toast} onClose={() => setToast(null)} />
    </div>
  )
}
