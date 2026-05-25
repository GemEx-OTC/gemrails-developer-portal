"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { DeveloperSidebar } from "@/components/developer-sidebar"
import { DeveloperMobileNav } from "@/components/developer-mobile-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DeveloperSidebar currentPath={pathname} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center border-b border-border bg-card px-4 md:px-8 md:hidden">
          <span className="text-sm font-semibold">
            GemRails <span className="text-emerald-400">Developers</span>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="dev-container py-6 md:py-8">{children}</div>
        </main>
      </div>

      <DeveloperMobileNav />
    </div>
  )
}
