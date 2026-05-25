"use client"

import { useCallback, useEffect, useState } from "react"
import {
  changePassword,
  deleteLogo,
  getProfile,
  updateBankAccount,
  updateProfile,
  updateSettings,
  uploadLogo,
} from "@/lib/api/auth"
import { shouldCallLiveApi } from "@/lib/demo-auth-config"
import type {
  BankAccount,
  ChangePasswordInput,
  DeveloperNotificationSettings,
  UpdateProfileInput,
  User,
} from "@/lib/api/types"
import { DEFAULT_NOTIFICATION_SETTINGS } from "@/lib/api/types"
import {
  mergeUserSettings,
  parseNotificationSettings,
  toApiSettingsPayload,
} from "@/lib/notification-settings"
import {
  buildDemoUser,
  clearDemoLogo,
  dataUrlToFile,
  loadDemoBank,
  loadDemoLogo,
  saveDemoBank,
  saveDemoLogo,
  saveDemoNotificationSettings,
  saveDemoProfile,
} from "@/lib/profile-storage"

export type ProfileSource = "api" | "demo"

export function useProfileSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [source, setSource] = useState<ProfileSource>("demo")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLogoBusy, setIsLogoBusy] = useState(false)
  const [isBankSaving, setIsBankSaving] = useState(false)
  const [isNotificationsSaving, setIsNotificationsSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const notificationSettings =
    user?.settings ?? DEFAULT_NOTIFICATION_SETTINGS

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    if (!shouldCallLiveApi()) {
      setUser(buildDemoUser())
      setSource("demo")
      setIsLoading(false)
      return
    }

    try {
      const profile = await getProfile()
      const demoLogo = loadDemoLogo()
      const demoBank = loadDemoBank()
      setUser(
        mergeUserSettings(
          {
            ...profile,
            businessLogo: profile.businessLogo ?? demoLogo ?? undefined,
            bankAccount: profile.bankAccount ?? demoBank ?? undefined,
          },
          parseNotificationSettings(profile)
        )
      )
      setSource("api")
    } catch {
      setUser(buildDemoUser())
      setSource("demo")
      setError("Could not load profile — showing demo business profile.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveProfile = useCallback(
    async (input: UpdateProfileInput) => {
      setIsSaving(true)
      setError(null)
      try {
        if (!shouldCallLiveApi()) {
          await new Promise((r) => setTimeout(r, 600))
          saveDemoProfile(input)
          setUser((prev) => (prev ? { ...prev, ...input } : buildDemoUser()))
          return { demo: true as const }
        }
        const updated = await updateProfile(input)
        setUser(updated)
        return { demo: false as const }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to update profile"
        setError(message)
        throw e
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  const saveLogo = useCallback(async (croppedDataUrl: string) => {
    setIsLogoBusy(true)
    setError(null)
    try {
      if (!shouldCallLiveApi()) {
        await new Promise((r) => setTimeout(r, 500))
        saveDemoLogo(croppedDataUrl)
        setUser((prev) => (prev ? { ...prev, businessLogo: croppedDataUrl } : buildDemoUser()))
        return { demo: true as const }
      }
      const formData = new FormData()
      formData.append("logo", dataUrlToFile(croppedDataUrl))
      const updated = await uploadLogo(formData)
      setUser(updated)
      return { demo: false as const }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to upload logo"
      setError(message)
      throw e
    } finally {
      setIsLogoBusy(false)
    }
  }, [])

  const removeLogo = useCallback(async () => {
    setIsLogoBusy(true)
    setError(null)
    try {
      if (!shouldCallLiveApi()) {
        await new Promise((r) => setTimeout(r, 400))
        clearDemoLogo()
        setUser((prev) => (prev ? { ...prev, businessLogo: undefined } : buildDemoUser()))
        return { demo: true as const }
      }
      await deleteLogo()
      setUser((prev) => (prev ? { ...prev, businessLogo: undefined } : null))
      return { demo: false as const }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to remove logo"
      setError(message)
      throw e
    } finally {
      setIsLogoBusy(false)
    }
  }, [])

  const saveNotifications = useCallback(
    async (settings: DeveloperNotificationSettings) => {
      setIsNotificationsSaving(true)
      setError(null)
      try {
        if (!shouldCallLiveApi()) {
          await new Promise((r) => setTimeout(r, 500))
          saveDemoNotificationSettings(settings)
          setUser((prev) =>
            prev ? mergeUserSettings(prev, settings) : buildDemoUser()
          )
          return { demo: true as const }
        }
        const updated = await updateSettings(toApiSettingsPayload(settings))
        setUser(mergeUserSettings(updated, parseNotificationSettings(updated)))
        return { demo: false as const }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to update notifications"
        setError(message)
        throw e
      } finally {
        setIsNotificationsSaving(false)
      }
    },
    []
  )

  const updatePassword = useCallback(async (input: ChangePasswordInput) => {
    setIsPasswordSaving(true)
    setError(null)
    try {
      if (!shouldCallLiveApi()) {
        await changePassword(input)
        return { demo: true as const }
      }
      await changePassword(input)
      return { demo: false as const }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update password"
      setError(message)
      throw e
    } finally {
      setIsPasswordSaving(false)
    }
  }, [])

  const saveBank = useCallback(
    async (account: BankAccount) => {
      setIsBankSaving(true)
      setError(null)
      try {
        if (!shouldCallLiveApi()) {
          await new Promise((r) => setTimeout(r, 600))
          saveDemoBank(account)
          setUser((prev) => (prev ? { ...prev, bankAccount: account } : buildDemoUser()))
          return { demo: true as const }
        }
        const updated = await updateBankAccount({
          bankCode: account.bankCode,
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
        })
        setUser(updated)
        return { demo: false as const }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to update bank account"
        setError(message)
        throw e
      } finally {
        setIsBankSaving(false)
      }
    },
    []
  )

  return {
    user,
    setUser,
    source,
    isLoading,
    isSaving,
    isLogoBusy,
    isBankSaving,
    isNotificationsSaving,
    isPasswordSaving,
    notificationSettings,
    error,
    refetch: load,
    saveProfile,
    saveLogo,
    removeLogo,
    saveBank,
    saveNotifications,
    updatePassword,
  }
}
