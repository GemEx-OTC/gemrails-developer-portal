"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { SdkDropdown, DOC_LINKS } from "@/components/sdk-dropdown"
import { GradientButton } from "@/components/gradient-button"

export function DeveloperHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="dev-container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={closeMobile}>
          <BrandLogo variant="small" size={36} priority />
          <span className="hidden font-semibold tracking-wide text-foreground sm:inline">
            GEMRAILS <span className="text-emerald-400">Developers</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex lg:gap-8">
          {DOC_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-emerald-400"
            >
              {link.label}
            </Link>
          ))}
          <SdkDropdown />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="gemrails-button-outline px-5 py-2.5 text-sm"
          >
            Sign In
          </Link>
          <GradientButton href="/auth/signup" className="text-sm">
            Get API Keys
          </GradientButton>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800/50 hover:text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border lg:hidden"
          >
            <div className="dev-container flex max-h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto py-4">
              <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Documentation
              </p>
              {DOC_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-gray-800/50 hover:text-emerald-400"
                  onClick={closeMobile}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-3 border-t border-border pt-3">
                <SdkDropdown variant="mobile" onNavigate={closeMobile} />
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Link
                  href="/auth/login"
                  className="gemrails-button-outline text-center text-sm"
                  onClick={closeMobile}
                >
                  Sign In
                </Link>
                <GradientButton href="/auth/signup" className="w-full [&_span]:w-full">
                  Get API Keys
                </GradientButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
