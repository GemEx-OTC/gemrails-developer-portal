"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Sparkles } from "lucide-react"
import { GradientButton } from "@/components/gradient-button"

export function LandingHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden py-16 sm:py-20 md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute top-32 right-0 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl md:right-[10%]" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-600/10 blur-3xl md:left-[8%]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="dev-container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400"
          >
            <Sparkles className="h-4 w-4" />
            Payments API · Sandbox & Live keys
          </motion.div>

          <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Accept Crypto, Receive Instantly in Naira.{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              SDK Built for Developers.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Integrate USDT & USDC checkout with instant Naira settlement. REST API, webhooks,
            and client libraries — ship in hours, not weeks.
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <GradientButton
              href="/auth/signup"
              icon={<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              className="w-full sm:w-auto"
            >
              Get API Keys
            </GradientButton>
            <Link
              href="#docs"
              className="gemrails-button-outline inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <BookOpen className="h-4 w-4" />
              Read the docs
            </Link>
          </div>

          <p className="mt-8 text-xs text-gray-500 sm:text-sm">
            No crypto expertise required · TRC-20 & BSC · Signed webhooks
          </p>
        </motion.div>
      </div>
    </section>
  )
}
