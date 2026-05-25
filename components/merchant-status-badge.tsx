"use client"

import { AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import type { User } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  NonNullable<User["merchantStatus"]>,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  verified: {
    label: "Verified",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending review",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: Clock,
  },
  suspended: {
    label: "Suspended",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: AlertTriangle,
  },
}

interface MerchantStatusBadgeProps {
  status?: User["merchantStatus"]
  className?: string
}

export function MerchantStatusBadge({ status = "pending", className }: MerchantStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const Icon = cfg.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        cfg.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  )
}
