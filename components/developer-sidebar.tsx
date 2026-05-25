"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  BarChart3,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { logout } from "@/lib/api/auth"
import { hasAuthSession } from "@/lib/demo-auth-config"

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
}

const mainItems: MenuItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "KYC", href: "/dashboard/kyc", icon: ShieldCheck },
]

const generalItems: MenuItem[] = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
]

function SidebarItem({ item, isActive }: { item: MenuItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
          isActive
            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="flex-1">{item.name}</span>
        {isActive && (
          <motion.div
            layoutId="developerActiveIndicator"
            className="absolute top-0 bottom-0 left-0 w-1 rounded-r bg-emerald-500"
          />
        )}
      </motion.div>
    </Link>
  )
}

function isPathActive(currentPath: string, href: string) {
  if (href === "/dashboard") return currentPath === "/dashboard"
  return currentPath === href || currentPath.startsWith(`${href}/`)
}

interface DeveloperSidebarProps {
  currentPath: string
}

export function DeveloperSidebar({ currentPath }: DeveloperSidebarProps) {
  const router = useRouter()
  const authed = hasAuthSession()

  const handleSignOut = async () => {
    await logout()
    router.push("/auth/login")
  }

  return (
    <aside className="hidden h-full w-64 flex-shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <BrandLogo variant="small" size={36} />
        <div>
          <p className="text-sm font-semibold tracking-wide text-foreground">GEMRAILS</p>
          <p className="text-xs text-muted-foreground">Developer Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Integration
        </p>
        {mainItems.map((item) => (
          <SidebarItem key={item.href} item={item} isActive={isPathActive(currentPath, item.href)} />
        ))}

        <p className="mt-6 mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Account
        </p>
        {generalItems.map((item) => (
          <SidebarItem key={item.href} item={item} isActive={isPathActive(currentPath, item.href)} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-border p-4">
        {authed ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-emerald-400 transition-colors hover:bg-emerald-500/10"
          >
            <LogIn className="h-5 w-5" />
            Sign in
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-gray-800/50 hover:text-white"
        >
          Back to site
        </Link>
      </div>
    </aside>
  )
}
