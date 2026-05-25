"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, KeyRound, LayoutDashboard, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Keys", href: "/dashboard/api-keys", icon: KeyRound },
  { name: "Stats", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DeveloperMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-card safe-area-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                active ? "text-emerald-400" : "text-gray-500"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
