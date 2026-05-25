"use client"

import { useEffect, useState } from "react"
import { getProfile } from "@/lib/api/auth"
import { isAuthenticated } from "@/lib/api/client"
import { buildDemoUser, loadDemoLogo } from "@/lib/profile-storage"
import { getImageUrl } from "@/lib/utils/image"

interface DashboardBusinessAvatarProps {
  businessName?: string
  size?: "sm" | "md"
}

export function DashboardBusinessAvatar({
  businessName: nameProp,
  size = "md",
}: DashboardBusinessAvatarProps) {
  const [logo, setLogo] = useState<string | null>(null)
  const [name, setName] = useState(nameProp ?? "")

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!isAuthenticated()) {
        const demo = buildDemoUser()
        if (!cancelled) {
          setLogo(demo.businessLogo ?? loadDemoLogo())
          setName(nameProp ?? demo.businessName ?? "Business")
        }
        return
      }
      try {
        const profile = await getProfile()
        if (!cancelled) {
          setLogo(profile.businessLogo ?? loadDemoLogo())
          setName(nameProp ?? profile.businessName ?? "Business")
        }
      } catch {
        const demo = buildDemoUser()
        if (!cancelled) {
          setLogo(demo.businessLogo ?? null)
          setName(nameProp ?? demo.businessName ?? "Business")
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [nameProp])

  const src = getImageUrl(logo)
  const initials = (name.trim() || "G").charAt(0).toUpperCase()
  const dim = size === "sm" ? "h-9 w-9 text-sm" : "h-11 w-11 text-base"

  return (
    <div
      className={`${dim} shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-500/25`}
      title={name}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-bold text-white">
          {initials}
        </span>
      )}
    </div>
  )
}
