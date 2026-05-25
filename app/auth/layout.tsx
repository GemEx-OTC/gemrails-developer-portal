"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { AuthDemoBanner } from "@/components/auth-demo-banner"
import { BrandLogo } from "@/components/brand-logo"
import { Cpu, ShieldCheck, Webhook, Zap } from "lucide-react"

const FEATURES = [
  { icon: Zap, text: "Instant Naira settlement on every crypto payment" },
  { icon: Webhook, text: "Signed webhooks for transaction lifecycle events" },
  { icon: Cpu, text: "Per-transaction hot wallets — no gas fees for you" },
  { icon: ShieldCheck, text: "Tiered KYC with SmileID business verification" },
] as const

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 h-full w-full bg-gradient-to-br from-emerald-600/20 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 h-full w-full bg-gradient-to-tl from-teal-500/20 via-transparent to-transparent blur-3xl"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <div className="hidden flex-col justify-between border-r border-border/50 p-8 xl:p-12 lg:flex lg:w-1/2 xl:w-2/5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/" className="mb-12 flex items-center gap-3">
              <BrandLogo variant="large" size={48} priority />
              <div>
                <span className="text-xl font-bold text-foreground">GemRails</span>
                <p className="text-xs text-muted-foreground">Developer Portal</p>
              </div>
            </Link>

            <h1 className="max-w-md text-3xl font-bold leading-tight text-foreground xl:text-4xl">
              Build crypto payments.{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Settle in Naira.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              API keys, webhooks, and SDKs for developers who need USDT/USDC in and NGN out —
              without running wallets yourself.
            </p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 flex justify-center lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <BrandLogo variant="small" size={40} />
                <span className="text-lg font-bold text-foreground">GemRails Developers</span>
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur-sm sm:p-8">
              <AuthDemoBanner />
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
