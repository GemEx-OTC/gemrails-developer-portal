"use client"

import { motion } from "framer-motion"
import {
  Cpu,
  Gift,
  Layers,
  ShieldCheck,
  Webhook,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Instant Naira conversion",
    description:
      "USDT and USDC payments settle to Naira automatically. Live rates with buffer applied at initiation — no manual FX steps.",
  },
  {
    icon: Cpu,
    title: "Hot wallet per transaction",
    description:
      "Tatum-powered deposit addresses generated for every payment. Merchants never hold crypto or pay gas — we handle chain ops end-to-end.",
  },
  {
    icon: Webhook,
    title: "Real-time webhooks",
    description:
      "Signed HTTP callbacks for initiated, settled, and failed events. Retry logs and test pings when you wire up the developer dashboard.",
  },
]

const feeItems = [
  {
    icon: Layers,
    label: "Rate buffer",
    amount: "₦1,500",
    detail: "Added to the quoted exchange rate at payment initiation for volatility protection.",
  },
  {
    icon: ShieldCheck,
    label: "Platform fee",
    amount: "₦1,000",
    detail: "Flat fee per successful transaction covering rails, compliance, and infrastructure.",
  },
  {
    icon: Gift,
    label: "Merchant bonus",
    amount: "₦50",
    detail: "Credited to the merchant on every settled payout — on top of the Naira settlement.",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function ValuePropositions() {
  return (
    <section className="border-t border-[#1f2937] bg-background py-16 md:py-24">
      <div className="dev-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-14"
        >
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Built for production payments
          </h2>
          <p className="mt-3 text-muted-foreground">
            Transparent pricing, automated wallets, and instant fiat settlement — exposed through
            a single REST API.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.title}
                variants={item}
                whileHover={{ y: -4 }}
                className="rounded-xl border border-[#1f2937] bg-[#111419] p-6 transition-shadow hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-emerald-500/10 p-3">
                  <Icon className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.article>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16"
        >
          <div className="mb-8 text-center">
            <h3 className="text-xl font-semibold text-foreground">Fee structure</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Clear, predictable costs on every successful transaction
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            {feeItems.map((fee) => {
              const Icon = fee.icon
              return (
                <motion.div
                  key={fee.label}
                  variants={item}
                  className="rounded-xl border border-[#1f2937] bg-[#111419] p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-lg bg-teal-500/10 p-2.5">
                      <Icon className="h-5 w-5 text-teal-400" />
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-emerald-400">
                      {fee.amount}
                    </p>
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">{fee.label}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {fee.detail}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Plus ₦50 merchant payout bonus on each settlement — included in the API response as{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-emerald-400/90">
              merchantBonusNgn
            </code>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
