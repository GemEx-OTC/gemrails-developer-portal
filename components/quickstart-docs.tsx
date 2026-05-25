"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  KeyRound,
  Package,
  Settings2,
  TestTube2,
  Webhook,
} from "lucide-react"
import { CopyCommand } from "@/components/copy-command"
import { GradientButton } from "@/components/gradient-button"

const SETUP_STEPS = [
  {
    step: 1,
    icon: Package,
    title: "Install the SDK",
    description: "Add the official client to your app with npm or Bun.",
    commands: [
      { label: "npm", command: "npm install @gemrails/sdk" },
      { label: "bun", command: "bun add @gemrails/sdk" },
    ],
  },
  {
    step: 2,
    icon: Settings2,
    title: "Configure environment variables",
    description: "Use sandbox keys first. Never commit secret keys to git.",
    commands: [
      {
        label: ".env.local",
        command: "GEMRAILS_SECRET_KEY=sk_test_...\nGEMRAILS_API_URL=https://api.gemrails.com",
      },
    ],
  },
  {
    step: 3,
    icon: TestTube2,
    title: "Test in sandbox",
    description: "Create keys in the dashboard, initiate a test payment, and confirm webhooks.",
    commands: [
      { label: "Run dev server", command: "npm run dev" },
    ],
  },
]

const DOC_LINKS = [
  {
    icon: BookOpen,
    title: "API Reference",
    description: "REST endpoints, request bodies, and response schemas for payments and auth.",
    href: "#docs",
    anchor: "docs",
  },
  {
    icon: KeyRound,
    title: "Authentication",
    description: "Bearer tokens, refresh flow, and sandbox vs live key prefixes.",
    href: "#quickstart",
    anchor: "quickstart",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Event types, signature verification with X-GemRails-Signature, and retries.",
    href: "#webhooks",
    anchor: "webhooks",
  },
]

export function QuickstartDocs() {
  return (
    <>
      <section
        id="quickstart"
        className="scroll-mt-24 border-t border-[#1f2937] bg-background py-16 md:py-24"
      >
        <div className="dev-container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 md:mb-12"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Quickstart in three steps
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              From install to your first sandbox transaction — copy commands and follow the
              checklist below.
            </p>
          </motion.div>

          <div className="space-y-8">
            {SETUP_STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-xl border border-[#1f2937] bg-[#111419] p-6 md:p-8"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                    <div className="flex shrink-0 gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-400">
                        {step.step}
                      </span>
                      <div className="rounded-lg bg-emerald-500/10 p-3 md:hidden">
                        <Icon className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="hidden items-center gap-3 md:flex">
                        <div className="rounded-lg bg-emerald-500/10 p-2.5">
                          <Icon className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground md:hidden">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                      <div className="mt-5 space-y-3">
                        {step.commands.map((cmd) =>
                          cmd.command.includes("\n") ? (
                            <div key={cmd.label} className="space-y-1.5">
                              <p className="text-xs font-medium text-gray-500">{cmd.label}</p>
                              <pre className="overflow-x-auto rounded-xl border border-[#1f2937] bg-[#0d1117] p-4 font-mono text-sm leading-relaxed text-gray-300">
                                {cmd.command}
                              </pre>
                            </div>
                          ) : (
                            <CopyCommand
                              key={cmd.command}
                              label={cmd.label}
                              command={cmd.command}
                            />
                          )
                        )}
                      </div>
                      {step.step === 3 && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          <GradientButton href="/auth/signup" className="text-sm">
                            Get sandbox keys
                          </GradientButton>
                          <Link
                            href="/dashboard"
                            className="gemrails-button-outline inline-flex items-center gap-2 text-sm"
                          >
                            Open dashboard
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="docs" className="scroll-mt-24 border-t border-[#1f2937] py-16 md:py-20">
        <div className="dev-container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Documentation</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Entry points into the API — full reference site can be linked here when published.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {DOC_LINKS.map((doc, i) => {
              const Icon = doc.icon
              return (
                <motion.a
                  key={doc.title}
                  href={doc.href}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group rounded-xl border border-[#1f2937] bg-[#111419] p-6 transition-colors hover:border-emerald-500/30"
                >
                  <Icon className="mb-4 h-8 w-8 text-emerald-400 transition-transform group-hover:scale-105" />
                  <h3 className="font-semibold text-foreground">{doc.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-emerald-400">
                    Read more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </motion.a>
              )
            })}
          </div>
        </div>
      </section>

      <section id="webhooks" className="scroll-mt-24 border-t border-[#1f2937] bg-muted/20 py-12 md:py-16">
        <div className="dev-container">
          <div className="rounded-xl border border-[#1f2937] bg-[#111419] p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Webhook integration</h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Subscribe to <code className="text-emerald-400/90">transaction.initiated</code>,{" "}
                <code className="text-emerald-400/90">transaction.settled</code>, and{" "}
                <code className="text-emerald-400/90">transaction.failed</code>. Verify payloads
                with your webhook secret.
              </p>
            </div>
            <Link
              href="#sdk"
              className="gemrails-button-secondary mt-4 inline-flex shrink-0 md:mt-0"
            >
              See initiate example
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
