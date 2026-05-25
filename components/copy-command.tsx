"use client"

import { useCallback, useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CopyCommandProps {
  command: string
  label?: string
  className?: string
}

export function CopyCommand({ command, label, className }: CopyCommandProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [command])

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <p className="text-xs font-medium text-gray-500">{label}</p>}
      <div className="flex items-center gap-2 rounded-xl border border-[#1f2937] bg-[#0d1117] pr-2 pl-4">
        <code className="min-w-0 flex-1 py-3 font-mono text-sm text-emerald-400/95">{command}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          aria-label={`Copy: ${command}`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}
