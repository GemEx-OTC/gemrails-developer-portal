"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type GradientButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

/** Primary CTA — emerald→teal gradient with hover glow (DEV-101) */
export function GradientButton({ href, children, className, icon }: GradientButtonProps) {
  return (
    <Link href={href} className={cn("group inline-flex", className)}>
      <motion.span
        className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold text-white"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      >
        <span
          className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 bg-[length:200%_100%] transition-[background-position] duration-500 ease-out group-hover:bg-[position:100%_0]"
          aria-hidden
        />
        <span className="absolute inset-0 rounded-xl opacity-0 shadow-lg shadow-emerald-500/30 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative flex items-center gap-2">
          {children}
          {icon}
        </span>
      </motion.span>
    </Link>
  )
}
