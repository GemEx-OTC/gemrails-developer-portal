"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Circle, ListChecks } from "lucide-react"
import { useOnboardingProgress } from "@/lib/hooks/use-onboarding-progress"
import { ONBOARDING_TASKS } from "@/lib/onboarding-tasks"
import { cn } from "@/lib/utils"

export function QuickstartChecklist() {
  const { completion, isLoading, isDemo, completed, total, percent, refetch } =
    useOnboardingProgress()

  if (isLoading || !completion) {
    return (
      <div className="gemrails-card flex min-h-[180px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  const allDone = completed === total

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="gemrails-card"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <ListChecks className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Quickstart checklist</h2>
            <p className="text-sm text-muted-foreground">
              {allDone
                ? "You're ready for production — great work!"
                : `${completed} of ${total} steps complete`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="text-xs text-gray-500 underline-offset-2 hover:text-emerald-400 hover:underline"
        >
          Refresh progress
        </button>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-xs font-medium">
          <span className="text-muted-foreground">Integration progress</span>
          <span className="tabular-nums text-emerald-400">{percent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {ONBOARDING_TASKS.map((task, index) => {
          const done = completion[task.id]
          return (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-[#1f2937] p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
                done ? "bg-emerald-500/5" : "bg-[#0d1117]/50"
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
                )}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-medium",
                      done ? "text-gray-400 line-through" : "text-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>
                </div>
              </div>
              {!done && (
                <Link
                  href={task.href}
                  className="gemrails-button-secondary inline-flex shrink-0 items-center gap-1.5 self-start text-sm sm:self-center"
                >
                  {task.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </motion.li>
          )
        })}
      </ul>

      {isDemo && (
        <p className="mt-4 text-xs text-gray-500">
          Sign in to track your real verification and integration progress.
        </p>
      )}
    </motion.section>
  )
}
